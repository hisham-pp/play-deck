import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

import type { TrustOrBetrayCareerStats } from '../types/trust-or-betray.types';

export const TRUST_OR_BETRAY_ID = 'trust-or-betray';

export const DEFAULT_CAREER_STATS: TrustOrBetrayCareerStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  highScore: 0,
  totalCooperations: 0,
  totalBetrayals: 0,
  soloSabotages: 0,
  timesExiled: 0,
  successfulAlliances: 0,
  lastPlayedAt: '',
};

export class TrustStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(TRUST_OR_BETRAY_ID);

  async getStats(): Promise<TrustOrBetrayCareerStats> {
    const stats = await StorageService.get<TrustOrBetrayCareerStats>(this.storageKey);
    return stats ?? { ...DEFAULT_CAREER_STATS };
  }

  async recordMatchCompletion({
    won,
    score,
    cooperations,
    betrayals,
    soloSabotages,
    wasExiled,
    alliedRounds,
  }: {
    won: boolean;
    score: number;
    cooperations: number;
    betrayals: number;
    soloSabotages: number;
    wasExiled: boolean;
    alliedRounds: number;
  }): Promise<TrustOrBetrayCareerStats> {
    const current = await this.getStats();

    const updated: TrustOrBetrayCareerStats = {
      ...current,
      matchesPlayed: current.matchesPlayed + 1,
      matchesWon: current.matchesWon + (won ? 1 : 0),
      highScore: Math.max(current.highScore, score),
      totalCooperations: current.totalCooperations + cooperations,
      totalBetrayals: current.totalBetrayals + betrayals,
      soloSabotages: current.soloSabotages + soloSabotages,
      timesExiled: current.timesExiled + (wasExiled ? 1 : 0),
      successfulAlliances: current.successfulAlliances + alliedRounds,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const trustStatsRepository = new TrustStatsRepository();
