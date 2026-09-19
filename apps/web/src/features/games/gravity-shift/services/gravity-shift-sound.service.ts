/**
 * Synthesized Web Audio API sound service for Gravity Shift.
 * High-energy arcade sound effects: gravity whooshes, jump pops, bounce pads, and victory fanfares.
 */
class GravityShiftSoundService {
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

  isSoundEnabled(): boolean {
    return this.soundEnabled;
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
      // Graceful fallback for audio policy
    }
  }

  playJump(): void {
    this.tone('square', 220, 520, 0.12, 0.12);
  }

  playBounce(): void {
    this.tone('sine', 280, 840, 0.22, 0.2);
  }

  playGravityShift(): void {
    this.tone('sawtooth', 720, 180, 0.35, 0.25);
  }

  playCheckpoint(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        amp.gain.setValueAtTime(0.12, now + i * 0.06);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.12);
        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.13);
      });
    } catch {
      // Ignored
    }
  }

  playHazard(): void {
    this.tone('sawtooth', 140, 50, 0.25, 0.25);
  }

  playVictory(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        amp.gain.setValueAtTime(0.18, now + i * 0.12);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.3);
        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.35);
      });
    } catch {
      // Ignored
    }
  }
}

export const gravityShiftSoundService = new GravityShiftSoundService();
