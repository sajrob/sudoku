// Sudoku game logic
const board = document.getElementById('sudoku-board');
const newGameBtn = document.getElementById('new-game');
const solveBtn = document.getElementById('solve');
const checkBtn = document.getElementById('check');

let sudokuGrid = [];

function generateSudoku() {
    // Generate a new 5x5 Sudoku puzzle (simplified version)
    sudokuGrid = Array(5).fill().map(() => Array(5).fill(0));
    
    function isValid(row, col, num) {
        for (let i = 0; i < 5; i++) {
            if (sudokuGrid[row][i] === num || sudokuGrid[i][col] === num) return false;
        }
        const boxRow = Math.floor(row / 2) * 2;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
                if (sudokuGrid[boxRow + i][boxCol + j] === num) return false;
            }
        }
        return true;
    }

    function fillGrid(row = 0, col = 0) {
        if (col === 5) {
            row++;
            col = 0;
        }
        if (row === 5) return true;

        if (sudokuGrid[row][col] !== 0) return fillGrid(row, col + 1);

        const nums = [1, 2, 3, 4, 5];
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }

        for (let num of nums) {
            if (isValid(row, col, num)) {
                sudokuGrid[row][col] = num;
                if (fillGrid(row, col + 1)) return true;
                sudokuGrid[row][col] = 0;
            }
        }
        return false;
    }

    // Add a maximum number of attempts to prevent infinite loops
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        sudokuGrid = Array(5).fill().map(() => Array(5).fill(0));
        if (fillGrid()) {
            break;
        }
        attempts++;
    }

    if (attempts === maxAttempts) {
        console.error("Failed to generate a valid Sudoku grid");
        // Generate a simple valid grid as a fallback
        sudokuGrid = [
            [1, 2, 3, 4, 5],
            [2, 3, 4, 5, 1],
            [3, 4, 5, 1, 2],
            [4, 5, 1, 2, 3],
            [5, 1, 2, 3, 4]
        ];
    }

    const cellsToRemove = 15;
    for (let i = 0; i < cellsToRemove; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * 5);
            col = Math.floor(Math.random() * 5);
        } while (sudokuGrid[row][col] === 0);
        sudokuGrid[row][col] = 0;
    }
}

function renderBoard() {
    board.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 5; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = 1;
            input.max = 5;
            input.value = sudokuGrid[i][j] || '';
            if (sudokuGrid[i][j] !== 0) {
                input.readOnly = true;
            }
            cell.appendChild(input);
            row.appendChild(cell);
        }
        fragment.appendChild(row);
    }
    board.appendChild(fragment);
}

newGameBtn.addEventListener('click', () => {
    generateSudoku();
    renderBoard();
});

solveBtn.addEventListener('click', () => {
    // Add solving logic here for 5x5 grid
    function solveSudoku() {
        const emptyCell = findEmptyCell();
        if (!emptyCell) {
            return true; // Puzzle solved
        }

        const [row, col] = emptyCell;

        for (let num = 1; num <= 5; num++) {
            if (isValidMove(row, col, num)) {
                sudokuGrid[row][col] = num;

                if (solveSudoku()) {
                    return true;
                }

                sudokuGrid[row][col] = 0; // Backtrack
            }
        }

        return false; // No solution found
    }

    function findEmptyCell() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (sudokuGrid[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    function isValidMove(row, col, num) {
        // Check row
        for (let i = 0; i < 5; i++) {
            if (sudokuGrid[row][i] === num) {
                return false;
            }
        }

        // Check column
        for (let i = 0; i < 5; i++) {
            if (sudokuGrid[i][col] === num) {
                return false;
            }
        }

        return true;
    }

    if (solveSudoku()) {
        console.log("Sudoku solved!");
    } else {
        console.log("No solution exists.");
    }
    renderBoard();
});

checkBtn.addEventListener('click', () => {
    function checkSolution() {
        const inputs = document.querySelectorAll('#sudoku-board input');
        let isCorrect = true;

        // Remove previous color classes and result message
        inputs.forEach(input => {
            input.classList.remove('correct', 'incorrect');
        });
        const existingMessage = document.querySelector('.result-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Check each cell
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const input = inputs[i * 5 + j];
                const value = parseInt(input.value);

                if (isNaN(value) || value < 1 || value > 5) {
                    input.classList.add('incorrect');
                    isCorrect = false;
                } else {
                    // Check row
                    const rowValues = sudokuGrid[i].filter((v, index) => index !== j);
                    // Check column
                    const colValues = sudokuGrid.map(row => row[j]).filter((v, index) => index !== i);

                    if (rowValues.includes(value) || colValues.includes(value)) {
                        input.classList.add('incorrect');
                        isCorrect = false;
                    } else {
                        input.classList.add('correct');
                    }
                }
            }
        }

        // Display result message
        const resultMessage = document.createElement('div');
        resultMessage.className = `result-message ${isCorrect ? 'correct' : 'incorrect'}`;
        resultMessage.textContent = isCorrect ? 'Congratulations! Your solution is correct!' : 'Sorry Lizzie, you missed a few. Please try again ;).';
        document.querySelector('.sudoku-container').appendChild(resultMessage);

        // Remove check results after 3 seconds
        setTimeout(() => {
            inputs.forEach(input => {
                input.classList.remove('correct', 'incorrect');
            });
            resultMessage.remove();
        }, 1000);
    }

    checkSolution();
});

// Initialize the game
generateSudoku();
renderBoard();