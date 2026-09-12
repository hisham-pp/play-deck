import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { LudoBotDifficulty, LudoStats } from '../types/ludo.types';

export interface ILudoStatsRepository {
  getStats(): Promise<LudoStats>;
  recordGameResult(params: {
    won: boolean;
    finishRank: number | null;
    vsBotDifficulty?: LudoBotDifficulty;
  }): Promise<LudoStats>;
}

const DEFAULT_STATS: LudoStats = {
  gamesPlayed: 0,
  wins: 0,
  bestFinishRank: null,
  vsBotEasyWins: 0,
  vsBotNormalWins: 0,
  vsBotHardWins: 0,
  lastPlayedAt: '',
};

export class LocalLudoStatsRepository implements ILudoStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('ludo');

  async getStats(): Promise<LudoStats> {
    const stats = await StorageService.get<LudoStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordGameResult({
    won,
    finishRank,
    vsBotDifficulty,
  }: {
    won: boolean;
    finishRank: number | null;
    vsBotDifficulty?: LudoBotDifficulty;
  }): Promise<LudoStats> {
    const current = await this.getStats();

    const updated: LudoStats = {
      gamesPlayed: current.gamesPlayed + 1,
      wins: won ? current.wins + 1 : current.wins,
      bestFinishRank:
        finishRank !== null &&
        (current.bestFinishRank === null || finishRank < current.bestFinishRank)
          ? finishRank
          : current.bestFinishRank,
      vsBotEasyWins:
        won && vsBotDifficulty === 'easy' ? current.vsBotEasyWins + 1 : current.vsBotEasyWins,
      vsBotNormalWins:
        won && vsBotDifficulty === 'normal' ? current.vsBotNormalWins + 1 : current.vsBotNormalWins,
      vsBotHardWins:
        won && vsBotDifficulty === 'hard' ? current.vsBotHardWins + 1 : current.vsBotHardWins,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const ludoStatsRepository = new LocalLudoStatsRepository();
