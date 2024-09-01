// Constants
// These define the size and structure of the Sudoku grid
const GRID_SIZE = 9;
const BOX_SIZE = 3;
const EMPTY_CELL = 0;
const NUMBERS = Array.from({length: GRID_SIZE}, (_, i) => i + 1);

// DOM elements
// These are references to important elements in the HTML
const board = document.getElementById('sudoku-board');
const newGameBtn = document.getElementById('new-game');
const solveBtn = document.getElementById('solve');
const checkBtn = document.getElementById('check');

// The main Sudoku grid, initialized as an empty array
let sudokuGrid = [];

// Helper functions
// These functions assist in various Sudoku operations

// Checks if a number is valid in a given position
const isValid = (grid, row, col, num) => {
    for (let i = 0; i < GRID_SIZE; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
            if (grid[boxRow + i][boxCol + j] === num) return false;
        }
    }
    return true;
};

// Finds the next empty cell in the grid
const findEmptyCell = (grid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === EMPTY_CELL) return [i, j];
        }
    }
    return null;
};

// Randomly shuffles an array (used for generating puzzles)
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Core functions
// These functions handle the main Sudoku logic

// Solves the Sudoku puzzle using backtracking
const solveSudoku = (grid, shuffle = false) => {
    const solve = () => {
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
    };

    return solve();
};

// Generates a new Sudoku puzzle
const generateSudoku = () => {
    // Creates a solved Sudoku grid
    sudokuGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
    solveSudoku(sudokuGrid, true);
    
    // Removes cells to create the puzzle
    const cellsToRemove = 40;
    for (let i = 0; i < cellsToRemove; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * GRID_SIZE);
            col = Math.floor(Math.random() * GRID_SIZE);
        } while (sudokuGrid[row][col] === EMPTY_CELL);
        sudokuGrid[row][col] = EMPTY_CELL;
    }
};

// UI functions
// These functions handle the user interface

// Renders the Sudoku board on the page
const renderBoard = () => {
    board.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < GRID_SIZE; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('td');
            const input = createInput(i, j);
            cell.appendChild(input);
            row.appendChild(cell);
        }
        fragment.appendChild(row);
    }
    board.appendChild(fragment);
};

// Creates an input element for a cell
const createInput = (i, j) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.value = sudokuGrid[i][j] || ''; // Sets the value of the input based on the sudokuGrid
    input.readOnly = sudokuGrid[i][j] !== EMPTY_CELL; // Makes the input read-only if it's not an empty cell
    input.setAttribute('inputmode', 'none'); // Disable device keyboard
    input.setAttribute('pattern', '[1-9]');
    input.addEventListener('focus', () => handleCellFocus(input));
    return input;
};

// Handles cell focus to highlight the selected cell
const handleCellFocus = (input) => {
    document.querySelectorAll('#sudoku-board input').forEach(cell => cell.classList.remove('selected'));
    input.classList.add('selected');
};

// Handles number key clicks
const handleNumberKeyClick = (num) => {
    const selectedCell = document.querySelector('#sudoku-board input.selected');
    if (selectedCell && !selectedCell.readOnly) { // Ensure the selected cell is not read-only
        selectedCell.value = num;
    }
};

// Renders the on-screen number keyboard
const renderNumberKeyboard = () => {
    const keyboard = document.querySelector('.number-keyboard');
    keyboard.innerHTML = '';
    for (let num = 1; num <= 9; num++) {
        const button = document.createElement('button');
        button.textContent = num;
        button.addEventListener('click', () => handleNumberKeyClick(num));
        keyboard.appendChild(button);
    }
};

// Checks the user's solution
const checkSolution = () => {
    const inputs = document.querySelectorAll('#sudoku-board input');
    let isCorrect = true;

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

    displayResultMessage(isCorrect);
};

// Displays a message after checking the solution
const displayResultMessage = (isCorrect) => {
    const resultMessage = document.createElement('div');
    resultMessage.className = `result-message ${isCorrect ? 'correct' : 'incorrect'}`;
    resultMessage.textContent = isCorrect ? 'Congratulations! You are smart!!' : 'Sorry, you missed a few. Please going!';
    document.querySelector('.sudoku-container').appendChild(resultMessage);

    setTimeout(() => {
        document.querySelectorAll('#sudoku-board input').forEach(input => input.classList.remove('correct', 'incorrect'));
        resultMessage.remove();
    }, 2000);

    if (window.innerWidth <= 600) {
        resultMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

// Event listeners
// These set up the interactivity of the game
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
// This starts the game when the page loads
generateSudoku();
renderBoard();
renderNumberKeyboard();