/**
 * Sparse, low audio cues. Shadow Tag is played largely by ear over voice chat,
 * so the game itself keeps quiet: a thud for a tag, a soft clack for a lamp,
 * and nothing else competing with the room.
 */
class ShadowTagSoundService {
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
      // Audio can be blocked until the first gesture; the game plays on regardless.
    }
  }

  /** The mark changing hands. */
  playTag(): void {
    this.tone('sine', 220, 60, 0.28, 0.22);
  }

  /** Somebody covered or turned a lamp. */
  playLamp(): void {
    this.tone('triangle', 520, 300, 0.1, 0.1);
  }

  /** Each beat of the pre-round countdown. */
  playCountdown(final: boolean): void {
    this.tone('sine', final ? 660 : 380, final ? 520 : 340, 0.14, 0.11);
  }

  playRoundEnd(): void {
    this.tone('sawtooth', 300, 120, 0.5, 0.14);
  }
}

export const shadowTagSound = new ShadowTagSoundService();
