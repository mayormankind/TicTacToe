import { useMemo } from 'preact/hooks';

/**
 * Aggregate win/loss/draw counts per unique human player name.
 * AI opponents (PickBot) are excluded from the table.
 */
function computeStats(completedGames) {
  const map = {};

  const ensure = (name) => {
    if (name && name !== 'PickBot' && !map[name]) {
      map[name] = { wins: 0, losses: 0, draws: 0 };
    }
  };

  const isHuman = (name) => name && name !== 'PickBot';

  for (const { playerNames, result } of completedGames) {
    ensure(playerNames.X);
    ensure(playerNames.O);

    if (result === 'draw') {
      if (isHuman(playerNames.X)) map[playerNames.X].draws++;
      if (isHuman(playerNames.O)) map[playerNames.O].draws++;
    } else if (result === 'X') {
      if (isHuman(playerNames.X)) map[playerNames.X].wins++;
      if (isHuman(playerNames.O)) map[playerNames.O].losses++;
    } else if (result === 'O') {
      if (isHuman(playerNames.X)) map[playerNames.X].losses++;
      if (isHuman(playerNames.O)) map[playerNames.O].wins++;
    }
  }

  return Object.entries(map)
    .map(([name, s]) => {
      const total = s.wins + s.losses + s.draws;
      return { name, ...s, total, winRate: total > 0 ? Math.round((s.wins / total) * 100) : 0 };
    })
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate || a.name.localeCompare(b.name));
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function LeaderboardPage({ completedGames, onBack }) {
  const stats = useMemo(() => computeStats(completedGames), [completedGames]);

  return (
    <section class="leaderboard-page">
      <div class="leaderboard-header">
        <h2>Leaderboard</h2>
        <span class="cancel" onClick={onBack}>×</span>
      </div>

      {stats.length === 0 ? (
        <p class="empty-history">Play some games to see rankings here.</p>
      ) : (
        <div class="lb-table">
          <div class="lb-row lb-heading">
            <span class="lb-rank">#</span>
            <span class="lb-name">Player</span>
            <span class="lb-stat lb-win">W</span>
            <span class="lb-stat lb-loss">L</span>
            <span class="lb-stat lb-draw">D</span>
            <span class="lb-stat lb-total">Total</span>
            <span class="lb-stat lb-rate">Win %</span>
          </div>

          {stats.map((s, i) => (
            <div key={s.name} class={`lb-row ${i < 3 ? `lb-top-${i + 1}` : ''}`}>
              <span class="lb-rank">{MEDALS[i] ?? i + 1}</span>
              <span class="lb-name">{s.name}</span>
              <span class="lb-stat lb-win">{s.wins}</span>
              <span class="lb-stat lb-loss">{s.losses}</span>
              <span class="lb-stat lb-draw">{s.draws}</span>
              <span class="lb-stat lb-total">{s.total}</span>
              <span class="lb-stat lb-rate">{s.winRate}%</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
