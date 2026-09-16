import { useOnlineGame } from '../hooks/useOnlineGame';
import { ChatBox } from './ChatBox';

export function OnlineGame({ playerName, matchType, roomCode, onBackToMenu, onMatchComplete }) {
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
    privateRoomCode,
    privateRoomError,
    messages,
    makeMove,
    cancelSearch,
    offerRematch,
    declineRematch,
    sendMessage,
  } = useOnlineGame(playerName, matchType, roomCode, onMatchComplete);

  const handleCellClick = (index) => {
    if (board[index] || currentPlayer !== mySymbol || phase !== 'playing') return;
    makeMove(index);
  };

  const handleCancel = () => {
    cancelSearch();
    try { sessionStorage.removeItem('ttt_online_session'); } catch {}
    onBackToMenu();
  };

  const handleBackToMenu = () => {
    try { sessionStorage.removeItem('ttt_online_session'); } catch {}
    onBackToMenu();
  };

  // ── Loading / search states ──

  if (phase === 'finding' || phase === 'joining') {
    return (
      <div class="online-game finding">
        <h2>{phase === 'joining' ? 'Joining Room...' : 'Finding Match...'}</h2>
        <div class="spinner"></div>
        {privateRoomError && <p class="private-room-error">{privateRoomError}</p>}
        <button onClick={handleCancel}>Cancel</button>
      </div>
    );
  }

  if (phase === 'waiting_for_friend') {
    return (
      <div class="online-game finding">
        <h2>Room Created!</h2>
        <p class="room-share-label">Share this code with your friend:</p>
        <div class="room-code-display">{privateRoomCode ?? '------'}</div>
        <p class="room-share-hint">Waiting for them to join...</p>
        <div class="spinner"></div>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    );
  }

  if (phase === 'rejoining') {
    return (
      <div class="online-game finding">
        <h2>Reconnecting...</h2>
        <div class="spinner"></div>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    );
  }

  if (phase === 'matched') {
    return (
      <div class="online-game finding">
        <h2>Match Found!</h2>
        <div class="match-found-players">
          <span class="match-player">{playerNames.X}</span>
          <span class="match-vs">VS</span>
          <span class="match-player">{playerNames.O}</span>
        </div>
        <p class="match-target">First to {winTarget} wins</p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div class="online-game finding">
        <h2>Cannot Connect</h2>
        <p class="private-room-error">Could not reach the game server. Please try again.</p>
        <button onClick={handleBackToMenu}>Back to Menu</button>
      </div>
    );
  }

  if (phase === 'disconnected') {
    return (
      <div class="winner-page">
        <p class="winner-quote">Opponent Left</p>
        <p class="winner-name">{opponentName} disconnected from the match</p>
        <div class="actions">
          <button onClick={handleBackToMenu}>Back to Menu</button>
        </div>
      </div>
    );
  }

  if (phase === 'match_end') {
    const iWon = matchWinner === mySymbol;

    return (
      <div class="winner-page">
        <div class="winner-trophy">🏆</div>
        <p class="winner-quote">{iWon ? 'You Win!' : 'You Lost'}</p>
        <p class="winner-name">
          {playerNames.X} {scores.X} — {scores.O} {playerNames.O}
        </p>
        <div class="actions">
          {rematchState === 'idle' && (
            <>
              <button onClick={offerRematch}>Rematch</button>
              <button onClick={handleBackToMenu}>Back to Menu</button>
            </>
          )}
          {rematchState === 'waiting' && (
            <>
              <p class="rematch-status">Waiting for {opponentName}...</p>
              <button onClick={handleBackToMenu}>Back to Menu</button>
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
              <button onClick={handleBackToMenu}>Back to Menu</button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Active game board ──
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
    <main class="app online-app">
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

      <ChatBox messages={messages} onSend={sendMessage} myName={playerName} />
    </main>
  );
}
