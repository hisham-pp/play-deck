import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { SnakeStats } from '../types/snake.types';

export interface ISnakeStatsRepository {
  getStats(): Promise<SnakeStats>;
  saveScore(score: number): Promise<{ isNewHighScore: boolean; stats: SnakeStats }>;
  getHighScore(): Promise<number>;
}

const DEFAULT_STATS: SnakeStats = {
  highScore: 0,
  gamesPlayed: 0,
  totalFoodEaten: 0,
  lastPlayedAt: '',
};

export class LocalSnakeStatsRepository implements ISnakeStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('snake');

  async getStats(): Promise<SnakeStats> {
    const stats = await StorageService.get<SnakeStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async getHighScore(): Promise<number> {
    const stats = await this.getStats();
    return stats.highScore;
  }

  async saveScore(score: number): Promise<{ isNewHighScore: boolean; stats: SnakeStats }> {
    const current = await this.getStats();
    const isNewHighScore = score > current.highScore;
    const updatedHighScore = Math.max(current.highScore, score);
    const foodEaten = Math.max(0, Math.floor(score / 10));

    const updated: SnakeStats = {
      highScore: updatedHighScore,
      gamesPlayed: current.gamesPlayed + 1,
      totalFoodEaten: current.totalFoodEaten + foodEaten,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return { isNewHighScore, stats: updated };
  }
}

export const snakeStatsRepository = new LocalSnakeStatsRepository();
