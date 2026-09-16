import { useState, useEffect } from 'preact/hooks';

const GAME_SESSION_KEY = 'ttt_session';

function loadGameSession() {
  try {
    const s = sessionStorage.getItem(GAME_SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

/**
 * Custom hook for managing game state
 */
export function useGameState() {
  const [board, setBoard] = useState(() => loadGameSession()?.board ?? Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(() => loadGameSession()?.currentPlayer ?? 'X');
  const [scores, setScores] = useState(() => loadGameSession()?.scores ?? { X: 0, O: 0 });
  const [gameMode, setGameMode] = useState(() => loadGameSession()?.gameMode ?? null);
  const [playerNames, setPlayerNames] = useState(() => loadGameSession()?.playerNames ?? { X: 'Player X', O: 'Player O' });
  const [difficulty, setDifficulty] = useState(() => loadGameSession()?.difficulty ?? 'hard');
  const [moveHistory, setMoveHistory] = useState(() => loadGameSession()?.moveHistory ?? []);
  const [nextStarter, setNextStarter] = useState(() => loadGameSession()?.nextStarter ?? 'X');
  const [winTarget, setWinTarget] = useState(() => loadGameSession()?.winTarget ?? 7);
  const [playerColors, setPlayerColors] = useState(() => loadGameSession()?.playerColors ?? { X: '#d86e31', O: '#3498db' });
  const [timerSeconds, setTimerSeconds] = useState(() => loadGameSession()?.timerSeconds ?? 0);
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

  useEffect(() => {
    try {
      sessionStorage.setItem(GAME_SESSION_KEY, JSON.stringify({
        board, currentPlayer, scores, gameMode, playerNames, difficulty, moveHistory, nextStarter, winTarget, playerColors, timerSeconds,
      }));
    } catch {}
  }, [board, currentPlayer, scores, gameMode, playerNames, difficulty, moveHistory, nextStarter, winTarget, playerColors, timerSeconds]);

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
    setTimerSeconds(0);
    setPlayerColors({ X: '#d86e31', O: '#3498db' });
    try { sessionStorage.removeItem(GAME_SESSION_KEY); } catch {}
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

  // For saving games whose record is built externally (e.g. online matches)
  const saveGameRecord = (record) => {
    setCompletedGames(prev => [{
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...record,
    }, ...prev]);
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
    playerColors,
    timerSeconds,
    moveHistory,
    completedGames,
    setBoard,
    setCurrentPlayer,
    setGameMode,
    setPlayerNames,
    setDifficulty,
    setWinTarget,
    setPlayerColors,
    setTimerSeconds,
    makeMove,
    switchPlayer,
    incrementScore,
    recordMove,
    resetBoard,
    resetGame,
    saveCompletedGame,
    saveGameRecord,
    clearCompletedGames,
  };
}
