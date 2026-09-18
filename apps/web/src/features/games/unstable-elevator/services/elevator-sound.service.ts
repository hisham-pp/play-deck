type ToneShape = OscillatorType;

interface ToneOptions {
  shape: ToneShape;
  from: number;
  to: number;
  seconds: number;
  volume: number;
  delay?: number;
}

/**
 * The shaft's voice: a clunk when cargo lands, a rising whine while the lift
 * climbs, an alarm when something goes over the edge. Everything is synthesised
 * so the game ships no audio files.
 */
class ElevatorSoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) this.stopMotor();
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private tone({ shape, from, to, seconds, volume, delay = 0 }: ToneOptions): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = shape;
      osc.frequency.setValueAtTime(from, start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + seconds);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + seconds + 0.02);
    } catch {
      // The tab may not have had a gesture yet; silence is the right fallback.
    }
  }

  /** Cargo settling onto the deck. */
  playLand(): void {
    this.tone({ shape: 'triangle', from: 190, to: 60, seconds: 0.13, volume: 0.22 });
  }

  /** The claw letting go. */
  playRelease(): void {
    this.tone({ shape: 'square', from: 520, to: 320, seconds: 0.07, volume: 0.1 });
  }

  /** Something has gone over the edge. */
  playDrop(): void {
    this.tone({ shape: 'sawtooth', from: 420, to: 70, seconds: 0.5, volume: 0.22 });
    this.tone({ shape: 'square', from: 220, to: 160, seconds: 0.18, volume: 0.14, delay: 0.16 });
  }

  /** A floor survived. */
  playFloorCleared(): void {
    this.tone({ shape: 'sine', from: 520, to: 780, seconds: 0.12, volume: 0.14 });
    this.tone({ shape: 'sine', from: 780, to: 1040, seconds: 0.16, volume: 0.12, delay: 0.1 });
  }

  /** One tick of the countdown, and the brighter tick on "go". */
  playCountdown(final: boolean): void {
    this.tone({
      shape: 'sine',
      from: final ? 880 : 520,
      to: final ? 1180 : 520,
      seconds: final ? 0.28 : 0.1,
      volume: 0.14,
    });
  }

  /** The lift giving out. */
  playCollapse(): void {
    this.tone({ shape: 'sawtooth', from: 260, to: 40, seconds: 0.9, volume: 0.3 });
    this.tone({ shape: 'square', from: 120, to: 35, seconds: 0.7, volume: 0.2, delay: 0.12 });
  }

  /** Winds the motor hum up and down with how rough the ride is. */
  setMotor(intensity: number): void {
    if (!this.soundEnabled || intensity <= 0.01) {
      this.stopMotor();
      return;
    }
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (!this.motorOsc || !this.motorGain) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        this.motorOsc = osc;
        this.motorGain = gain;
      }
      const now = ctx.currentTime;
      this.motorOsc.frequency.setTargetAtTime(58 + intensity * 46, now, 0.08);
      this.motorGain.gain.setTargetAtTime(Math.min(0.07, intensity * 0.07), now, 0.12);
    } catch {
      // Ignore: the hum is decoration, never a dependency.
    }
  }

  stopMotor(): void {
    try {
      this.motorOsc?.stop();
    } catch {
      // Already stopped.
    }
    this.motorOsc = null;
    this.motorGain = null;
  }
}

export const elevatorSound = new ElevatorSoundService();
