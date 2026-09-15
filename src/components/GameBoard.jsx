export function GameBoard({ 
  board, 
  currentPlayer,
  playerNames,
  scores,
  gameMode,
  difficulty,
  onMove,
  onSwitchPlayer,
  onIncrementScore,
  onResetBoard,
  winningCombo
}) {
  const handleCellClick = (index) => {
    if (board[index] || winningCombo) return;
    
    // Don't switch player yet - we need to check the updated board first
    onMove(index);
  };

  // Game logic is now handled in App.jsx after board updates

  const currentPlayerName = playerNames[currentPlayer] || currentPlayer;

  return (
    <main class="app">
      <div class="counter">
        <h3 class="playerX">{playerNames.X}</h3>
        <div class="livescore">
          <span class="score1">{scores.X}</span>
          -
          <span class="score2">{scores.O}</span>
        </div>
        <h3 class="playerO">{playerNames.O}</h3>
      </div>
      
      <div class="game-container">
        {board.map((cell, index) => (
          <div
            key={index}
            class={`box ${cell ? 'filled' : 'unfilled'}`}
            onClick={() => handleCellClick(index)}
          >
            {cell && <span class="tag">{cell}</span>}
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
    </main>
  );
}
