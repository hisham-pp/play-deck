import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { GAME_ID } from '../engine/elevator-constants';
import type { ElevatorStats } from '../types/unstable-elevator.types';

export interface RunResult {
  floorsCleared: number;
  score: number;
  objectsPlaced: number;
  objectsLost: number;
}

export interface IElevatorStatsRepository {
  getStats(): Promise<ElevatorStats>;
  recordRun(result: RunResult): Promise<ElevatorStats>;
}

const DEFAULT_STATS: ElevatorStats = {
  runs: 0,
  bestFloor: 0,
  bestScore: 0,
  objectsPlaced: 0,
  objectsLost: 0,
  lastPlayedAt: '',
};

export class LocalElevatorStatsRepository implements IElevatorStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(GAME_ID);

  async getStats(): Promise<ElevatorStats> {
    const stats = await StorageService.get<ElevatorStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordRun(result: RunResult): Promise<ElevatorStats> {
    const current = await this.getStats();
    const updated: ElevatorStats = {
      runs: current.runs + 1,
      bestFloor: Math.max(current.bestFloor, result.floorsCleared),
      bestScore: Math.max(current.bestScore, result.score),
      objectsPlaced: current.objectsPlaced + result.objectsPlaced,
      objectsLost: current.objectsLost + result.objectsLost,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const elevatorStatsRepository = new LocalElevatorStatsRepository();
