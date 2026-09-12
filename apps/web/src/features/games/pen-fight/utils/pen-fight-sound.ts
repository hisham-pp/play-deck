/**
 * Fully synthesized sound effects (Web Audio API oscillators/noise) — no external
 * audio assets to download or ship, matching the procedurally-generated table texture.
 */
export class PenFightSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private masterGain: GainNode | null = null;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(
    frequency: number,
    duration: number,
    options: {
      type?: OscillatorType;
      endFrequency?: number;
      peakGain?: number;
      delay?: number;
    } = {},
  ): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const { type = 'sine', endFrequency, peakGain = 0.6, delay = 0 } = options;
    const start = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (endFrequency !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), start + duration);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peakGain, start + Math.min(0.02, duration * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  private noiseBurst(
    duration: number,
    options: { peakGain?: number; highpass?: number; delay?: number } = {},
  ): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const { peakGain = 0.5, highpass = 800, delay = 0 } = options;
    const start = ctx.currentTime + delay;

    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highpass;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peakGain, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  /** Elastic "twang" — pitch and intensity scale with flick power (0..1). */
  playFlick(power: number): void {
    const clamped = Math.min(Math.max(power, 0), 1);
    this.tone(220 + clamped * 180, 0.16, {
      type: 'triangle',
      endFrequency: 90,
      peakGain: 0.3 + clamped * 0.3,
    });
    this.noiseBurst(0.05, { peakGain: 0.15 + clamped * 0.15, highpass: 1200 });
  }

  /** Sharp plastic "clack" when the two pens collide. */
  playCollision(intensity: number): void {
    const clamped = Math.min(Math.max(intensity, 0.15), 1);
    this.noiseBurst(0.07, { peakGain: 0.25 + clamped * 0.35, highpass: 1800 });
    this.tone(520 + clamped * 260, 0.06, {
      type: 'square',
      endFrequency: 200,
      peakGain: 0.12 + clamped * 0.18,
    });
  }

  /** Descending whoosh + thud as a pen tumbles off the table edge. */
  playFall(): void {
    this.tone(500, 0.55, { type: 'sawtooth', endFrequency: 60, peakGain: 0.22 });
    this.tone(90, 0.3, { peakGain: 0.4, delay: 0.5 });
    this.noiseBurst(0.2, { peakGain: 0.3, highpass: 200, delay: 0.5 });
  }

  /** Bright three-note ascending chime for a round win. */
  playRoundWin(): void {
    this.tone(523.25, 0.18, { peakGain: 0.35 });
    this.tone(659.25, 0.18, { peakGain: 0.35, delay: 0.12 });
    this.tone(783.99, 0.3, { peakGain: 0.4, delay: 0.24 });
  }

  /** Bigger fanfare for the full match win. */
  playMatchWin(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.tone(freq, 0.32, { type: 'triangle', peakGain: 0.4, delay: i * 0.11 });
    });
    this.tone(392, 0.6, { peakGain: 0.2, delay: 0.1 });
  }

  /** Soft UI tap for buttons/menus. */
  playClick(): void {
    this.tone(700, 0.05, { type: 'square', endFrequency: 500, peakGain: 0.12 });
  }
}

export const penFightSound = new PenFightSoundEngine();
