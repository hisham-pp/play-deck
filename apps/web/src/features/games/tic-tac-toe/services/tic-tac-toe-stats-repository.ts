import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { AIDifficulty, GameMode, TicTacToeStats } from '../types/tic-tac-toe.types';

export interface ITicTacToeStatsRepository {
  getStats(): Promise<TicTacToeStats>;
  recordGameResult(params: {
    won: boolean;
    isDraw: boolean;
    difficulty?: AIDifficulty;
    mode: GameMode;
  }): Promise<TicTacToeStats>;
}

const DEFAULT_STATS: TicTacToeStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  vsAiEasyWins: 0,
  vsAiMediumWins: 0,
  vsAiHardWins: 0,
  lastPlayedAt: '',
};

export class LocalTicTacToeStatsRepository implements ITicTacToeStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('tic-tac-toe');

  async getStats(): Promise<TicTacToeStats> {
    const stats = await StorageService.get<TicTacToeStats>(this.storageKey);
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
  }): Promise<TicTacToeStats> {
    const current = await this.getStats();

    const updated: TicTacToeStats = {
      gamesPlayed: current.gamesPlayed + 1,
      wins: won ? current.wins + 1 : current.wins,
      losses: !won && !isDraw ? current.losses + 1 : current.losses,
      draws: isDraw ? current.draws + 1 : current.draws,
      vsAiEasyWins: won && difficulty === 'easy' ? current.vsAiEasyWins + 1 : current.vsAiEasyWins,
      vsAiMediumWins:
        won && difficulty === 'medium' ? current.vsAiMediumWins + 1 : current.vsAiMediumWins,
      vsAiHardWins: won && difficulty === 'hard' ? current.vsAiHardWins + 1 : current.vsAiHardWins,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const ticTacToeStatsRepository = new LocalTicTacToeStatsRepository();
