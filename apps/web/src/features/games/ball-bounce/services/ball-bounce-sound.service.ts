import { usePreferencesStore } from '@/stores/preferences.store';
import type { BallBounceEvent } from '../types/ball-bounce.types';

let audioCtx: AudioContext | null = null;
const lastPlayed = new Map<string, number>();
/** Minimum ms between repeats of the same sound, so multi-ball never turns into noise. */
const MIN_GAP_MS = 45;
const TRIANGLE: OscillatorType = 'triangle';

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

function tone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  delay = 0,
  slideTo?: number,
): void {
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.006);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function throttled(key: string): boolean {
  const now = performance.now();
  const last = lastPlayed.get(key) ?? 0;
  if (now - last < MIN_GAP_MS) return true;
  lastPlayed.set(key, now);
  return false;
}

function playEvent(ctx: AudioContext, e: BallBounceEvent): void {
  switch (e.type) {
    case 'paddle':
      if (!throttled(e.type)) tone(ctx, 330, 0.08, TRIANGLE, 0.16, 0, 420);
      break;
    case 'wall':
      if (!throttled(e.type)) tone(ctx, 210, 0.04, 'sine', 0.07);
      break;
    case 'block-hit':
      if (!throttled(e.type)) tone(ctx, 260, 0.06, 'square', 0.05);
      break;
    case 'block-break': {
      if (throttled(e.type)) break;
      // Pitch climbs with the combo, capped at roughly two octaves.
      const step = Math.min(e.combo - 1, 24);
      const freq = 440 * Math.pow(2, step / 12);
      tone(ctx, freq, 0.09, 'square', 0.06);
      tone(ctx, freq * 1.5, 0.07, 'sine', 0.05, 0.02);
      break;
    }
    case 'power-up':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(ctx, f, 0.1, TRIANGLE, 0.12, i * 0.05),
      );
      break;
    case 'launch':
      tone(ctx, 300, 0.1, 'sine', 0.08, 0, 600);
      break;
    case 'life-lost':
      tone(ctx, 300, 0.35, 'sawtooth', 0.07, 0, 90);
      break;
    case 'level-clear':
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(ctx, f, 0.16, TRIANGLE, 0.13, i * 0.08),
      );
      break;
    case 'game-over':
      [330, 262, 220, 165].forEach((f, i) => tone(ctx, f, 0.28, 'sawtooth', 0.07, 0.35 + i * 0.16));
      break;
    default:
      break;
  }
}

export const ballBounceSound = {
  /** Call from a user gesture so browsers allow audio later in the loop. */
  unlock(): void {
    try {
      getAudioContext();
    } catch {
      // Audio is non-critical
    }
  },

  countdownTick(final: boolean): void {
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      tone(ctx, final ? 880 : 520, final ? 0.22 : 0.1, TRIANGLE, 0.12);
    } catch {
      // Audio is non-critical
    }
  },

  play(events: BallBounceEvent[]): void {
    if (events.length === 0) return;
    try {
      if (!usePreferencesStore.getState().soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      for (const e of events) playEvent(ctx, e);
    } catch {
      // Audio is non-critical
    }
  },
};
