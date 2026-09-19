import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const GRAVITY_SHIFT_ID = 'gravity-shift';

export interface GravityShiftStats {
  racesCompleted: number;
  racesWon: number;
  fastestTimes: Record<string, number>; // courseId -> time in ms
  totalShiftsTriggered: number;
  totalCheckpointsReached: number;
  lastPlayedAt: string;
}

const DEFAULT_STATS: GravityShiftStats = {
  racesCompleted: 0,
  racesWon: 0,
  fastestTimes: {},
  totalShiftsTriggered: 0,
  totalCheckpointsReached: 0,
  lastPlayedAt: '',
};

export class GravityShiftStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(GRAVITY_SHIFT_ID);

  async getStats(): Promise<GravityShiftStats> {
    const stats = await StorageService.get<GravityShiftStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordRaceCompletion(
    courseId: string,
    timeMs: number,
    won: boolean,
    shiftsUsed: number,
    checkpoints: number,
  ): Promise<GravityShiftStats> {
    const current = await this.getStats();

    const previousBestTime = current.fastestTimes[courseId];
    const newBestTime =
      previousBestTime !== undefined ? Math.min(previousBestTime, timeMs) : timeMs;

    const updatedFastestTimes = {
      ...current.fastestTimes,
      [courseId]: newBestTime,
    };

    const updated: GravityShiftStats = {
      ...current,
      racesCompleted: current.racesCompleted + 1,
      racesWon: current.racesWon + (won ? 1 : 0),
      fastestTimes: updatedFastestTimes,
      totalShiftsTriggered: current.totalShiftsTriggered + shiftsUsed,
      totalCheckpointsReached: current.totalCheckpointsReached + checkpoints,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const gravityShiftStatsRepository = new GravityShiftStatsRepository();
