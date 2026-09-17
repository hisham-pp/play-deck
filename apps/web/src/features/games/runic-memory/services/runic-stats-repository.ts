import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { DifficultyLevel, GameMode } from '../types/runic-memory.types';

export interface RunicMemoryStats {
  gamesPlayed: number;
  wins: number;
  leastMoves: Record<DifficultyLevel, number | null>;
  bestTimeSeconds: Record<DifficultyLevel, number | null>;
  highestCombo: number;
  totalMatchesFound: number;
  lastPlayedAt: string;
}

const DEFAULT_STATS: RunicMemoryStats = {
  gamesPlayed: 0,
  wins: 0,
  leastMoves: {
    novice: null,
    apprentice: null,
    master: null,
    elder: null,
  },
  bestTimeSeconds: {
    novice: null,
    apprentice: null,
    master: null,
    elder: null,
  },
  highestCombo: 0,
  totalMatchesFound: 0,
  lastPlayedAt: '',
};

export class LocalRunicStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('runic-memory');

  async getStats(): Promise<RunicMemoryStats> {
    const stats = await StorageService.get<RunicMemoryStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordGameResult(params: {
    won: boolean;
    difficulty: DifficultyLevel;
    moves: number;
    timeSeconds: number;
    combo: number;
    matches: number;
    mode: GameMode;
  }): Promise<RunicMemoryStats> {
    const current = await this.getStats();

    const currentBestMoves = current.leastMoves[params.difficulty];
    const newBestMoves =
      params.won && (currentBestMoves === null || params.moves < currentBestMoves)
        ? params.moves
        : currentBestMoves;

    const currentBestTime = current.bestTimeSeconds[params.difficulty];
    const newBestTime =
      params.won && (currentBestTime === null || params.timeSeconds < currentBestTime)
        ? params.timeSeconds
        : currentBestTime;

    const updated: RunicMemoryStats = {
      gamesPlayed: current.gamesPlayed + 1,
      wins: params.won ? current.wins + 1 : current.wins,
      leastMoves: {
        ...current.leastMoves,
        [params.difficulty]: newBestMoves,
      },
      bestTimeSeconds: {
        ...current.bestTimeSeconds,
        [params.difficulty]: newBestTime,
      },
      highestCombo: Math.max(current.highestCombo, params.combo),
      totalMatchesFound: current.totalMatchesFound + params.matches,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const runicStatsRepository = new LocalRunicStatsRepository();
