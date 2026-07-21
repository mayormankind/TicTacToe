import { useState, useEffect, useMemo, useRef } from 'preact/hooks';
import { checkWinner } from '../utils/gameLogic';

export function ReplayPage({ game, onBack }) {
  const { moves, playerNames, mode, difficulty } = game;
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const totalMoves = moves.length;

  const board = useMemo(() => {
    const currentBoard = Array(9).fill(null);
    for (let i = 0; i < step; i++) {
      const { index, player } = moves[i];
      currentBoard[index] = player;
    }
    return currentBoard;
  }, [moves, step]);

  const resultInfo = useMemo(() => {
    if (step < totalMoves) return null;
    const winner = checkWinner(board);
    if (winner) return `${winner.winner === 'X' ? playerNames.X : playerNames.O} wins!`;
    return 'Draw';
  }, [board, step, totalMoves, playerNames]);

  const goToFirst = () => {
    setIsPlaying(false);
    setStep(0);
  };

  const goToPrevious = () => {
    setIsPlaying(false);
    setStep(s => Math.max(0, s - 1));
  };

  const goToNext = () => {
    setStep(s => Math.min(totalMoves, s + 1));
  };

  const goToLast = () => {
    setIsPlaying(false);
    setStep(totalMoves);
  };

  const togglePlay = () => setIsPlaying(p => !p);
  const pause = () => setIsPlaying(false);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s >= totalMoves) {
            return s;
          }
          return s + 1;
        });
      }, 800);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, totalMoves]);

  useEffect(() => {
    if (isPlaying && step >= totalMoves) {
      setIsPlaying(false);
    }
  }, [isPlaying, step, totalMoves]);

  const currentMove = step > 0 && step <= totalMoves ? moves[step - 1] : null;
  const currentPlayerName = currentMove ? playerNames[currentMove.player] : null;

  return (
    <section class="replay-page">
      <div class="replay-header">
        <h2>Replay</h2>
        <span class="cancel" onClick={onBack}>×</span>
      </div>

      <div class="replay-board-container">
        <div class="game-container">
          {board.map((cell, index) => (
            <div key={index} class={`box ${cell ? 'filled' : 'unfilled'}`}>
              {cell && <span class="tag">{cell}</span>}
            </div>
          ))}
        </div>
      </div>

      <div class="replay-info">
        {currentMove ? (
          <p>Move {step} of {totalMoves}: {currentPlayerName} played in cell {currentMove.index + 1}</p>
        ) : (
          <p>Starting position</p>
        )}
        {resultInfo && <p class="replay-result">{resultInfo}</p>}
      </div>

      <div class="replay-controls">
        <button onClick={goToFirst} title="First">⏮ First</button>
        <button onClick={goToPrevious} title="Previous">◀ Previous</button>
        {isPlaying ? (
          <button onClick={pause} title="Pause">⏸ Pause</button>
        ) : (
          <button onClick={togglePlay} title="Play">▶ Play</button>
        )}
        <button onClick={goToNext} title="Next">Next ▶</button>
        <button onClick={goToLast} title="Last">Last ⏭</button>
      </div>
    </section>
  );
}
