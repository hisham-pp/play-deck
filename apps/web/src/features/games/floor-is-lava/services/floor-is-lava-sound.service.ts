/**
 * Synthesized Web Audio API sound service for Floor Is Lava.
 * Dynamic punchy sound effects: bubbling magma, tile cracking, push thuds, power-up chimes, and sizzle burns.
 */
class FloorIsLavaSoundService {
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
      // Audio autoplay policy handled gracefully
    }
  }

  playPush(): void {
    this.tone('triangle', 260, 60, 0.15, 0.25);
  }

  playSuperPush(): void {
    this.tone('sawtooth', 420, 40, 0.3, 0.35);
  }

  playTileCrack(): void {
    this.tone('sawtooth', 110, 45, 0.18, 0.15);
  }

  playSizzle(): void {
    this.tone('sawtooth', 600, 120, 0.35, 0.28);
  }

  playPowerUp(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        amp.gain.setValueAtTime(0.15, now + i * 0.07);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.12);
        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.13);
      });
    } catch {
      // Handled
    }
  }

  playFreeze(): void {
    this.tone('sine', 1200, 300, 0.4, 0.18);
  }

  playVictory(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        amp.gain.setValueAtTime(0.2, now + i * 0.1);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.25);
        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    } catch {
      // Handled
    }
  }
}

export const floorIsLavaSoundService = new FloorIsLavaSoundService();
