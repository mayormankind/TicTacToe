import { useState } from 'preact/hooks';

export function PlayerForm({ mode, onSubmit, onCancel }) {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [rounds, setRounds] = useState(7);

  const decrementRounds = () => setRounds(r => Math.max(1, r - 1));
  const incrementRounds = () => setRounds(r => Math.min(20, r + 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'vs') {
      onSubmit({ player1, player2: 'PickBot', rounds });
    } else {
      onSubmit({ player1, player2, rounds });
    }
  };

  return (
    <div class="card">
      <form class="playcard" onSubmit={handleSubmit}>
        <div class="wrap">
          <h2>Players Card</h2>
          <span class="cancel" onClick={onCancel}>×</span>
        </div>
        <input
          type="text"
          maxLength={20}
          placeholder={mode === 'vs' ? "Enter your name" : "Enter player one's name"}
          value={player1}
          onInput={(e) => setPlayer1(e.target.value)}
          required
        />
        {mode === 'mp' && (
          <input
            type="text"
            maxLength={20}
            placeholder="Enter player two's name"
            value={player2}
            onInput={(e) => setPlayer2(e.target.value)}
            required
          />
        )}
        {mode !== 'online' && (
          <div class="rounds-selector">
            <label>Wins to win match</label>
            <div class="rounds-controls">
              <button type="button" onClick={decrementRounds}>−</button>
              <span>{rounds}</span>
              <button type="button" onClick={incrementRounds}>+</button>
            </div>
          </div>
        )}
        <div class="button">
          <button type="submit">Start</button>
          <button type="reset" onClick={() => { setPlayer1(''); setPlayer2(''); setRounds(7); }}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
