/**
 * Synthesized Web Audio API sound effects for Reverse Racing.
 * Synthesizes engine revs, screeching lane shifts, jump springs, crash crunches,
 * obstacle placement thuds, and finish fanfares.
 */
class ReverseRacingSoundService {
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
      // Autoplay or audio restrictions gracefully handled
    }
  }

  playSteer(): void {
    this.tone('sine', 440, 280, 0.08, 0.12);
  }

  playJump(): void {
    this.tone('triangle', 220, 680, 0.18, 0.2);
  }

  playCrash(): void {
    this.tone('sawtooth', 180, 45, 0.35, 0.35);
  }

  playOilSlick(): void {
    this.tone('sine', 600, 300, 0.25, 0.18);
  }

  playSpeedBump(): void {
    this.tone('square', 140, 80, 0.12, 0.2);
  }

  playBoostPad(): void {
    this.tone('triangle', 320, 950, 0.28, 0.25);
  }

  playObstaclePlaced(): void {
    this.tone('triangle', 350, 120, 0.14, 0.22);
  }

  playEnergyWarning(): void {
    this.tone('sine', 200, 180, 0.1, 0.1);
  }

  playFinish(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.tone('triangle', freq, freq * 1.05, 0.25, 0.25);
      }, idx * 110);
    });
  }
}

export const soundService = new ReverseRacingSoundService();
