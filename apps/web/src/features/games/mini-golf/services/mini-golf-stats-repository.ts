import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { MiniGolfStats, PlayerScoreCard } from '../engine/mini-golf-types';

export const DEFAULT_MINI_GOLF_STATS: MiniGolfStats = {
  gamesPlayed: 0,
  roundsCompleted: 0,
  bestRoundScore: 0,
  totalStrokes: 0,
  holesInOne: 0,
  eagles: 0,
  birdies: 0,
  pars: 0,
  lastPlayedAt: '',
};

export interface IMiniGolfStatsRepository {
  getStats(): Promise<MiniGolfStats>;
  recordRoundResult(scorecard: PlayerScoreCard, isCourseComplete: boolean): Promise<MiniGolfStats>;
  resetStats(): Promise<MiniGolfStats>;
}

export class LocalMiniGolfStatsRepository implements IMiniGolfStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('mini-golf');

  async getStats(): Promise<MiniGolfStats> {
    const stored = await StorageService.get<MiniGolfStats>(this.storageKey);
    if (!stored) {
      return { ...DEFAULT_MINI_GOLF_STATS };
    }
    return {
      ...DEFAULT_MINI_GOLF_STATS,
      ...stored,
    };
  }

  async recordRoundResult(
    scorecard: PlayerScoreCard,
    isCourseComplete: boolean,
  ): Promise<MiniGolfStats> {
    const current = await this.getStats();

    let eagles = 0;
    let birdies = 0;
    let pars = 0;
    let aces = 0;

    for (const hole of scorecard.holeScores) {
      if (hole.classification === 'ace') aces++;
      if (hole.classification === 'eagle' || hole.classification === 'albatross') eagles++;
      if (hole.classification === 'birdie') birdies++;
      if (hole.classification === 'par') pars++;
    }

    const currentBest = current.bestRoundScore;
    let newBest = currentBest;
    if (isCourseComplete) {
      newBest =
        currentBest === 0 ? scorecard.totalStrokes : Math.min(currentBest, scorecard.totalStrokes);
    }

    const updated: MiniGolfStats = {
      gamesPlayed: current.gamesPlayed + 1,
      roundsCompleted: current.roundsCompleted + (isCourseComplete ? 1 : 0),
      bestRoundScore: newBest,
      totalStrokes: current.totalStrokes + scorecard.totalStrokes,
      holesInOne: current.holesInOne + aces,
      eagles: current.eagles + eagles,
      birdies: current.birdies + birdies,
      pars: current.pars + pars,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<MiniGolfStats> {
    const reset = { ...DEFAULT_MINI_GOLF_STATS };
    await StorageService.set(this.storageKey, reset);
    return reset;
  }
}

export const miniGolfStatsRepository = new LocalMiniGolfStatsRepository();
