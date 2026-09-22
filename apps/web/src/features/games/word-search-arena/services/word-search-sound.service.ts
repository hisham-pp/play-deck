// Minimal Web Audio sound effects for Word Search Arena
export class WordSearchSoundService {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  private beep(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  playSelect() {
    this.beep(660, 0.06, 'square', 0.08);
  }

  playWordFound() {
    const ctx = this.getCtx();
    if (!ctx) return;
    [523, 659, 784].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
      vol.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  }

  playInvalid() {
    this.beep(180, 0.15, 'square', 0.1);
  }

  playFinish() {
    const ctx = this.getCtx();
    if (!ctx) return;
    [784, 1047, 1319].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.15);
      vol.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.35);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.35);
    });
  }
}

export const wordSearchSoundService = new WordSearchSoundService();
