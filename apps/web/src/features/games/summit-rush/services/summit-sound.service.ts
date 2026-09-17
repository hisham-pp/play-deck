import { usePreferencesStore } from '@/stores/preferences.store';
import type { WorldEvent } from '../engine/summit-types';

let audioCtx: AudioContext | null = null;

interface EngineVoice {
  osc: OscillatorNode;
  sub: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
}

let engine: EngineVoice | null = null;

function soundOn(): boolean {
  return usePreferencesStore.getState().soundEnabled;
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioCtx ??= new Ctor();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0,
): void {
  const ctx = getContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function sweep(
  from: number,
  to: number,
  duration: number,
  type: OscillatorType,
  volume: number,
): void {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

function ensureEngine(ctx: AudioContext): EngineVoice {
  if (engine) return engine;
  const osc = ctx.createOscillator();
  const sub = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  sub.type = 'square';
  filter.type = 'lowpass';
  filter.frequency.value = 420;
  gain.gain.value = 0;
  osc.connect(filter);
  sub.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  sub.start();
  engine = { osc, sub, gain, filter };
  return engine;
}

function safely(fn: () => void): void {
  try {
    if (soundOn()) fn();
  } catch {
    // Audio is decorative; never let it break the game loop.
  }
}

export const summitSoundService = {
  /** Call on a user gesture so mobile browsers allow audio. */
  unlock(): void {
    safely(() => getContext());
  },

  /** Continuous engine drone; `rpm` is 0..1, `throttle` whether gas is held. */
  updateEngine(rpm: number, throttle: boolean, active: boolean): void {
    try {
      const ctx = audioCtx;
      if (!ctx) return;
      const voice = ensureEngine(ctx);
      const target = active && soundOn() ? (throttle ? 0.05 : 0.025) : 0;
      const now = ctx.currentTime;
      voice.gain.gain.setTargetAtTime(target, now, 0.08);
      const base = 48 + rpm * 110;
      voice.osc.frequency.setTargetAtTime(base, now, 0.05);
      voice.sub.frequency.setTargetAtTime(base / 2, now, 0.05);
      voice.filter.frequency.setTargetAtTime(throttle ? 700 : 380, now, 0.1);
    } catch {
      // Ignore audio failures.
    }
  },

  silenceEngine(): void {
    try {
      if (engine && audioCtx) engine.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    } catch {
      // Ignore audio failures.
    }
  },

  playEvent(event: WorldEvent): void {
    safely(() => {
      switch (event.type) {
        case 'coin':
          tone(event.value > 5 ? 1320 : 1046, 0.09, 'square', 0.05);
          tone(event.value > 5 ? 1760 : 1568, 0.12, 'square', 0.04, 0.05);
          return;
        case 'fuel':
          sweep(300, 900, 0.3, 'triangle', 0.12);
          return;
        case 'land':
          tone(
            90,
            0.12 + Math.min(0.2, event.impact / 60),
            'sine',
            Math.min(0.25, event.impact / 40),
          );
          return;
        case 'stunt':
          [659, 880, 1175].forEach((f, i) => tone(f, 0.14, 'triangle', 0.1, i * 0.07));
          return;
        case 'crash':
          sweep(400, 60, 0.6, 'sawtooth', 0.12);
          return;
        case 'low-fuel':
          tone(520, 0.12, 'square', 0.07);
          tone(520, 0.12, 'square', 0.07, 0.2);
          return;
        default:
      }
    });
  },

  playCountdown(final: boolean): void {
    safely(() => tone(final ? 880 : 440, final ? 0.35 : 0.15, 'triangle', 0.12));
  },

  playPurchase(): void {
    safely(() => [523, 784, 1046].forEach((f, i) => tone(f, 0.12, 'triangle', 0.1, i * 0.06)));
  },
};
