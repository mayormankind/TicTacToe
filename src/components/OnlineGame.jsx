import { useOnlineGame } from '../hooks/useOnlineGame';

export function OnlineGame({ playerName, onBackToMenu }) {
  const {
    phase,
    board,
    currentPlayer,
    mySymbol,
    opponentName,
    scores,
    winTarget,
    winningCombo,
    roundResult,
    matchWinner,
    rematchState,
    playerNames,
    makeMove,
    cancelSearch,
    offerRematch,
    declineRematch,
  } = useOnlineGame(playerName);

  const handleCellClick = (index) => {
    if (board[index] || currentPlayer !== mySymbol || phase !== 'playing') return;
    makeMove(index);
  };

  const handleCancel = () => {
    cancelSearch();
    onBackToMenu();
  };

  if (phase === 'finding') {
    return (
      <div class="online-game finding">
        <h2>Finding Match...</h2>
        <div class="spinner"></div>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    );
  }

  if (phase === 'disconnected') {
    return (
      <div class="winner-page">
        <p class="winner-quote">Opponent Left</p>
        <p class="winner-name">{opponentName} disconnected from the match</p>
        <div class="actions">
          <button onClick={onBackToMenu}>Back to Menu</button>
        </div>
      </div>
    );
  }

  if (phase === 'match_end') {
    const iWon = matchWinner === mySymbol;

    return (
      <div class="winner-page">
        <p class="winner-quote">{iWon ? 'You Win the Match!' : 'You Lost the Match'}</p>
        <p class="winner-name">
          {playerNames.X} {scores.X} — {scores.O} {playerNames.O}
        </p>
        <div class="actions">
          {rematchState === 'idle' && (
            <>
              <button onClick={offerRematch}>Rematch</button>
              <button onClick={onBackToMenu}>Back to Menu</button>
            </>
          )}
          {rematchState === 'waiting' && (
            <>
              <p class="rematch-status">Waiting for {opponentName}...</p>
              <button onClick={onBackToMenu}>Back to Menu</button>
            </>
          )}
          {rematchState === 'offered' && (
            <>
              <p class="rematch-status">{opponentName} wants a rematch!</p>
              <button onClick={offerRematch}>Accept</button>
              <button onClick={declineRematch}>Decline</button>
            </>
          )}
          {rematchState === 'declined' && (
            <>
              <p class="rematch-status">Rematch declined</p>
              <button onClick={onBackToMenu}>Back to Menu</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const turnText = phase === 'round_end'
    ? roundResult?.isDraw
      ? "It's a Draw! Next round starting..."
      : roundResult?.winner === mySymbol
        ? 'You won this round! Next round starting...'
        : `${opponentName} won this round! Next round starting...`
    : currentPlayer === mySymbol
      ? 'Your turn'
      : `${opponentName}'s turn`;

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
        <p>{turnText}</p>
      </div>

      <div class="win-target-info">
        <p>First to {winTarget} wins</p>
      </div>
    </main>
  );
}
