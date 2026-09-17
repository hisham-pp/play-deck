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

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
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

export const pongSoundService = {
  playPaddleHit(ballSpeed = 460): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      // Higher ball speed produces a crisper, higher pitch
      const pitchRatio = Math.min(2.0, ballSpeed / 460);
      const freq = 440 * pitchRatio;
      playTone(ctx, freq, 0.07, 'square', 0.1);
    } catch {
      // Audio errors are non-critical
    }
  },

  playWallBounce(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      playTone(ctx, 220, 0.05, 'triangle', 0.08);
    } catch {
      // Audio errors are non-critical
    }
  },

  playServe(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      playTone(ctx, 330, 0.08, 'sine', 0.09);
    } catch {
      // Audio errors are non-critical
    }
  },

  playScore(wonPoint = true): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      if (wonPoint) {
        // High ascending chime
        playTone(ctx, 523.25, 0.1, 'triangle', 0.12);
        setTimeout(() => {
          if (ctx) playTone(ctx, 659.25, 0.15, 'triangle', 0.12);
        }, 80);
      } else {
        // Lower descending blip
        playTone(ctx, 300, 0.12, 'sawtooth', 0.08);
        setTimeout(() => {
          if (ctx) playTone(ctx, 220, 0.16, 'sawtooth', 0.08);
        }, 90);
      }
    } catch {
      // Audio errors are non-critical
    }
  },

  playVictory(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (ctx) playTone(ctx, freq, 0.18, 'triangle', 0.14);
        }, idx * 110);
      });
    } catch {
      // Audio errors are non-critical
    }
  },

  playGameOver(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [440, 392, 349.23, 261.63]; // A4, G4, F4, C4
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (ctx) playTone(ctx, freq, 0.22, 'sine', 0.12);
        }, idx * 130);
      });
    } catch {
      // Audio errors are non-critical
    }
  },
};
