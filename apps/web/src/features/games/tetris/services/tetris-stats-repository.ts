import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { TetrisStats } from '../types/tetris.types';

export interface ITetrisStatsRepository {
  getStats(): Promise<TetrisStats>;
  saveScore(
    score: number,
    linesCleared: number,
  ): Promise<{ isNewHighScore: boolean; stats: TetrisStats }>;
  getHighScore(): Promise<number>;
}

const DEFAULT_STATS: TetrisStats = {
  highScore: 0,
  gamesPlayed: 0,
  totalLinesCleared: 0,
  lastPlayedAt: '',
};

export class LocalTetrisStatsRepository implements ITetrisStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('tetris');

  async getStats(): Promise<TetrisStats> {
    const stats = await StorageService.get<TetrisStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async getHighScore(): Promise<number> {
    const stats = await this.getStats();
    return stats.highScore;
  }

  async saveScore(
    score: number,
    linesCleared: number,
  ): Promise<{ isNewHighScore: boolean; stats: TetrisStats }> {
    const current = await this.getStats();
    const isNewHighScore = score > current.highScore;
    const updatedHighScore = Math.max(current.highScore, score);

    const updated: TetrisStats = {
      highScore: updatedHighScore,
      gamesPlayed: current.gamesPlayed + 1,
      totalLinesCleared: current.totalLinesCleared + linesCleared,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return { isNewHighScore, stats: updated };
  }
}

export const tetrisStatsRepository = new LocalTetrisStatsRepository();
