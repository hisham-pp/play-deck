import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const MAGNET_MAYHEM_ID = 'magnet-mayhem';

export interface MagnetMayhemStats {
  matchesPlayed: number;
  matchesWon: number;
  highScore: number;
  targetsCollected: number;
  slingshots: number;
  repelHits: number;
  lastPlayedAt: string;
}

const DEFAULT_STATS: MagnetMayhemStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  highScore: 0,
  targetsCollected: 0,
  slingshots: 0,
  repelHits: 0,
  lastPlayedAt: '',
};

export class MagnetStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(MAGNET_MAYHEM_ID);

  async getStats(): Promise<MagnetMayhemStats> {
    const stats = await StorageService.get<MagnetMayhemStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordMatchCompletion(
    won: boolean,
    score: number,
    targets: number,
    slingshots: number,
    repelHits: number,
  ): Promise<MagnetMayhemStats> {
    const current = await this.getStats();

    const updated: MagnetMayhemStats = {
      ...current,
      matchesPlayed: current.matchesPlayed + 1,
      matchesWon: current.matchesWon + (won ? 1 : 0),
      highScore: Math.max(current.highScore, score),
      targetsCollected: current.targetsCollected + targets,
      slingshots: current.slingshots + slingshots,
      repelHits: current.repelHits + repelHits,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const magnetStatsRepository = new MagnetStatsRepository();
