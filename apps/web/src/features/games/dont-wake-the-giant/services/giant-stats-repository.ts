import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { GAME_ID } from '../engine/giant-constants';
import type { GiantStats } from '../types/giant.types';

export interface HeistResult {
  /** True when the crew got out with the giant still asleep. */
  escaped: boolean;
  /** Value this player personally carried through the door. */
  banked: number;
}

export interface IGiantStatsRepository {
  getStats(): Promise<GiantStats>;
  recordHeist(result: HeistResult): Promise<GiantStats>;
}

const DEFAULT_STATS: GiantStats = {
  heists: 0,
  escapes: 0,
  wakeUps: 0,
  bestHaul: 0,
  totalBanked: 0,
  lastPlayedAt: '',
};

export class LocalGiantStatsRepository implements IGiantStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(GAME_ID);

  async getStats(): Promise<GiantStats> {
    const stats = await StorageService.get<GiantStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordHeist(result: HeistResult): Promise<GiantStats> {
    const current = await this.getStats();

    const updated: GiantStats = {
      heists: current.heists + 1,
      escapes: current.escapes + (result.escaped ? 1 : 0),
      wakeUps: current.wakeUps + (result.escaped ? 0 : 1),
      bestHaul: Math.max(current.bestHaul, result.banked),
      totalBanked: current.totalBanked + result.banked,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const giantStatsRepository = new LocalGiantStatsRepository();
