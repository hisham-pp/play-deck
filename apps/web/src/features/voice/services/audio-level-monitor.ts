import { computeRms } from '../utils/voice-levels';
import { LEVEL_SAMPLE_INTERVAL_MS } from '../voice.constants';

interface MonitoredSource {
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  samples: Uint8Array<ArrayBuffer>;
}

type AudioContextCtor = typeof AudioContext;

function resolveAudioContext(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const scoped = window as Window & { webkitAudioContext?: AudioContextCtor };
  return window.AudioContext ?? scoped.webkitAudioContext ?? null;
}

/**
 * Samples every attached stream on one shared interval and reports normalised
 * levels, so the "who is talking" ring costs a single timer no matter how many
 * seats the room has.
 */
export class AudioLevelMonitor {
  private readonly onLevels: (levels: Record<string, number>) => void;
  private context: AudioContext | null = null;
  private readonly sources = new Map<string, MonitoredSource>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(onLevels: (levels: Record<string, number>) => void) {
    this.onLevels = onLevels;
  }

  attach(key: string, stream: MediaStream): void {
    const context = this.ensureContext();
    if (!context || this.sources.has(key)) return;
    if (stream.getAudioTracks().length === 0) return;

    try {
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      this.sources.set(key, {
        source,
        analyser,
        samples: new Uint8Array(analyser.fftSize),
      });
      this.ensureTimer();
    } catch {
      // A stream can end between presence sync and attach; nothing to monitor.
    }
  }

  detach(key: string): void {
    const entry = this.sources.get(key);
    if (!entry) return;
    entry.source.disconnect();
    this.sources.delete(key);
    if (this.sources.size === 0) this.clearTimer();
  }

  stop(): void {
    this.sources.forEach((entry) => entry.source.disconnect());
    this.sources.clear();
    this.clearTimer();
    void this.context?.close().catch(() => undefined);
    this.context = null;
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    const Ctor = resolveAudioContext();
    if (!Ctor) return null;
    this.context = new Ctor();
    return this.context;
  }

  private ensureTimer(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.sample(), LEVEL_SAMPLE_INTERVAL_MS);
  }

  private clearTimer(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  private sample(): void {
    const levels: Record<string, number> = {};
    this.sources.forEach((entry, key) => {
      entry.analyser.getByteTimeDomainData(entry.samples);
      levels[key] = computeRms(entry.samples);
    });
    this.onLevels(levels);
  }
}
