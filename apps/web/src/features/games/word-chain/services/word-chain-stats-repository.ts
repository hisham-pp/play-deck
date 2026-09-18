import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { WordChainMode, WordChainStats } from '../types/word-chain.types';

export interface WordChainRunSummary {
  mode: WordChainMode;
  won: boolean;
  chainLength: number;
  bestScore: number;
  longestWord: string;
}

export interface IWordChainStatsRepository {
  getStats(): Promise<WordChainStats>;
  recordRun(summary: WordChainRunSummary): Promise<WordChainStats>;
}

const DEFAULT_STATS: WordChainStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  longestChain: 0,
  bestScore: 0,
  longestWord: '',
  lastMode: null,
  lastPlayedAt: '',
};

/**
 * Records are all-time personal bests rather than per-mode: a long chain is a
 * long chain whether it was built solo or around a table.
 */
export class LocalWordChainStatsRepository implements IWordChainStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('word-chain');

  async getStats(): Promise<WordChainStats> {
    const stored = await StorageService.get<WordChainStats>(this.storageKey);
    return stored ? { ...DEFAULT_STATS, ...stored } : { ...DEFAULT_STATS };
  }

  async recordRun(summary: WordChainRunSummary): Promise<WordChainStats> {
    const current = await this.getStats();
    const updated: WordChainStats = {
      gamesPlayed: current.gamesPlayed + 1,
      gamesWon: current.gamesWon + (summary.won ? 1 : 0),
      longestChain: Math.max(current.longestChain, summary.chainLength),
      bestScore: Math.max(current.bestScore, summary.bestScore),
      longestWord:
        summary.longestWord.length > current.longestWord.length
          ? summary.longestWord
          : current.longestWord,
      lastMode: summary.mode,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const wordChainStatsRepository = new LocalWordChainStatsRepository();
