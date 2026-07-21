export function HomePage({ onSelectMode }) {
  return (
    <section class="home-page">
      <h1>Pick n' Toe</h1>
      <div class="actions">
        <button onClick={() => onSelectMode('online')}>Battle Online</button>
        <button onClick={() => onSelectMode('vs')}>Vs Computer</button>
        <button onClick={() => onSelectMode('mp')}>One Vs One</button>
        <button onClick={() => onSelectMode('history')}>History</button>
        <button onClick={() => onSelectMode('help')}>Help</button>
      </div>
    </section>
  );
}
