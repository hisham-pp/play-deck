import { usePreferencesStore } from '@/stores/preferences.store';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

const OSC_SINE: OscillatorType = 'sine';

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = OSC_SINE,
  gain = 0.12,
): void {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export const game2048Sound = {
  playSlide(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      playTone(ctx, 240, 0.05, 'triangle', 0.08);
    } catch {
      // Audio is non-critical
    }
  },

  playMerge(value = 4): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      // Higher tile values produce a higher, richer pitched chime
      const exponent = Math.max(1, Math.log2(value || 4));
      const freq = 320 + exponent * 55;
      playTone(ctx, freq, 0.1, OSC_SINE, 0.14);

      if (value >= 128) {
        setTimeout(() => {
          if (ctx) playTone(ctx, freq * 1.25, 0.12, OSC_SINE, 0.12);
        }, 40);
      }
    } catch {
      // Audio is non-critical
    }
  },

  playWin(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (ctx) playTone(ctx, freq, 0.25, OSC_SINE, 0.18);
        }, idx * 110);
      });
    } catch {
      // Audio is non-critical
    }
  },

  playGameOver(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [320, 280, 240, 180];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (ctx) playTone(ctx, freq, 0.2, 'sawtooth', 0.08);
        }, idx * 120);
      });
    } catch {
      // Audio is non-critical
    }
  },
};
