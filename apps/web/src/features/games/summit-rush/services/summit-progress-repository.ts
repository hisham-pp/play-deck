import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { SummitProgress, UpgradeId } from '../engine/summit-types';
import {
  DEFAULT_UPGRADES,
  MAX_UPGRADE_LEVEL,
  sanitizeUpgrades,
  UPGRADES,
  upgradeCost,
} from '../engine/upgrades';

export const SUMMIT_GAME_ID = 'summit-rush';

export const DEFAULT_SUMMIT_PROGRESS: SummitProgress = {
  coins: 0,
  bestDistance: 0,
  bestScore: 0,
  totalRuns: 0,
  totalDistance: 0,
  upgrades: { ...DEFAULT_UPGRADES },
};

const nonNegative = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

/** Guards against corrupted or older saved shapes. */
export function normalizeProgress(raw: Partial<SummitProgress> | null | undefined): SummitProgress {
  if (!raw) return { ...DEFAULT_SUMMIT_PROGRESS, upgrades: { ...DEFAULT_UPGRADES } };
  return {
    coins: nonNegative(raw.coins),
    bestDistance: nonNegative(raw.bestDistance),
    bestScore: nonNegative(raw.bestScore),
    totalRuns: nonNegative(raw.totalRuns),
    totalDistance: nonNegative(raw.totalDistance),
    upgrades: sanitizeUpgrades(raw.upgrades),
  };
}

/** Returns the progress after buying one level, or null if unaffordable/maxed. */
export function purchaseUpgrade(progress: SummitProgress, id: UpgradeId): SummitProgress | null {
  const info = UPGRADES.find((u) => u.id === id);
  if (!info) return null;
  const level = progress.upgrades[id];
  const cost = upgradeCost(info, level);
  if (cost === null || level >= MAX_UPGRADE_LEVEL || progress.coins < cost) return null;
  return {
    ...progress,
    coins: progress.coins - cost,
    upgrades: { ...progress.upgrades, [id]: level + 1 },
  };
}

export interface ISummitProgressRepository {
  load(): Promise<SummitProgress>;
  save(progress: SummitProgress): Promise<void>;
  reset(): Promise<SummitProgress>;
}

export class LocalSummitProgressRepository implements ISummitProgressRepository {
  private readonly storageKey = STORAGE_KEYS.gameSave(SUMMIT_GAME_ID, 'progress');

  async load(): Promise<SummitProgress> {
    const stored = await StorageService.get<Partial<SummitProgress>>(this.storageKey);
    return normalizeProgress(stored);
  }

  async save(progress: SummitProgress): Promise<void> {
    await StorageService.set(this.storageKey, normalizeProgress(progress));
  }

  async reset(): Promise<SummitProgress> {
    const fresh = normalizeProgress(null);
    await StorageService.set(this.storageKey, fresh);
    return fresh;
  }
}

export const summitProgressRepository = new LocalSummitProgressRepository();
