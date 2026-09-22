import confetti from 'canvas-confetti';

// Cooldown to prevent stacking multiple animations and visual pollution
let lastTriggerTime = 0;
const MIN_TRIGGER_INTERVAL = 2500; // at least 2.5s between celebrations

function canTrigger(force: boolean = false): boolean {
  const now = Date.now();
  if (!force && now - lastTriggerTime < MIN_TRIGGER_INTERVAL) {
    return false;
  }
  lastTriggerTime = now;
  return true;
}

/**
 * Trigger an ultra-soft, gentle celebratory sprinkle (for round wins, completions).
 * Minimal particle count, slow velocity, and smooth fade to avoid visual clutter.
 */
export function triggerWinnerConfetti(force: boolean = false) {
  if (!canTrigger(force)) return;

  try {
    confetti({
      particleCount: 28,
      spread: 50,
      startVelocity: 18,
      ticks: 45,
      gravity: 0.8,
      decay: 0.93,
      scalar: 0.7,
      origin: { y: 0.65, x: 0.5 },
      colors: ['#34D399', '#FBBF24', '#60A5FA', '#C084FC'],
      zIndex: 9999,
      disableForReducedMotion: true
    });
  } catch (err) {
    console.warn('Confetti error:', err);
  }
}
