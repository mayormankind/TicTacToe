export function HelpPage({ onClose }) {
  return (
    <section class="help">
      <div class="wrap">
        <h1>How to Play</h1>
        <span class="cancel" onClick={onClose}>×</span>
      </div>
      <div class="instructions">
        <p>
          To play the game, all you need to do is click any of the boxes. 
          The one vs one variant of the game is designed in rounds of 7. 
          The first player to reach score <b>seven (7)</b> wins and the game reloads again. 
          Play fair!!! 😎🤗
        </p>
      </div>
    </section>
  );
}
