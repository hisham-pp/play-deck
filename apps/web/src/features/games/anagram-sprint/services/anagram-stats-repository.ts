import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { GAME_ID } from '../engine/anagram-constants';
import type { AnagramMode, AnagramStats } from '../types/anagram-sprint.types';

export interface AnagramRunSummary {
  mode: AnagramMode;
  won: boolean;
  score: number;
  solved: number;
  longestStreak: number;
  fastestMs: number | null;
}

export interface IAnagramStatsRepository {
  getStats(): Promise<AnagramStats>;
  recordRun(summary: AnagramRunSummary): Promise<AnagramStats>;
}

const DEFAULT_STATS: AnagramStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestScore: 0,
  wordsSolved: 0,
  longestStreak: 0,
  fastestMs: null,
  lastMode: null,
  lastPlayedAt: '',
};

function fastestOf(current: number | null, candidate: number | null): number | null {
  if (candidate === null) return current;
  return current === null ? candidate : Math.min(current, candidate);
}

/**
 * Records are all-time personal bests across every mode: a 0.8-second solve is
 * a 0.8-second solve whether it came in a blitz or a team match.
 */
export class LocalAnagramStatsRepository implements IAnagramStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(GAME_ID);

  async getStats(): Promise<AnagramStats> {
    const stored = await StorageService.get<AnagramStats>(this.storageKey);
    return stored ? { ...DEFAULT_STATS, ...stored } : { ...DEFAULT_STATS };
  }

  async recordRun(summary: AnagramRunSummary): Promise<AnagramStats> {
    const current = await this.getStats();
    const updated: AnagramStats = {
      gamesPlayed: current.gamesPlayed + 1,
      gamesWon: current.gamesWon + (summary.won ? 1 : 0),
      bestScore: Math.max(current.bestScore, summary.score),
      wordsSolved: current.wordsSolved + summary.solved,
      longestStreak: Math.max(current.longestStreak, summary.longestStreak),
      fastestMs: fastestOf(current.fastestMs, summary.fastestMs),
      lastMode: summary.mode,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const anagramStatsRepository = new LocalAnagramStatsRepository();
