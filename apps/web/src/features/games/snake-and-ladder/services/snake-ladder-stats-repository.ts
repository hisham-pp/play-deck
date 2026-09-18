import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { SnakeLadderStats } from '../types/snake-and-ladder.types';

export interface ISnakeLadderStatsRepository {
  getStats(): Promise<SnakeLadderStats>;
  recordGameResult(params: {
    won: boolean;
    finishRank: number | null;
    longestClimb: number;
    worstSlide: number;
  }): Promise<SnakeLadderStats>;
}

const DEFAULT_STATS: SnakeLadderStats = {
  gamesPlayed: 0,
  wins: 0,
  bestFinishRank: null,
  longestClimb: 0,
  worstSlide: 0,
  lastPlayedAt: '',
};

export class LocalSnakeLadderStatsRepository implements ISnakeLadderStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('snake-and-ladder');

  async getStats(): Promise<SnakeLadderStats> {
    const stats = await StorageService.get<SnakeLadderStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordGameResult({
    won,
    finishRank,
    longestClimb,
    worstSlide,
  }: {
    won: boolean;
    finishRank: number | null;
    longestClimb: number;
    worstSlide: number;
  }): Promise<SnakeLadderStats> {
    const current = await this.getStats();

    const updated: SnakeLadderStats = {
      gamesPlayed: current.gamesPlayed + 1,
      wins: won ? current.wins + 1 : current.wins,
      bestFinishRank:
        finishRank !== null &&
        (current.bestFinishRank === null || finishRank < current.bestFinishRank)
          ? finishRank
          : current.bestFinishRank,
      longestClimb: Math.max(current.longestClimb, longestClimb),
      worstSlide: Math.max(current.worstSlide, worstSlide),
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const snakeLadderStatsRepository = new LocalSnakeLadderStatsRepository();
