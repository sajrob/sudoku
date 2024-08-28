// Constants for game setup
const GRID_SIZE = 9;
const BOX_SIZE = 3;
const EMPTY_CELL = 0;
const NUMBERS = Array.from({length: GRID_SIZE}, (_, i) => i + 1);

// DOM element references
const board = document.getElementById('sudoku-board');
const newGameBtn = document.getElementById('new-game');
const solveBtn = document.getElementById('solve');
const checkBtn = document.getElementById('check');

// Global variable to store the current Sudoku grid
let sudokuGrid = [];

// Function to check if a number is valid in a given position
function isValid(grid, row, col, num) {
    // Check row and column
    for (let i = 0; i < GRID_SIZE; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
            if (grid[boxRow + i][boxCol + j] === num) return false;
        }
    }
    return true;
}

// Recursive function to solve the Sudoku puzzle
function solveSudoku(grid, shuffle = false, maxAttempts = 1000000) {
    let attempts = 0;
    
    function solve() {
        if (attempts++ > maxAttempts) return false;
        
        const emptyCell = findEmptyCell(grid);
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        const numbers = shuffle ? shuffleArray([...NUMBERS]) : NUMBERS;
        
        for (let num of numbers) {
            if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (solve()) return true;
                grid[row][col] = EMPTY_CELL;
            }
        }
        return false;
    }

    return solve();
}

// Function to generate a new Sudoku puzzle
function generateSudoku() {
    sudokuGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
    solveSudoku(sudokuGrid, true);
    
    // Remove numbers to create the puzzle
    const cellsToRemove = 40;
    for (let i = 0; i < cellsToRemove; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * GRID_SIZE);
            col = Math.floor(Math.random() * GRID_SIZE);
        } while (sudokuGrid[row][col] === EMPTY_CELL);
        sudokuGrid[row][col] = EMPTY_CELL;
    }
}

// Function to render the Sudoku board on the webpage
function renderBoard() {
    board.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < GRID_SIZE; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.value = sudokuGrid[i][j] || '';
            input.readOnly = sudokuGrid[i][j] !== EMPTY_CELL;
            input.setAttribute('inputmode', 'numeric');
            input.setAttribute('pattern', '[1-9]');
            input.addEventListener('input', function(e) {
                this.value = this.value.replace(/[^1-9]/g, '').slice(0, 1);
            });
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    this.value = '';
                    e.preventDefault();
                }
            });
            cell.appendChild(input);
            row.appendChild(cell);
        }
        fragment.appendChild(row);
    }
    board.appendChild(fragment);
}

// Helper function to find an empty cell in the grid
function findEmptyCell(grid) {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === EMPTY_CELL) return [i, j];
        }
    }
    return null;
}

// Helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to check the player's solution
function checkSolution() {
    const inputs = document.querySelectorAll('#sudoku-board input');
    let isCorrect = true;

    // Create a copy of the current grid and solve it
    let solvedGrid = sudokuGrid.map(row => [...row]);
    solveSudoku(solvedGrid);

    inputs.forEach(input => input.classList.remove('correct', 'incorrect'));
    document.querySelector('.result-message')?.remove();

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const input = inputs[i * GRID_SIZE + j];
            const value = parseInt(input.value) || 0;

            if (value !== solvedGrid[i][j]) {
                input.classList.add('incorrect');
                isCorrect = false;
            } else {
                input.classList.add('correct');
            }
        }
    }

    // Display result message
    const resultMessage = document.createElement('div');
    resultMessage.className = `result-message ${isCorrect ? 'correct' : 'incorrect'}`;
    resultMessage.textContent = isCorrect ? 'Congratulations! You are smart!!' : 'Sorry, there are some errors. Please try again.';
    document.querySelector('.sudoku-container').appendChild(resultMessage);

    // Remove highlighting and message after 3 seconds
    setTimeout(() => {
        inputs.forEach(input => input.classList.remove('correct', 'incorrect'));
        resultMessage.remove();
    }, 3000);

    // Scroll to the result message on mobile devices
    if (window.innerWidth <= 600) {
        resultMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Event listeners for buttons
newGameBtn.addEventListener('click', () => {
    generateSudoku();
    renderBoard();
});

solveBtn.addEventListener('click', () => {
    solveSudoku(sudokuGrid);
    renderBoard();
});

checkBtn.addEventListener('click', checkSolution);

// Initialize the game
generateSudoku();
renderBoard();