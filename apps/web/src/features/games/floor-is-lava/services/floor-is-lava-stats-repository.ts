import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const FLOOR_IS_LAVA_ID = 'floor-is-lava';

export interface FloorIsLavaStats {
  matchesPlayed: number;
  matchesWon: number;
  opponentsPushed: number;
  powerUpsCollected: number;
  longestSurvivalSec: number;
  lastPlayedAt: string;
}

const DEFAULT_STATS: FloorIsLavaStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  opponentsPushed: 0,
  powerUpsCollected: 0,
  longestSurvivalSec: 0,
  lastPlayedAt: '',
};

export class FloorIsLavaStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(FLOOR_IS_LAVA_ID);

  async getStats(): Promise<FloorIsLavaStats> {
    const stats = await StorageService.get<FloorIsLavaStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordMatchCompletion(
    won: boolean,
    survivalSec: number,
    pushes: number,
    powerUps: number,
  ): Promise<FloorIsLavaStats> {
    const current = await this.getStats();

    const updated: FloorIsLavaStats = {
      ...current,
      matchesPlayed: current.matchesPlayed + 1,
      matchesWon: current.matchesWon + (won ? 1 : 0),
      opponentsPushed: current.opponentsPushed + pushes,
      powerUpsCollected: current.powerUpsCollected + powerUps,
      longestSurvivalSec: Math.max(current.longestSurvivalSec, survivalSec),
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const floorIsLavaStatsRepository = new FloorIsLavaStatsRepository();
