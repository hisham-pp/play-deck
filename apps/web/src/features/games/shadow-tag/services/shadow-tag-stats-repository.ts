import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { GAME_ID } from '../engine/shadow-tag-constants';
import type { ShadowTagStats } from '../types/shadow-tag.types';

export interface RoundResult {
  won: boolean;
  tagsMade: number;
  timesTagged: number;
  longestEvasionSec: number;
}

export interface IShadowTagStatsRepository {
  getStats(): Promise<ShadowTagStats>;
  recordRound(result: RoundResult): Promise<ShadowTagStats>;
}

const DEFAULT_STATS: ShadowTagStats = {
  roundsPlayed: 0,
  wins: 0,
  tagsMade: 0,
  timesTagged: 0,
  longestEvasionSec: 0,
  lastPlayedAt: '',
};

export class LocalShadowTagStatsRepository implements IShadowTagStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(GAME_ID);

  async getStats(): Promise<ShadowTagStats> {
    const stats = await StorageService.get<ShadowTagStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordRound(result: RoundResult): Promise<ShadowTagStats> {
    const current = await this.getStats();

    const updated: ShadowTagStats = {
      roundsPlayed: current.roundsPlayed + 1,
      wins: current.wins + (result.won ? 1 : 0),
      tagsMade: current.tagsMade + result.tagsMade,
      timesTagged: current.timesTagged + result.timesTagged,
      longestEvasionSec: Math.max(current.longestEvasionSec, result.longestEvasionSec),
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const shadowTagStatsRepository = new LocalShadowTagStatsRepository();
