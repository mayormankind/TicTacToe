import { checkWinner, getEmptyCells } from './gameLogic';

/**
 * Minimax algorithm for optimal AI play
 * @param {Array} board - Current board state
 * @param {string} player - Current player ('X' or 'O')
 * @param {boolean} isMaximizing - Whether maximizing or minimizing
 * @returns {number} - Score for this board state
 */
function minimax(board, player, isMaximizing) {
  const aiPlayer = 'O'; // PickBot is always 'O'
  const humanPlayer = 'X';
  
  const result = checkWinner(board);
  if (result) {
    return result.winner === aiPlayer ? 10 : -10;
  }
  
  if (getEmptyCells(board).length === 0) {
    return 0; // Draw
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const score = minimax(board, humanPlayer, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const score = minimax(board, aiPlayer, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

/**
 * Get the best move for AI using minimax
 * @param {Array} board - Current board state
 * @returns {number} - Best move index
 */
function getBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 'X', false);
      board[i] = null;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

/**
 * Get AI move based on difficulty level
 * @param {Array} board - Current board state
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {number} - Move index
 */
export function getAIMove(board, difficulty = 'hard') {
  const emptyCells = getEmptyCells(board);
  
  if (emptyCells.length === 0) return null;

  switch (difficulty) {
    case 'easy':
      // Random move
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    case 'medium':
      // 50% optimal, 50% random
      if (Math.random() < 0.5) {
        return getBestMove(board);
      }
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    case 'hard':
    default:
      // Always optimal
      return getBestMove(board);
  }
}
