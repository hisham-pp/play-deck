import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const SHARED_BRAIN_ID = 'shared-brain';

export interface SharedBrainStats {
  coursesCompleted: number;
  totalTokensCollected: number;
  totalTokens?: number;
  bestCourseTimes: Record<string, number>;
  bestTimes?: Record<string, number>;
  totalSyncRuns: number;
  lastPlayedAt: string;
}

const DEFAULT_STATS: SharedBrainStats = {
  coursesCompleted: 0,
  totalTokensCollected: 0,
  totalTokens: 0,
  bestCourseTimes: {},
  bestTimes: {},
  totalSyncRuns: 0,
  lastPlayedAt: '',
};

export class SharedBrainStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(SHARED_BRAIN_ID);

  static async getStats(): Promise<SharedBrainStats> {
    return sharedBrainStatsRepo.getStats();
  }

  static async recordCompletion(
    courseId: string,
    timeSecOrMs: number,
    tokens: number,
  ): Promise<SharedBrainStats> {
    const timeMs = timeSecOrMs < 1000 ? Math.round(timeSecOrMs * 1000) : Math.round(timeSecOrMs);
    return sharedBrainStatsRepo.recordCourseCompletion(courseId, timeMs, tokens);
  }

  async getStats(): Promise<SharedBrainStats> {
    const stats = await StorageService.get<SharedBrainStats>(this.storageKey);
    if (!stats) return { ...DEFAULT_STATS };
    return {
      ...stats,
      totalTokens: stats.totalTokensCollected,
      bestTimes: stats.bestCourseTimes,
    };
  }

  async recordCourseCompletion(
    courseId: string,
    timeMs: number,
    tokens: number,
  ): Promise<SharedBrainStats> {
    const current = await this.getStats();

    const previousBest = current.bestCourseTimes[courseId];
    const newBest = previousBest !== undefined ? Math.min(previousBest, timeMs) : timeMs;

    const updatedBestCourseTimes = {
      ...current.bestCourseTimes,
      [courseId]: newBest,
    };

    const updated: SharedBrainStats = {
      coursesCompleted: Object.keys(updatedBestCourseTimes).length,
      totalTokensCollected: current.totalTokensCollected + tokens,
      totalTokens: current.totalTokensCollected + tokens,
      bestCourseTimes: updatedBestCourseTimes,
      bestTimes: updatedBestCourseTimes,
      totalSyncRuns: current.totalSyncRuns + 1,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const sharedBrainStatsRepo = new SharedBrainStatsRepository();
