import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { Game2048Stats } from '../types/2048.types';

export const DEFAULT_2048_STATS: Game2048Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestScore: 0,
  highestTile: 0,
  totalMoves: 0,
  lastPlayedAt: '',
};

export interface IGame2048StatsRepository {
  getStats(): Promise<Game2048Stats>;
  getBestScore(): Promise<number>;
  recordGameStart(): Promise<Game2048Stats>;
  recordGameEnd(
    score: number,
    highestTile: number,
    won: boolean,
    moves: number,
  ): Promise<{ isNewBestScore: boolean; stats: Game2048Stats }>;
  updateBestScore(score: number): Promise<boolean>;
}

export class LocalGame2048StatsRepository implements IGame2048StatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('2048');

  async getStats(): Promise<Game2048Stats> {
    const stored = await StorageService.get<Game2048Stats>(this.storageKey);
    if (!stored) {
      return { ...DEFAULT_2048_STATS };
    }
    return {
      ...DEFAULT_2048_STATS,
      ...stored,
    };
  }

  async getBestScore(): Promise<number> {
    const stats = await this.getStats();
    return stats.bestScore;
  }

  async recordGameStart(): Promise<Game2048Stats> {
    const current = await this.getStats();
    const updated: Game2048Stats = {
      ...current,
      gamesPlayed: current.gamesPlayed + 1,
      lastPlayedAt: new Date().toISOString(),
    };
    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async updateBestScore(score: number): Promise<boolean> {
    const current = await this.getStats();
    if (score > current.bestScore) {
      const updated: Game2048Stats = {
        ...current,
        bestScore: score,
        lastPlayedAt: new Date().toISOString(),
      };
      await StorageService.set(this.storageKey, updated);
      return true;
    }
    return false;
  }

  async recordGameEnd(
    score: number,
    highestTile: number,
    won: boolean,
    moves: number,
  ): Promise<{ isNewBestScore: boolean; stats: Game2048Stats }> {
    const current = await this.getStats();
    const isNewBestScore = score > current.bestScore;
    const newBestScore = isNewBestScore ? score : current.bestScore;
    const newHighestTile = Math.max(current.highestTile, highestTile);

    const updated: Game2048Stats = {
      ...current,
      gamesWon: won ? current.gamesWon + 1 : current.gamesWon,
      bestScore: newBestScore,
      highestTile: newHighestTile,
      totalMoves: current.totalMoves + moves,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return { isNewBestScore, stats: updated };
  }
}

export const game2048StatsRepository = new LocalGame2048StatsRepository();
