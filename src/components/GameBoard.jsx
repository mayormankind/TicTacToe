import { useState, useEffect } from 'preact/hooks';

export function GameBoard({ 
  board, 
  currentPlayer,
  playerNames,
  playerColors,
  scores,
  gameMode,
  timerSeconds,
  onMove,
  onTimeUp,
  winningCombo
}) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds || 0);

  // Countdown timer — resets at the start of each player's turn.
  // AI turns (O in vs-computer mode) are not timed.
  useEffect(() => {
    const isAITurn = gameMode === 'vs' && currentPlayer === 'O';
    if (!timerSeconds || winningCombo || isAITurn) {
      setTimeLeft(timerSeconds || 0);
      return;
    }

    setTimeLeft(timerSeconds);
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          onTimeUp?.();
          return timerSeconds;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [currentPlayer, winningCombo, timerSeconds, gameMode]);

  const handleCellClick = (index) => {
    if (board[index] || winningCombo) return;
    onMove(index);
  };

  const currentPlayerName = playerNames[currentPlayer] || currentPlayer;

  // Timer urgency thresholds
  const timerUrgent = timerSeconds > 0 && timeLeft <= Math.ceil(timerSeconds * 0.3);
  const timerPct = timerSeconds > 0 ? (timeLeft / timerSeconds) * 100 : 100;

  return (
    <main class="app">
      <div class="counter">
        <h3 class="playerX" style={{ color: playerColors?.X }}>{playerNames.X}</h3>
        <div class="livescore">
          <span class="score1">{scores.X}</span>
          -
          <span class="score2">{scores.O}</span>
        </div>
        <h3 class="playerO" style={{ color: playerColors?.O }}>{playerNames.O}</h3>
      </div>
      
      <div class="game-container">
        {board.map((cell, index) => (
          <div
            key={index}
            class={`box ${cell ? 'filled' : 'unfilled'}`}
            onClick={() => handleCellClick(index)}
          >
            {cell && (
              <span class="tag" style={{ color: playerColors?.[cell] }}>
                {cell}
              </span>
            )}
          </div>
        ))}
        {winningCombo && (
          <div class="bar-wrapper">
            <div class="cross-bar">
              <div class={`boxx line-${winningCombo.join('-')}`}></div>
            </div>
          </div>
        )}
      </div>

      <div class="turn-indicator">
        <p>It is {currentPlayerName}'s turn</p>
      </div>

      {timerSeconds > 0 && !winningCombo && !(gameMode === 'vs' && currentPlayer === 'O') && (
        <div class={`timer-box ${timerUrgent ? 'timer-urgent' : ''}`}>
          <svg class="timer-ring" viewBox="0 0 36 36">
            <circle class="timer-ring-bg" cx="18" cy="18" r="15.9" />
            <circle
              class="timer-ring-fill"
              cx="18" cy="18" r="15.9"
              stroke-dasharray={`${timerPct} 100`}
              style={{ stroke: timerUrgent ? '#e74c3c' : 'var(--success-color)' }}
            />
          </svg>
          <span class="timer-number">{timeLeft}</span>
        </div>
      )}
    </main>
  );
}
