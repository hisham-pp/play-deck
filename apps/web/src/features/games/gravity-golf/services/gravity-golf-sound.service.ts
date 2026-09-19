/**
 * Synthesized Web Audio API sound service for Gravity Golf.
 * Cosmic synth pads, gravitational whooshes, resonant pings, and cup fanfare.
 */
class GravityGolfSoundService {
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
      // Audio autoplay restrictions gracefully handled
    }
  }

  playPlaceObject(): void {
    this.tone('triangle', 580, 880, 0.12, 0.15);
  }

  playRemoveObject(): void {
    this.tone('sine', 480, 240, 0.14, 0.15);
  }

  playLaunch(): void {
    this.tone('sine', 140, 420, 0.35, 0.25);
  }

  playBounce(): void {
    this.tone('triangle', 360, 520, 0.16, 0.2);
  }

  playHazardAbsorb(): void {
    this.tone('sawtooth', 180, 45, 0.4, 0.28);
  }

  playCupSink(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      // Sparkling harmonic arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const delay = idx * 0.07;
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        amp.gain.setValueAtTime(0.18, now);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch {
      // Ignore audio failure
    }
  }

  playHoleComplete(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const fanfare = [440, 554.37, 659.25, 880]; // A major
      fanfare.forEach((freq, idx) => {
        const delay = idx * 0.1;
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        amp.gain.setValueAtTime(0.2, now);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      });
    } catch {
      // Ignore audio failure
    }
  }
}

export const gravityGolfSound = new GravityGolfSoundService();
