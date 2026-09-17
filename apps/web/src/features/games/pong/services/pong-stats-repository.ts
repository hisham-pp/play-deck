import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { PongDifficulty, PongStats } from '../engine/pong-types';

export const DEFAULT_PONG_STATS: PongStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  highestRally: 0,
  totalPointsScored: 0,
  vsAiWins: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  lastPlayedAt: '',
};

export interface IPongStatsRepository {
  getStats(): Promise<PongStats>;
  recordGameResult(
    won: boolean,
    isAi: boolean,
    difficulty: PongDifficulty,
    pointsScored: number,
    maxRally: number,
  ): Promise<PongStats>;
  resetStats(): Promise<PongStats>;
}

export class LocalPongStatsRepository implements IPongStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('pong');

  async getStats(): Promise<PongStats> {
    const stored = await StorageService.get<PongStats>(this.storageKey);
    if (!stored) {
      return { ...DEFAULT_PONG_STATS, vsAiWins: { ...DEFAULT_PONG_STATS.vsAiWins } };
    }
    return {
      ...DEFAULT_PONG_STATS,
      ...stored,
      vsAiWins: {
        ...DEFAULT_PONG_STATS.vsAiWins,
        ...(stored.vsAiWins || {}),
      },
    };
  }

  async recordGameResult(
    won: boolean,
    isAi: boolean,
    difficulty: PongDifficulty,
    pointsScored: number,
    maxRally: number,
  ): Promise<PongStats> {
    const current = await this.getStats();

    const updatedVsAiWins = { ...current.vsAiWins };
    if (won && isAi) {
      updatedVsAiWins[difficulty] = (updatedVsAiWins[difficulty] || 0) + 1;
    }

    const updated: PongStats = {
      ...current,
      gamesPlayed: current.gamesPlayed + 1,
      gamesWon: won ? current.gamesWon + 1 : current.gamesWon,
      gamesLost: !won ? current.gamesLost + 1 : current.gamesLost,
      highestRally: Math.max(current.highestRally, maxRally),
      totalPointsScored: current.totalPointsScored + pointsScored,
      vsAiWins: updatedVsAiWins,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<PongStats> {
    const reset = { ...DEFAULT_PONG_STATS, vsAiWins: { ...DEFAULT_PONG_STATS.vsAiWins } };
    await StorageService.set(this.storageKey, reset);
    return reset;
  }
}

export const pongStatsRepository = new LocalPongStatsRepository();
