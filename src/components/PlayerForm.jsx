import { useState } from 'preact/hooks';

const X_COLORS = [
  { label: 'Orange', value: '#d86e31' },
  { label: 'Red',    value: '#e74c3c' },
  { label: 'Gold',   value: '#f1c40f' },
  { label: 'Green',  value: '#2ecc71' },
  { label: 'Purple', value: '#9b59b6' },
];

const O_COLORS = [
  { label: 'Blue',  value: '#3498db' },
  { label: 'Teal',  value: '#1abc9c' },
  { label: 'Pink',  value: '#e91e63' },
  { label: 'Cyan',  value: '#00bcd4' },
  { label: 'White', value: '#ecf0f1' },
];

const TIMER_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '10 s', value: 10 },
  { label: '15 s', value: 15 },
  { label: '30 s', value: 30 },
];

export function PlayerForm({ mode, onSubmit, onCancel }) {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [rounds, setRounds] = useState(7);
  const [xColor, setXColor] = useState('#d86e31');
  const [oColor, setOColor] = useState('#3498db');
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Online-specific state
  const [matchType, setMatchType] = useState('random'); // 'random' | 'private'
  const [roomAction, setRoomAction] = useState('create'); // 'create' | 'join'
  const [roomCode, setRoomCode] = useState('');

  const decrementRounds = () => setRounds(r => Math.max(1, r - 1));
  const incrementRounds = () => setRounds(r => Math.min(20, r + 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'vs') {
      onSubmit({ player1, player2: 'PickBot', rounds, xColor, oColor, timerSeconds });
    } else if (mode === 'online') {
      const finalMatchType = matchType === 'random' ? 'random' : roomAction;
      onSubmit({ player1, matchType: finalMatchType, roomCode: finalMatchType === 'join' ? roomCode : '' });
    } else {
      onSubmit({ player1, player2, rounds, xColor, oColor, timerSeconds });
    }
  };

  const isLocal = mode === 'vs' || mode === 'mp';

  return (
    <div class="card">
      <form class="playcard" onSubmit={handleSubmit}>
        <div class="wrap">
          <h2>Players Card</h2>
          <span class="cancel" onClick={onCancel}>×</span>
        </div>

        {/* ── Name inputs ── */}
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

        {/* ── Online matchmaking type ── */}
        {mode === 'online' && (
          <div class="match-type-section">
            <label class="section-label">Match Type</label>
            <div class="segmented-control">
              <button type="button" class={matchType === 'random' ? 'active' : ''} onClick={() => setMatchType('random')}>
                Random
              </button>
              <button type="button" class={matchType === 'private' ? 'active' : ''} onClick={() => setMatchType('private')}>
                Private Room
              </button>
            </div>
            {matchType === 'private' && (
              <div class="private-options">
                <div class="segmented-control">
                  <button type="button" class={roomAction === 'create' ? 'active' : ''} onClick={() => setRoomAction('create')}>
                    Create Room
                  </button>
                  <button type="button" class={roomAction === 'join' ? 'active' : ''} onClick={() => setRoomAction('join')}>
                    Join Room
                  </button>
                </div>
                {roomAction === 'join' && (
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-character code"
                    value={roomCode}
                    onInput={(e) => setRoomCode(e.target.value.toUpperCase().trim())}
                    class="room-code-input"
                    required
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Rounds selector (local games only) ── */}
        {isLocal && (
          <div class="rounds-selector">
            <label>Wins to win match</label>
            <div class="rounds-controls">
              <button type="button" onClick={decrementRounds}>−</button>
              <span>{rounds}</span>
              <button type="button" onClick={incrementRounds}>+</button>
            </div>
          </div>
        )}

        {/* ── Turn timer (local games only) ── */}
        {isLocal && (
          <div class="option-row">
            <label class="section-label">Turn Timer</label>
            <div class="timer-options">
              {TIMER_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  class={timerSeconds === value ? 'active' : ''}
                  onClick={() => setTimerSeconds(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Colour pickers (local games only) ── */}
        {isLocal && (
          <div class="color-pickers">
            <div class="color-picker-row">
              <label>
                <span class="color-dot" style={{ background: xColor }} />
                {mode === 'mp' ? (player1 || 'Player 1') + ' (X)' : 'Your colour (X)'}
              </label>
              <div class="color-swatches">
                {X_COLORS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    class={`swatch ${xColor === value ? 'selected' : ''}`}
                    style={{ background: value }}
                    title={label}
                    onClick={() => setXColor(value)}
                  />
                ))}
              </div>
            </div>

            <div class="color-picker-row">
              <label>
                <span class="color-dot" style={{ background: oColor }} />
                {mode === 'mp' ? (player2 || 'Player 2') + ' (O)' : 'PickBot (O)'}
              </label>
              <div class="color-swatches">
                {O_COLORS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    class={`swatch ${oColor === value ? 'selected' : ''}`}
                    style={{ background: value }}
                    title={label}
                    onClick={() => setOColor(value)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div class="button">
          <button type="submit">Start</button>
          <button type="reset" onClick={() => { setPlayer1(''); setPlayer2(''); setRounds(7); setRoomCode(''); }}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
