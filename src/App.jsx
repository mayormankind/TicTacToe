import { useState, useEffect } from 'preact/hooks';
import { HomePage } from './components/HomePage';
import { HelpPage } from './components/HelpPage';
import { PlayerForm } from './components/PlayerForm';
import { DifficultySelector } from './components/DifficultySelector';
import { GameBoard } from './components/GameBoard';
import { OnlineGame } from './components/OnlineGame';
import { WinnerScreen } from './components/WinnerScreen';
import { HistoryPage } from './components/HistoryPage';
import { ReplayPage } from './components/ReplayPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { useGameState } from './hooks/useGameState';
import { checkWinner, checkDraw } from './utils/gameLogic';
import { getAIMove } from './utils/ai';
import { playMoveSound, playWinSound, playDrawSound } from './utils/sounds';

export function App() {
  const [screen, setScreen] = useState(() => sessionStorage.getItem('app_screen') || 'home');
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [winningCombo, setWinningCombo] = useState(null);
  const [gameWinner, setGameWinner] = useState(() => sessionStorage.getItem('app_winner') || null);
  const [selectedGame, setSelectedGame] = useState(null);

  // Online-specific state passed down to OnlineGame
  const [onlineMatchType, setOnlineMatchType] = useState('random');
  const [onlineRoomCode, setOnlineRoomCode] = useState('');

  const gameState = useGameState();

  useEffect(() => {
    if (screen === 'home') sessionStorage.removeItem('app_screen');
    else sessionStorage.setItem('app_screen', screen);
  }, [screen]);

  useEffect(() => {
    if (gameWinner) sessionStorage.setItem('app_winner', gameWinner);
    else sessionStorage.removeItem('app_winner');
  }, [gameWinner]);

  const handleSelectMode = (mode) => {
    if (mode === 'help') {
      setScreen('help');
    } else if (mode === 'history') {
      setScreen('history');
    } else if (mode === 'leaderboard') {
      setScreen('leaderboard');
    } else if (mode === 'online') {
      setShowPlayerForm(true);
      gameState.setGameMode('online');
    } else if (mode === 'vs') {
      setShowDifficultySelector(true);
      gameState.setGameMode('vs');
    } else if (mode === 'mp') {
      setShowPlayerForm(true);
      gameState.setGameMode('mp');
    }
  };

  const handleDifficultySelect = (difficulty) => {
    gameState.setDifficulty(difficulty);
    setShowDifficultySelector(false);
    setShowPlayerForm(true);
  };

  const handlePlayerSubmit = ({ player1, player2, rounds, xColor, oColor, timerSeconds, matchType, roomCode }) => {
    gameState.setPlayerNames({ X: player1, O: player2 || 'Player O' });
    if (rounds) gameState.setWinTarget(rounds);
    if (xColor) gameState.setPlayerColors({ X: xColor, O: oColor || '#3498db' });
    if (timerSeconds !== undefined) gameState.setTimerSeconds(timerSeconds);
    setShowPlayerForm(false);

    if (gameState.gameMode === 'online') {
      setOnlineMatchType(matchType || 'random');
      setOnlineRoomCode(roomCode || '');
      setScreen('online');
    } else {
      setScreen('game');
    }
  };

  // ── Core game logic (win / draw / AI moves) ──────────────────────────────
  useEffect(() => {
    if (screen !== 'game' || winningCombo) return;

    const filledCells = gameState.board.filter(cell => cell !== null).length;

    // Empty board + AI goes first (after a round where O starts)
    if (filledCells === 0) {
      if (gameState.gameMode === 'vs' && gameState.currentPlayer === 'O') {
        setTimeout(() => {
          const aiMoveIndex = getAIMove(gameState.board, gameState.difficulty);
          if (aiMoveIndex !== null) {
            const newBoard = [...gameState.board];
            newBoard[aiMoveIndex] = 'O';
            gameState.setBoard(newBoard);
            gameState.recordMove(aiMoveIndex, 'O');
            gameState.switchPlayer();
          }
        }, 800);
      }
      return;
    }

    // Check for winner
    const result = checkWinner(gameState.board);
    if (result) {
      // Capture scores before the async increment so the nested timeout
      // can compute the correct post-increment total without stale closure issues.
      const scoresBefore = gameState.scores;
      setWinningCombo(result.combination);
      playWinSound();
      setTimeout(() => {
        gameState.incrementScore(result.winner);
        setTimeout(() => {
          gameState.saveCompletedGame(result.winner);
          gameState.resetBoard();
          setWinningCombo(null);

          const newScores = { ...scoresBefore, [result.winner]: scoresBefore[result.winner] + 1 };
          if (newScores.X >= gameState.winTarget || newScores.O >= gameState.winTarget) {
            const winner = newScores.X >= gameState.winTarget ? gameState.playerNames.X : gameState.playerNames.O;
            setGameWinner(winner);
            setScreen('winner');
          }
        }, 2000);
      }, 800);
      return;
    }

    // Check for draw
    if (checkDraw(gameState.board)) {
      playDrawSound();
      setTimeout(() => {
        gameState.saveCompletedGame('draw');
        gameState.resetBoard();
      }, 2000);
      return;
    }

    // AI move
    if (gameState.gameMode === 'vs' && gameState.currentPlayer === 'O') {
      setTimeout(() => {
        const aiMoveIndex = getAIMove(gameState.board, gameState.difficulty);
        if (aiMoveIndex !== null) {
          const newBoard = [...gameState.board];
          newBoard[aiMoveIndex] = 'O';
          gameState.setBoard(newBoard);
          gameState.recordMove(aiMoveIndex, 'O');
          gameState.switchPlayer();
        }
      }, 800);
    }
  }, [gameState.board, screen, winningCombo]);

  const handleMove = (index) => {
    if (gameState.board[index] || winningCombo) return;
    const player = gameState.currentPlayer;
    const newBoard = [...gameState.board];
    newBoard[index] = player;
    gameState.setBoard(newBoard);
    gameState.recordMove(index, player);
    gameState.switchPlayer();
    playMoveSound();
  };

  // When the turn timer expires, auto-place the piece in a random empty cell.
  const handleTimeUp = () => {
    if (winningCombo || screen !== 'game') return;
    const empty = gameState.board.reduce((acc, cell, i) => (cell === null ? [...acc, i] : acc), []);
    if (empty.length > 0) {
      handleMove(empty[Math.floor(Math.random() * empty.length)]);
    }
  };

  const handleBackToMenu = () => {
    sessionStorage.removeItem('app_screen');
    sessionStorage.removeItem('app_winner');
    setScreen('home');
    gameState.resetGame();
    setWinningCombo(null);
    setGameWinner(null);
  };

  const handlePlayAgain = () => {
    gameState.resetGame();
    setWinningCombo(null);
    setGameWinner(null);

    if (gameState.gameMode === 'mp') {
      setShowPlayerForm(true);
    } else if (gameState.gameMode === 'vs') {
      setShowDifficultySelector(true);
    } else if (gameState.gameMode === 'online') {
      setShowPlayerForm(true);
    }
    setScreen('home');
  };

  const handleOnlineMatchComplete = (winner, playerNames) => {
    gameState.saveGameRecord({
      mode: 'online',
      difficulty: null,
      playerNames,
      moves: [], // online moves not tracked locally; replay unavailable
      result: winner,
    });
  };

  const handleReplayGame = (game) => {
    setSelectedGame(game);
    setScreen('replay');
  };

  const handleBackToHistory = () => {
    setSelectedGame(null);
    setScreen('history');
  };

  return (
    <>
      {screen === 'home' && <HomePage onSelectMode={handleSelectMode} />}
      {screen === 'help' && <HelpPage onClose={() => setScreen('home')} />}
      {screen === 'leaderboard' && (
        <LeaderboardPage
          completedGames={gameState.completedGames}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'history' && (
        <HistoryPage
          games={gameState.completedGames}
          onReplay={handleReplayGame}
          onBack={() => setScreen('home')}
          onClear={() => gameState.clearCompletedGames()}
        />
      )}
      {screen === 'replay' && selectedGame && (
        <ReplayPage
          game={selectedGame}
          onBack={handleBackToHistory}
        />
      )}

      {showDifficultySelector && (
        <DifficultySelector
          selectedDifficulty={gameState.difficulty}
          onSelect={handleDifficultySelect}
          onCancel={() => {
            setShowDifficultySelector(false);
            setScreen('home');
          }}
        />
      )}

      {showPlayerForm && (
        <PlayerForm
          mode={gameState.gameMode}
          onSubmit={handlePlayerSubmit}
          onCancel={() => {
            setShowPlayerForm(false);
            setScreen('home');
          }}
        />
      )}

      {screen === 'game' && (
        <GameBoard
          board={gameState.board}
          currentPlayer={gameState.currentPlayer}
          playerNames={gameState.playerNames}
          playerColors={gameState.playerColors}
          scores={gameState.scores}
          gameMode={gameState.gameMode}
          difficulty={gameState.difficulty}
          timerSeconds={gameState.timerSeconds}
          onMove={handleMove}
          onTimeUp={handleTimeUp}
          winningCombo={winningCombo}
        />
      )}

      {screen === 'online' && (
        <OnlineGame
          playerName={gameState.playerNames.X}
          matchType={onlineMatchType}
          roomCode={onlineRoomCode}
          onBackToMenu={handleBackToMenu}
          onMatchComplete={handleOnlineMatchComplete}
        />
      )}

      {screen === 'winner' && (
        <WinnerScreen
          winner={gameWinner}
          scores={gameState.scores}
          playerNames={gameState.playerNames}
          gameMode={gameState.gameMode}
          difficulty={gameState.difficulty}
          onBackToMenu={handleBackToMenu}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}
