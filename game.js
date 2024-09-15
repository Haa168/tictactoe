const gridSize = 7;
let board = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
let currentPlayer = 'X';
let moveHistory = [];
let gameMode = localStorage.getItem('gameMode');  // 'ai' or 'twoPlayers'
let gameOver = false;

function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = ''; // Clear existing board
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = board[row][col];
            cell.dataset.row = row; // Add row and col data attributes
            cell.dataset.col = col;
            cell.addEventListener('click', () => makeMove(row, col));
            gameBoard.appendChild(cell);
        }
    }
}


function makeMove(row, col) {
    if (board[row][col] === '' && !gameOver) {
        board[row][col] = currentPlayer;
        moveHistory.push({ row, col, player: currentPlayer });

        if (checkWin(row, col)) {
            document.getElementById('message').textContent = `${currentPlayer} Wins!`;
            gameOver = true;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        renderBoard();

        // AI makes a move if in single-player mode and it's AI's turn
        if (gameMode === 'ai' && currentPlayer === 'O') {
            setTimeout(aiMove, 500);
        }
    }
}

function aiMove() {
    // Step 1: Check if AI can win in the next move
    let winningMove = findWinningMove('O');
    if (winningMove) {
        makeAIMove(winningMove);
        return;
    }

    // Step 2: Check if the player is about to win and block them
    let blockingMove = findWinningMove('X');
    if (blockingMove) {
        makeAIMove(blockingMove);
        return;
    }

    // Step 3: Prefer center or middle positions if available
    let strategicCenterMove = findCenterMove();
    if (strategicCenterMove) {
        makeAIMove(strategicCenterMove);
        return;
    }

    // Step 4: Look for the best offensive position to build 3 or 4 in a row
    let offensiveMove = findBestOffensiveMove();
    if (offensiveMove) {
        makeAIMove(offensiveMove);
        return;
    }

    // Step 5: Default to a strategic move if no immediate win or block is found
    let strategicMove = findStrategicMove();
    if (strategicMove) {
        makeAIMove(strategicMove);
    }
}

function findCenterMove() {
    const center = Math.floor(gridSize / 2);
    if (board[center][center] === '') {
        return { row: center, col: center };
    }

    // If the center is not available, check for nearby middle spots
    let nearCenterMoves = [
        { row: center - 1, col: center },
        { row: center + 1, col: center },
        { row: center, col: center - 1 },
        { row: center, col: center + 1 }
    ];

    for (let move of nearCenterMoves) {
        if (move.row >= 0 && move.col >= 0 && move.row < gridSize && move.col < gridSize && board[move.row][move.col] === '') {
            return move;
        }
    }

    return null;
}

function makeAIMove(move) {
    board[move.row][move.col] = 'O';
    moveHistory.push({ row: move.row, col: move.col, player: 'O' });
    if (checkWin(move.row, move.col)) {
        document.getElementById('message').textContent = 'O Wins!';
        gameOver = true;
        return;
    }
    currentPlayer = 'X';
    renderBoard();
}

function findWinningMove(player) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === '') {
                board[row][col] = player;
                if (checkWin(row, col)) {
                    board[row][col] = '';
                    return { row, col };
                }
                board[row][col] = '';
            }
        }
    }
    return null;
}

function findBestOffensiveMove() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === '') {
                board[row][col] = 'O';
                if (countInARow('O', row, col) >= 4) {  // Adjusted to look for 4 in a row
                    board[row][col] = '';
                    return { row, col };
                }
                board[row][col] = '';
            }
        }
    }
    return null;
}

function findStrategicMove() {
    const center = Math.floor(gridSize / 2);
    if (board[center][center] === '') {
        return { row: center, col: center };
    }

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === '') {
                return { row, col };
            }
        }
    }
    return null;
}

function countInARow(player, row, col) {
    const directions = [
        { x: 1, y: 0 },  // horizontal
        { x: 0, y: 1 },  // vertical
        { x: 1, y: 1 },  // diagonal right-down
        { x: 1, y: -1 }  // diagonal left-down
    ];

    const inBounds = (r, c) => r >= 0 && r < gridSize && c >= 0 && c < gridSize;
    let maxCount = 0;

    for (let { x, y } of directions) {
        let count = 1;

        // Check in both directions
        for (let i = 1; i < 5; i++) {
            if (inBounds(row + i * y, col + i * x) && board[row + i * y][col + i * x] === player) {
                count++;
            } else {
                break;
            }
        }
        for (let i = 1; i < 5; i++) {
            if (inBounds(row - i * y, col - i * x) && board[row - i * y][col - i * x] === player) {
                count++;
            } else {
                break;
            }
        }

        maxCount = Math.max(maxCount, count);
    }
    return maxCount;
}

function undoMove() {
    if (moveHistory.length > 0 && !gameOver) {
        const lastMove = moveHistory.pop();
        board[lastMove.row][lastMove.col] = '';
        currentPlayer = lastMove.player;
        renderBoard();
    }
}

function restartGame() {
    board = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    currentPlayer = 'X';
    moveHistory = [];
    gameOver = false;
    document.getElementById('message').textContent = '';
    renderBoard();
}

function checkWin(row, col) {
    const directions = [
        { x: 1, y: 0 },  // Horizontal
        { x: 0, y: 1 },  // Vertical
        { x: 1, y: 1 },  // Diagonal right-down
        { x: 1, y: -1 }  // Diagonal left-down
    ];

    const inBounds = (r, c) => r >= 0 && r < gridSize && c >= 0 && c < gridSize;
    let winLine = [];

    for (let { x, y } of directions) {
        let count = 1;
        let line = [{ row, col }];

        // Check in the positive direction
        for (let i = 1; i < 5; i++) {
            const newRow = row + i * y;
            const newCol = col + i * x;
            if (inBounds(newRow, newCol) && board[newRow][newCol] === currentPlayer) {
                count++;
                line.push({ row: newRow, col: newCol });
            } else {
                break;
            }
        }

        // Check in the negative direction
        for (let i = 1; i < 5; i++) {
            const newRow = row - i * y;
            const newCol = col - i * x;
            if (inBounds(newRow, newCol) && board[newRow][newCol] === currentPlayer) {
                count++;
                line.push({ row: newRow, col: newCol });
            } else {
                break;
            }
        }

        if (count >= 5) {
            winLine = line;
            highlightWinningLine(winLine); // Highlight the winning cells
            return true;
        }
    }
    return false;
}


function highlightWinningLine(winLine) {
    console.log('Winning Line:', winLine); // Log winning line for debugging

    winLine.forEach(({ row, col }) => {
        // Use dataset attributes to find the correct cell
        const cell = document.querySelector(`#gameBoard .cell[data-row="${row}"][data-col="${col}"]`);
        console.log('Cell:', cell); // Log cell for debugging

        if (cell) {
            cell.classList.add('win'); // Add the winning class
        } else {
            console.error(`Cell not found for row ${row}, col ${col}`);
        }
    });
}


document.addEventListener('DOMContentLoaded', renderBoard);
