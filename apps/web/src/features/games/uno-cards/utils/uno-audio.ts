export const UNO_SOUND_PLAY = 'play' as const;
export const UNO_SOUND_ACTION = 'action' as const;
export const UNO_SOUND_DRAW = 'draw' as const;
export const UNO_SOUND_WILD = 'wild' as const;
export const UNO_SOUND_LAST_CARD = 'last_card' as const;
export const UNO_SOUND_WIN = 'win' as const;

export type UnoSoundType =
  | typeof UNO_SOUND_PLAY
  | typeof UNO_SOUND_ACTION
  | typeof UNO_SOUND_DRAW
  | typeof UNO_SOUND_WILD
  | typeof UNO_SOUND_LAST_CARD
  | typeof UNO_SOUND_WIN;

export function playUnoAudio(
  ctx: AudioContext | null,
  type: UnoSoundType,
  enabled: boolean,
): AudioContext | null {
  if (!enabled) return ctx;
  try {
    let audioCtx = ctx;
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === UNO_SOUND_PLAY) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === UNO_SOUND_ACTION) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === UNO_SOUND_DRAW) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === UNO_SOUND_WILD) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.08);
      osc.frequency.setValueAtTime(659, now + 0.16);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === UNO_SOUND_LAST_CARD) {
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === UNO_SOUND_WIN) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.12);
      osc.frequency.setValueAtTime(783, now + 0.24);
      osc.frequency.setValueAtTime(1046, now + 0.36);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    }
    return audioCtx;
  } catch {
    return ctx;
  }
}
