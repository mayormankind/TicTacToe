// Winning combinations for Tic-Tac-Toe
export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

/**
 * Check if there's a winner on the board
 * @param {Array} board - Array of 9 cells ('X', 'O', or null)
 * @returns {Object|null} - { winner: 'X'|'O', combination: [0,1,2] } or null
 */
export function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combination: combo };
    }
  }
  return null;
}

/**
 * Check if the board is full (draw)
 * @param {Array} board - Array of 9 cells
 * @returns {boolean}
 */
export function checkDraw(board) {
  return board.every(cell => cell !== null);
}

/**
 * Get all empty cell indices
 * @param {Array} board - Array of 9 cells
 * @returns {Array} - Array of empty indices
 */
export function getEmptyCells(board) {
  return board.reduce((acc, cell, index) => {
    if (cell === null) acc.push(index);
    return acc;
  }, []);
}
