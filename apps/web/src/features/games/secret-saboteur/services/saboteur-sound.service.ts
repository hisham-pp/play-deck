class SaboteurSoundService {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  /** Dramatic whisper sting on secret role assignment */
  public playRoleReveal(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const freqs = [220, 277.18, 329.63];
    const now = ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = now + idx * 0.1;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.4);

      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  /** Tactile lock-in confirmation when a card is selected */
  public playCardLockIn(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /** Suspenseful shuffle during anonymous card reveal */
  public playContributionShuffle(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const t = now + i * 0.08;
      osc.type = 'square';
      osc.frequency.setValueAtTime(300 + i * 80, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.start(t);
      osc.stop(t + 0.06);
    }
  }

  /** Meltdown hazard alarm for critical strike events */
  public playMeltdownAlarm(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(330, now + 0.15);
    osc.frequency.setValueAtTime(440, now + 0.3);
    osc.frequency.setValueAtTime(330, now + 0.45);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /** Subsystem repair success chime */
  public playRepairSuccess(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const t = now + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  /** Interrogation gavel strike for trial/detention */
  public playGavelStrike(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.connect(boomGain);
    boomGain.connect(ctx.destination);

    boom.type = 'triangle';
    boom.frequency.setValueAtTime(110, now);
    boom.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    boomGain.gain.setValueAtTime(0.35, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    boom.start(now);
    boom.stop(now + 0.35);

    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.connect(snapGain);
    snapGain.connect(ctx.destination);

    snap.type = 'square';
    snap.frequency.setValueAtTime(800, now);

    snapGain.gain.setValueAtTime(0.15, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    snap.start(now);
    snap.stop(now + 0.05);
  }

  /** Sabotage card play negative sting */
  public playSabotageSting(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const tones = [293.66, 415.3]; // dissonant pair
    const now = ctx.currentTime;

    tones.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.85, now + 0.5);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }
}

export const saboteurSoundService = new SaboteurSoundService();
