import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const REVERSE_RACING_ID = 'reverse-racing';

export interface ReverseRacingStats {
  racesCompleted: number;
  podiumFinishes: number; // 1st, 2nd, or 3rd
  victories: number;
  crashesSuffered: number;
  crashesInflicted: number;
  obstaclesPlaced: number;
  bestFinishTimeMs: number | null;
  lastPlayedAt: string;
}

const DEFAULT_STATS: ReverseRacingStats = {
  racesCompleted: 0,
  podiumFinishes: 0,
  victories: 0,
  crashesSuffered: 0,
  crashesInflicted: 0,
  obstaclesPlaced: 0,
  bestFinishTimeMs: null,
  lastPlayedAt: '',
};

export class ReverseRacingStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(REVERSE_RACING_ID);

  async getStats(): Promise<ReverseRacingStats> {
    const stats = await StorageService.get<ReverseRacingStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordRaceCompletion(
    rank: number,
    finishTimeMs: number | null,
    crashesSuffered: number,
    crashesInflicted: number,
    obstaclesPlaced: number,
  ): Promise<ReverseRacingStats> {
    const current = await this.getStats();

    const isPodium = rank <= 3;
    const isVictory = rank === 1;

    let newBestTime = current.bestFinishTimeMs;
    if (finishTimeMs !== null) {
      newBestTime =
        current.bestFinishTimeMs !== null
          ? Math.min(current.bestFinishTimeMs, finishTimeMs)
          : finishTimeMs;
    }

    const updated: ReverseRacingStats = {
      racesCompleted: current.racesCompleted + 1,
      podiumFinishes: current.podiumFinishes + (isPodium ? 1 : 0),
      victories: current.victories + (isVictory ? 1 : 0),
      crashesSuffered: current.crashesSuffered + crashesSuffered,
      crashesInflicted: current.crashesInflicted + crashesInflicted,
      obstaclesPlaced: current.obstaclesPlaced + obstaclesPlaced,
      bestFinishTimeMs: newBestTime,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const reverseRacingStatsRepo = new ReverseRacingStatsRepository();
