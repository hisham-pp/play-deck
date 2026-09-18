import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { FlappyStats } from '../engine/flappy-types';

export const DEFAULT_FLAPPY_STATS: FlappyStats = {
  bestScore: 0,
  gamesPlayed: 0,
  totalScore: 0,
  pipesCleared: 0,
  lastPlayedAt: '',
};

export interface IFlappyStatsRepository {
  getStats(): Promise<FlappyStats>;
  recordGameResult(score: number, pipesCleared: number): Promise<FlappyStats>;
  resetStats(): Promise<FlappyStats>;
}

export class LocalFlappyStatsRepository implements IFlappyStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('flappy-arcade');

  async getStats(): Promise<FlappyStats> {
    const stored = await StorageService.get<FlappyStats>(this.storageKey);
    if (!stored) {
      return { ...DEFAULT_FLAPPY_STATS };
    }
    return {
      ...DEFAULT_FLAPPY_STATS,
      ...stored,
    };
  }

  async recordGameResult(score: number, pipesCleared: number): Promise<FlappyStats> {
    const current = await this.getStats();

    const updated: FlappyStats = {
      bestScore: Math.max(current.bestScore, score),
      gamesPlayed: current.gamesPlayed + 1,
      totalScore: current.totalScore + score,
      pipesCleared: current.pipesCleared + pipesCleared,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<FlappyStats> {
    const reset = { ...DEFAULT_FLAPPY_STATS };
    await StorageService.set(this.storageKey, reset);
    return reset;
  }
}

export const flappyStatsRepository = new LocalFlappyStatsRepository();
