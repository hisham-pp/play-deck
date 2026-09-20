/**
 * Synthesized Web Audio API sound service for Magnet Mayhem.
 * Generates magnetic attraction hums, repulsion shockwaves, crystal target chimes,
 * wall thuds, and electric hazard buzzes without any external audio files.
 */
class MagnetSoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private attractHumOsc: OscillatorNode | null = null;
  private attractHumGain: GainNode | null = null;

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
    if (!enabled) {
      this.stopAttractHum();
    }
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
      osc.stop(now + seconds + 0.02);
    } catch {
      // Audio autoplay policy handled
    }
  }

  playAttractPulse(): void {
    this.tone('sine', 480, 720, 0.1, 0.12);
  }

  startAttractHum(): void {
    if (!this.soundEnabled || this.attractHumOsc) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      amp.gain.setValueAtTime(0.06, now);

      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(now);

      this.attractHumOsc = osc;
      this.attractHumGain = amp;
    } catch {
      // Handled
    }
  }

  stopAttractHum(): void {
    if (this.attractHumOsc) {
      try {
        this.attractHumOsc.stop();
        this.attractHumOsc.disconnect();
      } catch {
        // Handled
      }
      this.attractHumOsc = null;
      this.attractHumGain = null;
    }
  }

  playRepelBlast(): void {
    this.tone('sawtooth', 360, 45, 0.28, 0.3);
  }

  playTargetPickup(tier: 'normal' | 'gold' | 'star' = 'normal'): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs =
        tier === 'star'
          ? [659.25, 830.61, 987.77, 1318.51]
          : tier === 'gold'
            ? [587.33, 739.99, 880]
            : [523.25, 659.25];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        amp.gain.setValueAtTime(0.18, now + i * 0.06);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.14);
        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.15);
      });
    } catch {
      // Handled
    }
  }

  playHazardZap(): void {
    this.tone('sawtooth', 750, 110, 0.35, 0.32);
  }

  playWallBounce(speed: number): void {
    const gain = Math.min(0.25, 0.06 + (speed / 500) * 0.15);
    this.tone('triangle', 180, 50, 0.12, gain);
  }

  playCountdown(isFinal = false): void {
    if (isFinal) {
      this.tone('sine', 880, 880, 0.3, 0.25);
    } else {
      this.tone('sine', 440, 440, 0.15, 0.18);
    }
  }

  playVictory(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        amp.gain.setValueAtTime(0.2, now + i * 0.09);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.28);
        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.3);
      });
    } catch {
      // Handled
    }
  }
}

export const magnetSoundService = new MagnetSoundService();
