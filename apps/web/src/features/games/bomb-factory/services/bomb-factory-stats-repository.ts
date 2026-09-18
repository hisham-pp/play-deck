import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { GAME_ID } from '../engine/bomb-factory-constants';
import type { BombFactoryStats } from '../types/bomb-factory.types';

export interface RecordShiftParams {
  completed: boolean;
  machinesCleared: number;
  faults: number;
  score: number;
}

export interface IBombFactoryStatsRepository {
  getStats(): Promise<BombFactoryStats>;
  recordShift(params: RecordShiftParams): Promise<BombFactoryStats>;
}

const DEFAULT_STATS: BombFactoryStats = {
  shiftsPlayed: 0,
  shiftsCompleted: 0,
  machinesCleared: 0,
  bestScore: 0,
  fewestFaults: null,
  lastPlayedAt: '',
};

export class LocalBombFactoryStatsRepository implements IBombFactoryStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(GAME_ID);

  async getStats(): Promise<BombFactoryStats> {
    const stats = await StorageService.get<BombFactoryStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordShift({
    completed,
    machinesCleared,
    faults,
    score,
  }: RecordShiftParams): Promise<BombFactoryStats> {
    const current = await this.getStats();

    const updated: BombFactoryStats = {
      shiftsPlayed: current.shiftsPlayed + 1,
      shiftsCompleted: current.shiftsCompleted + (completed ? 1 : 0),
      machinesCleared: current.machinesCleared + machinesCleared,
      bestScore: Math.max(current.bestScore, score),
      // A clean run is only worth recording when the shift actually finished.
      fewestFaults:
        completed && (current.fewestFaults === null || faults < current.fewestFaults)
          ? faults
          : current.fewestFaults,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const bombFactoryStatsRepository = new LocalBombFactoryStatsRepository();
