import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { PushYourLuckStats } from '../types/push-your-luck.types';

export interface RecordMatchParams {
  won: boolean;
  banked: number;
  busts: number;
  longestPushStreak: number;
}

export interface IPushYourLuckStatsRepository {
  getStats(): Promise<PushYourLuckStats>;
  recordMatchResult(params: RecordMatchParams): Promise<PushYourLuckStats>;
}

const DEFAULT_STATS: PushYourLuckStats = {
  matchesPlayed: 0,
  wins: 0,
  totalBanked: 0,
  totalBusts: 0,
  biggestBank: 0,
  longestPushStreak: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedAt: '',
};

export class LocalPushYourLuckStatsRepository implements IPushYourLuckStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('push-your-luck');

  async getStats(): Promise<PushYourLuckStats> {
    const stats = await StorageService.get<PushYourLuckStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordMatchResult({
    won,
    banked,
    busts,
    longestPushStreak,
  }: RecordMatchParams): Promise<PushYourLuckStats> {
    const current = await this.getStats();
    const currentStreak = won ? current.currentStreak + 1 : 0;

    const updated: PushYourLuckStats = {
      matchesPlayed: current.matchesPlayed + 1,
      wins: won ? current.wins + 1 : current.wins,
      totalBanked: current.totalBanked + banked,
      totalBusts: current.totalBusts + busts,
      biggestBank: Math.max(current.biggestBank, banked),
      longestPushStreak: Math.max(current.longestPushStreak, longestPushStreak),
      currentStreak,
      bestStreak: Math.max(current.bestStreak, currentStreak),
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const pushYourLuckStatsRepository = new LocalPushYourLuckStatsRepository();
