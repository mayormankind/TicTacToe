export function HelpPage({ onClose }) {
  return (
    <section class="help">
      <div class="wrap">
        <h1>How to Play</h1>
        <span class="cancel" onClick={onClose}>×</span>
      </div>

      <div class="help-sections">

        <div class="help-card">
          <h2>The Basics</h2>
          <p>
            Pick n' Toe is Tic-Tac-Toe — first to get three of your symbols
            (X or O) in a row, column, or diagonal wins the round.
            Matches are played across multiple rounds; the first player to
            reach the <strong>win target</strong> takes the match.
          </p>
        </div>

        <div class="help-card">
          <h2>One vs One</h2>
          <p>
            Two players share the same device and take turns tapping cells.
            Before starting you can:
          </p>
          <ul class="help-list">
            <li>Enter both player names.</li>
            <li>Choose a <strong>win target</strong> (1 – 20 rounds) — the default is 7.</li>
            <li>Pick a <strong>symbol colour</strong> for each player.</li>
            <li>Set a <strong>turn timer</strong> (10 s / 15 s / 30 s) for extra pressure, or leave it off.</li>
          </ul>
          <p>When a player's timer hits zero their piece is placed automatically in a random empty cell.</p>
        </div>

        <div class="help-card">
          <h2>Vs Computer (PickBot)</h2>
          <p>Test yourself against the AI at three difficulty levels:</p>
          <ul class="help-list">
            <li><strong>Easy</strong> — PickBot picks a random cell every turn.</li>
            <li><strong>Medium</strong> — PickBot plays optimally half the time, randomly the other half.</li>
            <li><strong>Hard</strong> — PickBot uses the minimax algorithm and is effectively unbeatable. Draws are the best you can hope for!</li>
          </ul>
          <p>Select difficulty first, then enter your name and configure rounds and timer as usual.</p>
        </div>

        <div class="help-card">
          <h2>Battle Online</h2>
          <p>Play against another person in real time over the internet.</p>
          <ul class="help-list">
            <li><strong>Random Match</strong> — the server pairs you with the next available player automatically.</li>
            <li><strong>Private Room</strong> — create a 6-character room code and share it with a friend, or enter a code your friend sent you to join their room.</li>
          </ul>
          <p>
            If you lose your connection, you have <strong>10 seconds</strong> to
            reconnect before the game is forfeited. After a match ends you can
            offer a rematch — both players must accept for it to start.
          </p>
          <p>
            There's also an in-game <strong>chat</strong> so you can trash-talk
            your opponent in real time.
          </p>
        </div>

        <div class="help-card">
          <h2>History &amp; Replay</h2>
          <p>
            Every completed local game is saved to your browser's storage.
            Visit <strong>History</strong> from the main menu to browse past
            games grouped by date. Tap <em>Replay</em> on any game to step
            through its moves one by one, or use the Play button for an
            automatic playback.
          </p>
        </div>

        <div class="help-card">
          <h2>Leaderboard</h2>
          <p>
            The <strong>Leaderboard</strong> tallies wins, losses, draws and
            win-rate for every player name that appears in your game history.
            AI opponents (PickBot) are excluded. Online matches are included
            once they complete.
          </p>
        </div>

        <div class="help-card help-tip">
          <h2>Strategy Tip</h2>
          <p>
            Always take the centre (cell 5) on your first move if it's free —
            it's part of four winning lines. Corners are the next best choice.
            On Hard difficulty PickBot knows this too, so the game will always
            end in a draw with perfect play from both sides.
          </p>
        </div>

      </div>
    </section>
  );
}
