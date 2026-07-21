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
import { useGameState } from './hooks/useGameState';
import { checkWinner, checkDraw } from './utils/gameLogic';
import { getAIMove } from './utils/ai';

export function App() {
  const [screen, setScreen] = useState(() => sessionStorage.getItem('app_screen') || 'home');
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [winningCombo, setWinningCombo] = useState(null);
  const [gameWinner, setGameWinner] = useState(() => sessionStorage.getItem('app_winner') || null);
  const [selectedGame, setSelectedGame] = useState(null);

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

  const handlePlayerSubmit = ({ player1, player2, rounds }) => {
    gameState.setPlayerNames({ X: player1, O: player2 });
    if (rounds) gameState.setWinTarget(rounds);
    setShowPlayerForm(false);
    
    if (gameState.gameMode === 'online') {
      setScreen('online');
    } else {
      setScreen('game');
    }
  };

  // Game logic - check for wins/draws after each move
  useEffect(() => {
    if (screen !== 'game' || winningCombo) return;

    // Count filled cells to detect new moves
    const filledCells = gameState.board.filter(cell => cell !== null).length;
    
    // If board is empty and it's AI's turn (after a draw where nextStarter became 'O'), trigger AI first move
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
      setWinningCombo(result.combination);
      setTimeout(() => {
        gameState.incrementScore(result.winner);
        setTimeout(() => {
          gameState.saveCompletedGame(result.winner);
          gameState.resetBoard();
          setWinningCombo(null);
          
          // Check if someone reached the win target
          const updatedScores = { ...gameState.scores };
          updatedScores[result.winner]++;
          if (updatedScores.X >= gameState.winTarget || updatedScores.O >= gameState.winTarget) {
            const winner = updatedScores.X >= gameState.winTarget ? gameState.playerNames.X : gameState.playerNames.O;
            setGameWinner(winner);
            setScreen('winner');
          }
        }, 2000);
      }, 800);
      return;
    }

    // Check for draw
    if (checkDraw(gameState.board)) {
      setTimeout(() => {
        gameState.saveCompletedGame('draw');
        gameState.resetBoard();
      }, 2000);
      return;
    }

    // AI move for Vs Computer mode
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
  };

  const handleResetBoard = () => {
    gameState.resetBoard();
    setWinningCombo(null);
    
    // Check if someone reached the win target
    if (gameState.scores.X >= gameState.winTarget || gameState.scores.O >= gameState.winTarget) {
      const winner = gameState.scores.X >= gameState.winTarget ? gameState.playerNames.X : gameState.playerNames.O;
      setGameWinner(winner);
      setScreen('winner');
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
          scores={gameState.scores}
          gameMode={gameState.gameMode}
          difficulty={gameState.difficulty}
          onMove={handleMove}
          onSwitchPlayer={gameState.switchPlayer}
          onIncrementScore={gameState.incrementScore}
          onResetBoard={handleResetBoard}
          winningCombo={winningCombo}
        />
      )}

      {screen === 'online' && (
        <OnlineGame
          playerName={gameState.playerNames.X}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {screen === 'winner' && (
        <WinnerScreen
          winner={gameWinner}
          onBackToMenu={handleBackToMenu}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}
