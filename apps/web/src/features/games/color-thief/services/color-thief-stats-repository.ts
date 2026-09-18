import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { ColorThiefStats } from '../types/color-thief.types';

export interface ColorThiefResult {
  won: boolean;
  tilesHeld: number;
  abilitiesUsed: number;
}

export interface IColorThiefStatsRepository {
  getStats(): Promise<ColorThiefStats>;
  recordGameResult(result: ColorThiefResult): Promise<ColorThiefStats>;
}

const DEFAULT_STATS: ColorThiefStats = {
  gamesPlayed: 0,
  wins: 0,
  mostTilesHeld: 0,
  abilitiesUsed: 0,
  lastPlayedAt: '',
};

export class LocalColorThiefStatsRepository implements IColorThiefStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('color-thief');

  async getStats(): Promise<ColorThiefStats> {
    const stats = await StorageService.get<ColorThiefStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordGameResult({
    won,
    tilesHeld,
    abilitiesUsed,
  }: ColorThiefResult): Promise<ColorThiefStats> {
    const current = await this.getStats();

    const updated: ColorThiefStats = {
      gamesPlayed: current.gamesPlayed + 1,
      wins: won ? current.wins + 1 : current.wins,
      mostTilesHeld: Math.max(current.mostTilesHeld, tilesHeld),
      abilitiesUsed: current.abilitiesUsed + abilitiesUsed,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const colorThiefStatsRepository = new LocalColorThiefStatsRepository();
