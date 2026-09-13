import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { AIDifficulty, ConnectFourStats, GameMode } from '../types/connect-four.types';

export interface IConnectFourStatsRepository {
  getStats(): Promise<ConnectFourStats>;
  recordGameResult(params: {
    won: boolean;
    isDraw: boolean;
    difficulty?: AIDifficulty;
    mode: GameMode;
  }): Promise<ConnectFourStats>;
}

const DEFAULT_STATS: ConnectFourStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  vsAiEasyWins: 0,
  vsAiMediumWins: 0,
  vsAiHardWins: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedAt: '',
};

export class LocalConnectFourStatsRepository implements IConnectFourStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('connect-four');

  async getStats(): Promise<ConnectFourStats> {
    const stats = await StorageService.get<ConnectFourStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordGameResult({
    won,
    isDraw,
    difficulty,
    mode: _mode,
  }: {
    won: boolean;
    isDraw: boolean;
    difficulty?: AIDifficulty;
    mode: GameMode;
  }): Promise<ConnectFourStats> {
    const current = await this.getStats();

    const currentStreak = isDraw ? current.currentStreak : won ? current.currentStreak + 1 : 0;
    const bestStreak = Math.max(current.bestStreak, currentStreak);

    const updated: ConnectFourStats = {
      gamesPlayed: current.gamesPlayed + 1,
      wins: won ? current.wins + 1 : current.wins,
      losses: !won && !isDraw ? current.losses + 1 : current.losses,
      draws: isDraw ? current.draws + 1 : current.draws,
      vsAiEasyWins: won && difficulty === 'easy' ? current.vsAiEasyWins + 1 : current.vsAiEasyWins,
      vsAiMediumWins:
        won && difficulty === 'medium' ? current.vsAiMediumWins + 1 : current.vsAiMediumWins,
      vsAiHardWins: won && difficulty === 'hard' ? current.vsAiHardWins + 1 : current.vsAiHardWins,
      currentStreak,
      bestStreak,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const connectFourStatsRepository = new LocalConnectFourStatsRepository();
