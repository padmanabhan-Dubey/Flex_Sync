// Audio synthesizer using Web Audio API for zero-asset ultra-responsive notification sounds and ringing alert

let audioCtx: AudioContext | null = null;
let ringingInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a modern, gentle notification chime (two-tone marimba chime)
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2 (higher, sweet bell harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.25, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Start high-priority pulsing phone siren for "Find My Phone"
 */
export function startRingingAlert() {
  if (ringingInterval) return;

  const playPulse = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.linearRampToValueAtTime(1150, now + 0.25);
      osc.frequency.linearRampToValueAtTime(850, now + 0.5);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);

      // Trigger hardware vibration if supported (Android devices)
      if ('vibrate' in navigator) {
        navigator.vibrate([400, 150, 400]);
      }
    } catch (err) {
      console.warn('Ringing sound error:', err);
    }
  };

  playPulse();
  ringingInterval = window.setInterval(playPulse, 900);
}

/**
 * Stop "Find My Phone" siren
 */
export function stopRingingAlert() {
  if (ringingInterval) {
    clearInterval(ringingInterval);
    ringingInterval = null;
  }
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}
