import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const TINY_TANK_ID = 'tiny-tank-arena';

export interface TinyTankStats {
  matchesPlayed: number;
  matchesWon: number;
  kills: number;
  damageDealt: number;
  shotsFired: number;
  shotsHit: number;
  cratesCollected: number;
  highScore: number;
  lastPlayedAt: string;
}

const DEFAULT_STATS: TinyTankStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  kills: 0,
  damageDealt: 0,
  shotsFired: 0,
  shotsHit: 0,
  cratesCollected: 0,
  highScore: 0,
  lastPlayedAt: '',
};

export class TankStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(TINY_TANK_ID);

  async getStats(): Promise<TinyTankStats> {
    const stats = await StorageService.get<TinyTankStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordMatchCompletion(
    won: boolean,
    score: number,
    kills: number,
    damageDealt: number,
    shotsFired: number,
    shotsHit: number,
    cratesCollected: number,
  ): Promise<TinyTankStats> {
    const current = await this.getStats();

    const updated: TinyTankStats = {
      ...current,
      matchesPlayed: current.matchesPlayed + 1,
      matchesWon: current.matchesWon + (won ? 1 : 0),
      highScore: Math.max(current.highScore, score),
      kills: current.kills + kills,
      damageDealt: current.damageDealt + damageDealt,
      shotsFired: current.shotsFired + shotsFired,
      shotsHit: current.shotsHit + shotsHit,
      cratesCollected: current.cratesCollected + cratesCollected,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const tankStatsRepository = new TankStatsRepository();
