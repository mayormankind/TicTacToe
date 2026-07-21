export function DifficultySelector({ selectedDifficulty, onSelect, onCancel }) {
  return (
    <div class="card">
      <div class="playcard">
        <div class="wrap">
          <h2>Select Difficulty</h2>
          <span class="cancel" onClick={onCancel}>×</span>
        </div>
        <div class="difficulty-buttons">
          <button class={selectedDifficulty === 'easy' ? 'active' : ''} onClick={() => onSelect('easy')}>Easy</button>
          <button 
            class={selectedDifficulty === 'medium' ? 'active' : ''}
            onClick={() => onSelect('medium')}
          >
            Medium
          </button>
          <button 
            class={selectedDifficulty === 'hard' ? 'active' : ''}
            onClick={() => onSelect('hard')}
          >
            Hard
          </button>
        </div>
      </div>
    </div>
  );
}
