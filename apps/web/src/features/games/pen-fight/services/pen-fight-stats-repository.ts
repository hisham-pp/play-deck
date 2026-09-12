import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { PenFightStats } from '../types/pen-fight.types';

export interface IPenFightStatsRepository {
  getStats(): Promise<PenFightStats>;
  recordMatch(won: boolean, roundsWon: number, roundsLost: number): Promise<PenFightStats>;
  recordFlicks(count: number): Promise<PenFightStats>;
}

const DEFAULT_STATS: PenFightStats = {
  matchesPlayed: 0,
  matchWins: 0,
  matchLosses: 0,
  roundsWon: 0,
  roundsLost: 0,
  totalFlicks: 0,
  bestFlickStreak: 0,
  lastPlayedAt: '',
};

export class LocalPenFightStatsRepository implements IPenFightStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('pen-fight');

  async getStats(): Promise<PenFightStats> {
    const stats = await StorageService.get<PenFightStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordMatch(won: boolean, roundsWon: number, roundsLost: number): Promise<PenFightStats> {
    const current = await this.getStats();
    const updated: PenFightStats = {
      ...current,
      matchesPlayed: current.matchesPlayed + 1,
      matchWins: current.matchWins + (won ? 1 : 0),
      matchLosses: current.matchLosses + (won ? 0 : 1),
      roundsWon: current.roundsWon + roundsWon,
      roundsLost: current.roundsLost + roundsLost,
      lastPlayedAt: new Date().toISOString(),
    };
    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async recordFlicks(count: number): Promise<PenFightStats> {
    const current = await this.getStats();
    const updated: PenFightStats = {
      ...current,
      totalFlicks: current.totalFlicks + count,
      bestFlickStreak: Math.max(current.bestFlickStreak, count),
    };
    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const penFightStatsRepository = new LocalPenFightStatsRepository();
