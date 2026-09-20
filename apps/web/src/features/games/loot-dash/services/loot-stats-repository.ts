import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const LOOT_DASH_ID = 'loot-dash';

export interface LootDashCareerStats {
  matchesPlayed: number;
  matchesWon: number;
  highScore: number;
  coinsCollected: number;
  gemsCollected: number;
  trapsTriggered: number;
  stealsCount: number;
  powerUpsUsed: number;
  lastPlayedAt: string;
}

const DEFAULT_STATS: LootDashCareerStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  highScore: 0,
  coinsCollected: 0,
  gemsCollected: 0,
  trapsTriggered: 0,
  stealsCount: 0,
  powerUpsUsed: 0,
  lastPlayedAt: '',
};

export class LootStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(LOOT_DASH_ID);

  async getStats(): Promise<LootDashCareerStats> {
    const stats = await StorageService.get<LootDashCareerStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordMatchCompletion(
    won: boolean,
    score: number,
    coinsCollected: number,
    gemsCollected: number,
    trapsTriggered: number,
    stealsCount: number,
    powerUpsUsed: number,
  ): Promise<LootDashCareerStats> {
    const current = await this.getStats();

    const updated: LootDashCareerStats = {
      ...current,
      matchesPlayed: current.matchesPlayed + 1,
      matchesWon: current.matchesWon + (won ? 1 : 0),
      highScore: Math.max(current.highScore, score),
      coinsCollected: current.coinsCollected + coinsCollected,
      gemsCollected: current.gemsCollected + gemsCollected,
      trapsTriggered: current.trapsTriggered + trapsTriggered,
      stealsCount: current.stealsCount + stealsCount,
      powerUpsUsed: current.powerUpsUsed + powerUpsUsed,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const lootStatsRepository = new LootStatsRepository();
