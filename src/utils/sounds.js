/**
 * Sound effects via the Web Audio API.
 * The AudioContext is created lazily on first use (browsers require a user
 * gesture before audio can play, so early creation is harmless but the
 * context may start suspended — we resume it before every play).
 */

let ctx = null;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null; // audio not supported
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(frequency, duration, type = 'sine', volume = 0.14, delay = 0) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.value = frequency;
  const start = c.currentTime + delay;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.01);
}

/** Short soft click on every piece placement. */
export function playMoveSound() {
  tone(480, 0.07, 'sine', 0.12);
}

/** Rising arpeggio — played when a match is won. */
export function playWinSound() {
  const notes = [261.63, 329.63, 392.0, 523.25]; // C4 E4 G4 C5
  notes.forEach((f, i) => tone(f, 0.18, 'triangle', 0.16, i * 0.09));
}

/** Descending minor fall — played on a draw. */
export function playDrawSound() {
  tone(370, 0.25, 'sine', 0.12, 0);
  tone(311, 0.35, 'sine', 0.10, 0.12);
}

/** Urgent double-beep — played when the move timer is about to expire. */
export function playTimerWarningSound() {
  tone(880, 0.06, 'square', 0.08, 0);
  tone(880, 0.06, 'square', 0.08, 0.12);
}
