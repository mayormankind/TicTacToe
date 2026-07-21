import { useState, useEffect } from 'preact/hooks';

/**
 * Custom hook for managing game state
 */
export function useGameState() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameMode, setGameMode] = useState(null); // 'mp', 'vs', 'online'
  const [playerNames, setPlayerNames] = useState({ X: 'Player X', O: 'Player O' });
  const [difficulty, setDifficulty] = useState('hard');
  const [moveHistory, setMoveHistory] = useState([]);
  const [nextStarter, setNextStarter] = useState('X');
  const [winTarget, setWinTarget] = useState(7);
  const [completedGames, setCompletedGames] = useState(() => {
    try {
      const saved = localStorage.getItem('tictactoe_games');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tictactoe_games', JSON.stringify(completedGames));
    } catch {
      // ignore storage errors
    }
  }, [completedGames]);

  const makeMove = (index) => {
    if (board[index] !== null) return false;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    return true;
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const incrementScore = (player) => {
    setScores(prev => ({
      ...prev,
      [player]: prev[player] + 1
    }));
  };

  const recordMove = (index, player = currentPlayer) => {
    setMoveHistory(prev => [...prev, { index, player }]);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer(nextStarter);
    setMoveHistory([]);
    setNextStarter(nextStarter === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    resetBoard();
    setNextStarter('X');
    setScores({ X: 0, O: 0 });
    setWinTarget(7);
  };

  const saveCompletedGame = (result) => {
    const gameRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mode: gameMode,
      difficulty,
      playerNames,
      moves: moveHistory,
      result,
    };
    setCompletedGames(prev => [gameRecord, ...prev]);
  };

  const clearCompletedGames = () => {
    setCompletedGames([]);
  };

  return {
    board,
    currentPlayer,
    scores,
    gameMode,
    playerNames,
    difficulty,
    winTarget,
    moveHistory,
    completedGames,
    setBoard,
    setCurrentPlayer,
    setGameMode,
    setPlayerNames,
    setDifficulty,
    setWinTarget,
    makeMove,
    switchPlayer,
    incrementScore,
    recordMove,
    resetBoard,
    resetGame,
    saveCompletedGame,
    clearCompletedGames,
  };
}
