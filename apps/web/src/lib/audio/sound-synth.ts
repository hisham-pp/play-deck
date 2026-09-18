import { usePreferencesStore } from '@/stores/preferences.store';

export type SoundEffectName =
  | 'dice-roll'
  | 'piece-move'
  | 'capture'
  | 'piece-home'
  | 'victory'
  | 'ui-click'
  | 'turn-pass'
  | 'rune-flip'
  | 'rune-match'
  | 'rune-mismatch'
  | 'rune-reveal'
  | 'rivet-lock'
  | 'fault-buzz'
  | 'klaxon';

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!sharedContext) {
    sharedContext = new AudioContextCtor();
  }
  if (sharedContext.state === 'suspended') {
    void sharedContext.resume();
  }
  return sharedContext;
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    startTime,
    duration,
    type = 'sine',
    gain = 0.2,
    frequencyEnd,
  }: {
    frequency: number;
    startTime: number;
    duration: number;
    type?: OscillatorType;
    gain?: number;
    frequencyEnd?: number;
  },
): void {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  if (frequencyEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(frequencyEnd, startTime + duration);
  }

  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function noiseBurst(
  ctx: AudioContext,
  { startTime, duration, gain = 0.15 }: { startTime: number; duration: number; gain?: number },
): void {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start(startTime);
  source.stop(startTime + duration);
}

function playDiceRoll(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const clatters = 6;
  for (let i = 0; i < clatters; i++) {
    const t = now + i * 0.08 + Math.random() * 0.02;
    noiseBurst(ctx, { startTime: t, duration: 0.06, gain: 0.12 * (1 - i / clatters) });
  }
}

function playPieceMove(ctx: AudioContext): void {
  tone(ctx, {
    frequency: 520,
    startTime: ctx.currentTime,
    duration: 0.08,
    type: 'triangle',
    gain: 0.15,
  });
}

function playCapture(ctx: AudioContext): void {
  const now = ctx.currentTime;
  tone(ctx, {
    frequency: 220,
    frequencyEnd: 90,
    startTime: now,
    duration: 0.3,
    type: 'sawtooth',
    gain: 0.2,
  });
  noiseBurst(ctx, { startTime: now, duration: 0.15, gain: 0.18 });
}

const OSC_SINE: OscillatorType = 'sine';
const OSC_TRIANGLE: OscillatorType = 'triangle';

function playPieceHome(ctx: AudioContext): void {
  const now = ctx.currentTime;
  [660, 880].forEach((freq, i) => {
    tone(ctx, {
      frequency: freq,
      startTime: now + i * 0.09,
      duration: 0.18,
      type: OSC_SINE,
      gain: 0.18,
    });
  });
}

function playVictory(ctx: AudioContext): void {
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(ctx, {
      frequency: freq,
      startTime: now + i * 0.12,
      duration: 0.35,
      type: OSC_TRIANGLE,
      gain: 0.2,
    });
  });
}

function playUiClick(ctx: AudioContext): void {
  tone(ctx, {
    frequency: 880,
    startTime: ctx.currentTime,
    duration: 0.05,
    type: 'square',
    gain: 0.08,
  });
}

function playTurnPass(ctx: AudioContext): void {
  tone(ctx, {
    frequency: 220,
    frequencyEnd: 160,
    startTime: ctx.currentTime,
    duration: 0.2,
    type: OSC_SINE,
    gain: 0.12,
  });
}

function playRuneFlip(ctx: AudioContext): void {
  const now = ctx.currentTime;
  tone(ctx, {
    frequency: 320,
    frequencyEnd: 90,
    startTime: now,
    duration: 0.08,
    type: OSC_TRIANGLE,
    gain: 0.22,
  });
  noiseBurst(ctx, { startTime: now, duration: 0.05, gain: 0.12 });
}

function playRuneReveal(ctx: AudioContext): void {
  tone(ctx, {
    frequency: 440,
    frequencyEnd: 660,
    startTime: ctx.currentTime,
    duration: 0.15,
    type: OSC_SINE,
    gain: 0.16,
  });
}

function playRuneMatch(ctx: AudioContext): void {
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(ctx, {
      frequency: freq,
      startTime: now + i * 0.04,
      duration: 0.45,
      type: OSC_TRIANGLE,
      gain: 0.16,
    });
  });
}

function playRuneMismatch(ctx: AudioContext): void {
  tone(ctx, {
    frequency: 200,
    frequencyEnd: 110,
    startTime: ctx.currentTime,
    duration: 0.22,
    type: OSC_SINE,
    gain: 0.18,
  });
}

/** A part seating home: a short metallic knock with a rising confirm chime. */
function playRivetLock(ctx: AudioContext): void {
  const now = ctx.currentTime;
  noiseBurst(ctx, { startTime: now, duration: 0.05, gain: 0.16 });
  tone(ctx, {
    frequency: 392,
    frequencyEnd: 784,
    startTime: now + 0.02,
    duration: 0.14,
    type: OSC_TRIANGLE,
    gain: 0.18,
  });
}

/** A rejected assembly: a flat, unhappy factory buzzer. */
function playFaultBuzz(ctx: AudioContext): void {
  const now = ctx.currentTime;
  [0, 0.16].forEach((offset) => {
    tone(ctx, {
      frequency: 150,
      startTime: now + offset,
      duration: 0.13,
      type: 'square',
      gain: 0.12,
    });
  });
}

/** The line failing: a two-tone klaxon sweeping down. */
function playKlaxon(ctx: AudioContext): void {
  const now = ctx.currentTime;
  [0, 0.34, 0.68].forEach((offset) => {
    tone(ctx, {
      frequency: 440,
      frequencyEnd: 220,
      startTime: now + offset,
      duration: 0.3,
      type: 'sawtooth',
      gain: 0.16,
    });
  });
}

const EFFECT_PLAYERS: Record<SoundEffectName, (ctx: AudioContext) => void> = {
  'dice-roll': playDiceRoll,
  'piece-move': playPieceMove,
  capture: playCapture,
  'piece-home': playPieceHome,
  victory: playVictory,
  'ui-click': playUiClick,
  'turn-pass': playTurnPass,
  'rune-flip': playRuneFlip,
  'rune-match': playRuneMatch,
  'rune-mismatch': playRuneMismatch,
  'rune-reveal': playRuneReveal,
  'rivet-lock': playRivetLock,
  'fault-buzz': playFaultBuzz,
  klaxon: playKlaxon,
};

/**
 * Plays a procedurally synthesized sound effect via the Web Audio API - no
 * bundled audio files. Silently does nothing when sound is disabled in
 * preferences or the browser has no AudioContext support.
 */
export function playSound(name: SoundEffectName): void {
  try {
    if (!usePreferencesStore.getState().soundEnabled) return;
    const ctx = getContext();
    if (!ctx) return;
    EFFECT_PLAYERS[name](ctx);
  } catch {
    // Sound is a non-critical enhancement; never let it throw into game logic.
  }
}
