/**
 * Web Audio API synthesized sounds for Shared Brain.
 * Synthesizes footsteps, jump boings, bounce pad springs, token rings,
 * lever clicks, checkpoint pings, and stage fanfares.
 */
class SharedBrainSoundService {
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
      // Audio playback restrictions gracefully caught
    }
  }

  playStep(): void {
    this.tone('sine', 180, 80, 0.04, 0.05);
  }

  playJump(): void {
    this.tone('triangle', 260, 520, 0.14, 0.18);
  }

  playBounce(): void {
    this.tone('sine', 300, 780, 0.22, 0.25);
  }

  playToken(): void {
    this.tone('triangle', 880, 1320, 0.12, 0.18);
  }

  playLever(): void {
    this.tone('square', 320, 160, 0.08, 0.15);
  }

  playCheckpoint(): void {
    this.tone('triangle', 440, 660, 0.2, 0.2);
  }

  playDeath(): void {
    this.tone('sawtooth', 220, 60, 0.28, 0.25);
  }

  playVictory(): void {
    if (!this.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.tone('triangle', freq, freq * 1.05, 0.22, 0.2);
      }, idx * 100);
    });
  }

  play(
    sound: 'jump' | 'bounce' | 'token' | 'lever' | 'checkpoint' | 'death' | 'victory' | 'step',
  ): void {
    switch (sound) {
      case 'jump':
        return this.playJump();
      case 'bounce':
        return this.playBounce();
      case 'token':
        return this.playToken();
      case 'lever':
        return this.playLever();
      case 'checkpoint':
        return this.playCheckpoint();
      case 'death':
        return this.playDeath();
      case 'victory':
        return this.playVictory();
      case 'step':
        return this.playStep();
    }
  }

  setMuted(muted: boolean): void {
    this.setSoundEnabled(!muted);
  }
}

export const brainSoundService = new SharedBrainSoundService();
export const SharedBrainSoundServiceInstance = brainSoundService;
export { brainSoundService as SharedBrainSoundService };
