export function WinnerScreen({ winner, onBackToMenu, onPlayAgain }) {
  return (
    <div class="winner-page">
      <p class="winner-quote">{winner} wins!</p>
      <div class="actions">
        <button onClick={onBackToMenu}>Back to Menu</button>
        <button onClick={onPlayAgain}>Play again</button>
      </div>
    </div>
  );
}
