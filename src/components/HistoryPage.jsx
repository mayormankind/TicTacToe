import { useMemo } from 'preact/hooks';

function formatGameLabel(game) {
  const { mode, difficulty, playerNames, result } = game;
  const human = playerNames.X;
  const opponent = mode === 'vs' ? `${difficulty} AI` : playerNames.O;

  if (result === 'draw') {
    return `Draw vs ${opponent}`;
  }

  if (mode === 'vs') {
    if (result === 'X') {
      return `✓ Beat ${difficulty} AI`;
    }
    return `Lost to ${difficulty} AI`;
  }

  if (result === 'X') {
    return `✓ Beat ${opponent}`;
  }
  return `Lost to ${opponent}`;
}

function groupByDate(games) {
  const grouped = {};
  games.forEach(game => {
    const date = new Date(game.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    let dateKey;
    if (isSameDay(date, today)) dateKey = 'Today';
    else if (isSameDay(date, yesterday)) dateKey = 'Yesterday';
    else dateKey = date.toLocaleDateString();

    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(game);
  });
  return grouped;
}

export function HistoryPage({ games, onReplay, onBack, onClear }) {
  const groupedGames = useMemo(() => groupByDate(games), [games]);
  const hasGames = games.length > 0;

  return (
    <section class="history-page">
      <div class="history-header">
        <h2>Game History</h2>
        <div class="history-actions">
          {hasGames && (
            <button onClick={onClear} class="clear-history">Clear</button>
          )}
          <span class="cancel" onClick={onBack}>×</span>
        </div>
      </div>

      <div class="history-list">
        {!hasGames ? (
          <p class="empty-history">No games played yet.</p>
        ) : (
          Object.entries(groupedGames).map(([date, dateGames]) => (
            <div key={date} class="history-group">
              <h3 class="history-date">{date}</h3>
              <div class="history-items">
                {dateGames.map(game => (
                  <div key={game.id} class="history-item">
                    <span class="history-label">{formatGameLabel(game)}</span>
                    <button onClick={() => onReplay(game)}>Replay</button>
                  </div>
                ))}
              </div>
              <hr class="history-divider" />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
