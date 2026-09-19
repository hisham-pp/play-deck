/**
 * Deliberately hushed audio. The game is played over whispered voice chat, so
 * the cues are short and low: a chime for loot, a thud for a mistake, and a
 * rising rumble for the only thing that really matters.
 */
class GiantSoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  private tone(type: OscillatorType, from: number, to: number, seconds: number, gain: number) {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(from, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + seconds);
      amp.gain.setValueAtTime(gain, now);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + seconds);

      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + seconds + 0.01);
    } catch {
      // Audio can be blocked until the first gesture; the heist plays on regardless.
    }
  }

  /** Loot lifted off its stand. */
  playTake(): void {
    this.tone('sine', 880, 1180, 0.12, 0.09);
  }

  /** A charm spent. */
  playCharm(): void {
    this.tone('triangle', 520, 880, 0.22, 0.1);
  }

  /** Something solid, and far too loud. */
  playBump(): void {
    this.tone('square', 180, 70, 0.14, 0.13);
  }

  /** The giant shifting. Gets lower and longer the closer he is to waking. */
  playStir(severity: number): void {
    this.tone('sine', 120 - severity * 30, 48, 0.5 + severity * 0.4, 0.14 + severity * 0.07);
  }

  playWake(): void {
    this.tone('sawtooth', 210, 40, 1.4, 0.26);
  }

  /** Out of the door with the loot. */
  playEscape(): void {
    this.tone('sine', 520, 920, 0.4, 0.16);
  }

  /** Each beat of the pre-heist countdown. */
  playCountdown(final: boolean): void {
    this.tone('sine', final ? 620 : 360, final ? 500 : 320, 0.13, 0.09);
  }
}

export const giantSound = new GiantSoundService();
