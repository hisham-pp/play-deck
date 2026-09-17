import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { DIFFICULTY_BEGINNER } from '../engine/minesweeper-constants';
import type {
  MinesweeperDifficulty,
  MinesweeperDifficultyStats,
  MinesweeperRunResult,
  MinesweeperStats,
} from '../types/minesweeper.types';

export interface IMinesweeperStatsRepository {
  getStats(): Promise<MinesweeperStats>;
  getBestTime(difficulty: MinesweeperDifficulty): Promise<number | null>;
  recordStart(difficulty: MinesweeperDifficulty): Promise<MinesweeperStats>;
  recordCompletion(
    difficulty: MinesweeperDifficulty,
    elapsedMs: number,
  ): Promise<MinesweeperRunResult>;
  recordLoss(difficulty: MinesweeperDifficulty): Promise<MinesweeperStats>;
}

const createDefaultDiffStats = (): MinesweeperDifficultyStats => ({
  played: 0,
  won: 0,
  bestTimeMs: null,
  currentStreak: 0,
  bestStreak: 0,
});

export const DEFAULT_STATS: MinesweeperStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalTimeMs: 0,
  byDifficulty: {
    beginner: createDefaultDiffStats(),
    intermediate: createDefaultDiffStats(),
    expert: createDefaultDiffStats(),
    custom: createDefaultDiffStats(),
  },
  lastDifficulty: DIFFICULTY_BEGINNER,
  lastPlayedAt: '',
};

function updateDiffMap(
  byDiff: Record<MinesweeperDifficulty, MinesweeperDifficultyStats>,
  difficulty: MinesweeperDifficulty,
  stats: MinesweeperDifficultyStats,
): Record<MinesweeperDifficulty, MinesweeperDifficultyStats> {
  return {
    beginner: difficulty === 'beginner' ? stats : byDiff.beginner,
    intermediate: difficulty === 'intermediate' ? stats : byDiff.intermediate,
    expert: difficulty === 'expert' ? stats : byDiff.expert,
    custom: difficulty === 'custom' ? stats : byDiff.custom,
  };
}

export class LocalMinesweeperStatsRepository implements IMinesweeperStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('minesweeper');

  async getStats(): Promise<MinesweeperStats> {
    const stored = await StorageService.get<MinesweeperStats>(this.storageKey);
    if (!stored) {
      return {
        ...DEFAULT_STATS,
        byDifficulty: {
          beginner: createDefaultDiffStats(),
          intermediate: createDefaultDiffStats(),
          expert: createDefaultDiffStats(),
          custom: createDefaultDiffStats(),
        },
      };
    }

    return {
      ...DEFAULT_STATS,
      ...stored,
      byDifficulty: {
        beginner: {
          ...createDefaultDiffStats(),
          ...(stored.byDifficulty?.beginner ?? {}),
        },
        intermediate: {
          ...createDefaultDiffStats(),
          ...(stored.byDifficulty?.intermediate ?? {}),
        },
        expert: {
          ...createDefaultDiffStats(),
          ...(stored.byDifficulty?.expert ?? {}),
        },
        custom: {
          ...createDefaultDiffStats(),
          ...(stored.byDifficulty?.custom ?? {}),
        },
      },
    };
  }

  async getBestTime(difficulty: MinesweeperDifficulty): Promise<number | null> {
    const stats = await this.getStats();
    return stats.byDifficulty[difficulty]?.bestTimeMs ?? null;
  }

  async recordStart(difficulty: MinesweeperDifficulty): Promise<MinesweeperStats> {
    const current = await this.getStats();
    const diffStats = current.byDifficulty[difficulty] ?? createDefaultDiffStats();

    const updatedDiffStats: MinesweeperDifficultyStats = {
      ...diffStats,
      played: diffStats.played + 1,
    };

    const updated: MinesweeperStats = {
      ...current,
      gamesPlayed: current.gamesPlayed + 1,
      byDifficulty: updateDiffMap(current.byDifficulty, difficulty, updatedDiffStats),
      lastDifficulty: difficulty,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async recordCompletion(
    difficulty: MinesweeperDifficulty,
    elapsedMs: number,
  ): Promise<MinesweeperRunResult> {
    const current = await this.getStats();
    const diffStats = current.byDifficulty[difficulty] ?? createDefaultDiffStats();

    const previousBest = diffStats.bestTimeMs;
    const isNewBestTime = previousBest === null || elapsedMs < previousBest;
    const newStreak = diffStats.currentStreak + 1;
    const bestStreak = Math.max(diffStats.bestStreak, newStreak);

    const updatedDiffStats: MinesweeperDifficultyStats = {
      ...diffStats,
      won: diffStats.won + 1,
      bestTimeMs: isNewBestTime ? elapsedMs : previousBest,
      currentStreak: newStreak,
      bestStreak,
    };

    const updated: MinesweeperStats = {
      ...current,
      gamesWon: current.gamesWon + 1,
      totalTimeMs: current.totalTimeMs + elapsedMs,
      byDifficulty: updateDiffMap(current.byDifficulty, difficulty, updatedDiffStats),
      lastDifficulty: difficulty,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return { isNewBestTime, stats: updated };
  }

  async recordLoss(difficulty: MinesweeperDifficulty): Promise<MinesweeperStats> {
    const current = await this.getStats();
    const diffStats = current.byDifficulty[difficulty] ?? createDefaultDiffStats();

    const updatedDiffStats: MinesweeperDifficultyStats = {
      ...diffStats,
      currentStreak: 0,
    };

    const updated: MinesweeperStats = {
      ...current,
      byDifficulty: updateDiffMap(current.byDifficulty, difficulty, updatedDiffStats),
      lastDifficulty: difficulty,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const minesweeperStatsRepository = new LocalMinesweeperStatsRepository();
