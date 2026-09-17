import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { BallBounceStats } from '../types/ball-bounce.types';

export const DEFAULT_BALL_BOUNCE_STATS: BallBounceStats = {
  gamesPlayed: 0,
  highScore: 0,
  highestLevel: 0,
  bestCombo: 0,
  totalBlocks: 0,
  lastPlayedAt: '',
};

export interface RunSummary {
  score: number;
  level: number;
  bestCombo: number;
  blocksBroken: number;
}

export interface IBallBounceStatsRepository {
  getStats(): Promise<BallBounceStats>;
  recordRun(run: RunSummary): Promise<{ isNewHighScore: boolean; stats: BallBounceStats }>;
}

export class LocalBallBounceStatsRepository implements IBallBounceStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('ball-bounce');

  async getStats(): Promise<BallBounceStats> {
    const stored = await StorageService.get<BallBounceStats>(this.storageKey);
    return { ...DEFAULT_BALL_BOUNCE_STATS, ...(stored ?? {}) };
  }

  async recordRun(run: RunSummary): Promise<{ isNewHighScore: boolean; stats: BallBounceStats }> {
    const current = await this.getStats();
    const isNewHighScore = run.score > current.highScore;
    const updated: BallBounceStats = {
      gamesPlayed: current.gamesPlayed + 1,
      highScore: Math.max(current.highScore, run.score),
      highestLevel: Math.max(current.highestLevel, run.level),
      bestCombo: Math.max(current.bestCombo, run.bestCombo),
      totalBlocks: current.totalBlocks + run.blocksBroken,
      lastPlayedAt: new Date().toISOString(),
    };
    await StorageService.set(this.storageKey, updated);
    return { isNewHighScore, stats: updated };
  }
}

export const ballBounceStatsRepository = new LocalBallBounceStatsRepository();
