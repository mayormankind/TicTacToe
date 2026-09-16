export function WinnerScreen({ winner, scores, playerNames, gameMode, difficulty, onBackToMenu, onPlayAgain }) {
  const isVsAI = gameMode === 'vs';

  return (
    <div class="winner-page">
      <div class="winner-trophy">🏆</div>
      <p class="winner-quote">{winner} wins!</p>

      {scores && playerNames && (
        <div class="winner-final-score">
          <span class="winner-player-name" style={{ color: 'var(--primary-color)' }}>
            {playerNames.X}
          </span>
          <span class="winner-score-display">{scores.X} — {scores.O}</span>
          <span class="winner-player-name" style={{ color: '#3498db' }}>
            {playerNames.O}
          </span>
        </div>
      )}

      {isVsAI && (
        <span class="winner-mode-tag">vs {difficulty} AI</span>
      )}

      <div class="actions">
        <button onClick={onBackToMenu}>Back to Menu</button>
        <button onClick={onPlayAgain}>Play again</button>
      </div>
    </div>
  );
}
