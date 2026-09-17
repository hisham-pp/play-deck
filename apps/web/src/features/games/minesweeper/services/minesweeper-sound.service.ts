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
  gain = 0.15,
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

const OSC_SINE: OscillatorType = 'sine';

export const minesweeperSound = {
  playReveal(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      playTone(ctx, 480, 0.08, 'triangle', 0.12);
    } catch {
      // Audio is non-critical
    }
  },

  playFlag(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      playTone(ctx, 620, 0.06, OSC_SINE, 0.14);
    } catch {
      // Audio is non-critical
    }
  },

  playUnflag(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      playTone(ctx, 380, 0.06, OSC_SINE, 0.12);
    } catch {
      // Audio is non-critical
    }
  },

  playChord(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      playTone(ctx, 520, 0.05, 'triangle', 0.1);
      setTimeout(() => {
        if (ctx) playTone(ctx, 660, 0.08, 'triangle', 0.12);
      }, 50);
    } catch {
      // Audio is non-critical
    }
  },

  playExplosion(): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const duration = 0.4;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(80, ctx.currentTime + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + duration);
    } catch {
      // Audio is non-critical
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
          if (ctx) playTone(ctx, freq, 0.3, OSC_SINE, 0.18);
        }, idx * 120);
      });
    } catch {
      // Audio is non-critical
    }
  },
};
