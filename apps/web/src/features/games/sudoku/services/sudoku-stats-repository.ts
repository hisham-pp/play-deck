import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { SudokuDifficulty, SudokuStats } from '../types/sudoku.types';

export interface SudokuRunResult {
  isNewBestTime: boolean;
  stats: SudokuStats;
}

export interface ISudokuStatsRepository {
  getStats(): Promise<SudokuStats>;
  getBestTime(difficulty: SudokuDifficulty): Promise<number | null>;
  recordStart(difficulty: SudokuDifficulty): Promise<SudokuStats>;
  recordCompletion(difficulty: SudokuDifficulty, elapsedMs: number): Promise<SudokuRunResult>;
}

const DEFAULT_STATS: SudokuStats = {
  bestTimes: {},
  gamesPlayed: 0,
  gamesCompleted: 0,
  totalTimeMs: 0,
  lastDifficulty: null,
  lastPlayedAt: '',
};

/**
 * Best times are kept per difficulty — a 2-minute Starter and a 2-minute
 * Insane are not the same achievement, so they never share a record.
 */
export class LocalSudokuStatsRepository implements ISudokuStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('sudoku');

  async getStats(): Promise<SudokuStats> {
    const stored = await StorageService.get<SudokuStats>(this.storageKey);
    if (!stored) return { ...DEFAULT_STATS, bestTimes: {} };
    return { ...DEFAULT_STATS, ...stored, bestTimes: { ...stored.bestTimes } };
  }

  async getBestTime(difficulty: SudokuDifficulty): Promise<number | null> {
    const stats = await this.getStats();
    return stats.bestTimes[difficulty] ?? null;
  }

  async recordStart(difficulty: SudokuDifficulty): Promise<SudokuStats> {
    const current = await this.getStats();
    const updated: SudokuStats = {
      ...current,
      gamesPlayed: current.gamesPlayed + 1,
      lastDifficulty: difficulty,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async recordCompletion(
    difficulty: SudokuDifficulty,
    elapsedMs: number,
  ): Promise<SudokuRunResult> {
    const current = await this.getStats();
    const previousBest = current.bestTimes[difficulty];
    const isNewBestTime = previousBest === undefined || elapsedMs < previousBest;

    const updated: SudokuStats = {
      ...current,
      bestTimes: {
        ...current.bestTimes,
        [difficulty]: isNewBestTime ? elapsedMs : previousBest,
      },
      gamesCompleted: current.gamesCompleted + 1,
      totalTimeMs: current.totalTimeMs + elapsedMs,
      lastDifficulty: difficulty,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return { isNewBestTime, stats: updated };
  }
}

export const sudokuStatsRepository = new LocalSudokuStatsRepository();
