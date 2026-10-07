import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { getSupabaseClient } from '@/lib/supabase/client';
import { usePlayerStore } from '@/stores/player.store';
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
  unlockedVehicles: ['buggy'],
  selectedVehicleId: 'buggy',
  unlockedMaps: ['meadows'],
  selectedMapId: 'meadows',
  mapRecords: {},
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
    unlockedVehicles: Array.isArray(raw.unlockedVehicles) ? raw.unlockedVehicles : ['buggy'],
    selectedVehicleId: raw.selectedVehicleId || 'buggy',
    unlockedMaps: Array.isArray(raw.unlockedMaps) ? raw.unlockedMaps : ['meadows'],
    selectedMapId: raw.selectedMapId || 'meadows',
    mapRecords: raw.mapRecords && typeof raw.mapRecords === 'object' ? raw.mapRecords : {},
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

export class HybridSummitProgressRepository implements ISummitProgressRepository {
  private readonly storageKey = STORAGE_KEYS.gameSave(SUMMIT_GAME_ID, 'progress');

  async load(): Promise<SummitProgress> {
    const supabase = getSupabaseClient();
    const player = usePlayerStore.getState().player;
    
    if (supabase && player && !player.isGuest) {
      try {
        const { data, error } = await supabase
          .from('summit_rush_progress')
          .select('*')
          .eq('user_id', player.id)
          .maybeSingle();
          
        if (!error && data) {
          // Sync to local
          const mapped: Partial<SummitProgress> = {
            coins: data.coins,
            bestDistance: data.best_distance,
            bestScore: data.best_score,
            totalRuns: data.total_runs,
            totalDistance: data.total_distance,
            upgrades: data.upgrades,
            unlockedVehicles: data.unlocked_vehicles,
            selectedVehicleId: data.selected_vehicle,
            unlockedMaps: data.unlocked_maps,
            selectedMapId: data.selected_map,
            mapRecords: data.map_records,
          };
          const normalized = normalizeProgress(mapped);
          await StorageService.set(this.storageKey, normalized);
          return normalized;
        }
      } catch (e) {
        console.error('Failed to load progress from Supabase', e);
      }
    }
    
    // Fallback to local
    const stored = await StorageService.get<Partial<SummitProgress>>(this.storageKey);
    return normalizeProgress(stored);
  }

  async save(progress: SummitProgress): Promise<void> {
    const normalized = normalizeProgress(progress);
    await StorageService.set(this.storageKey, normalized);
    
    const supabase = getSupabaseClient();
    const player = usePlayerStore.getState().player;
    
    if (supabase && player && !player.isGuest) {
      try {
        await supabase
          .from('summit_rush_progress')
          .upsert({
            user_id: player.id,
            coins: normalized.coins,
            best_distance: normalized.bestDistance,
            best_score: normalized.bestScore,
            total_runs: normalized.totalRuns,
            total_distance: normalized.totalDistance,
            upgrades: normalized.upgrades,
            unlocked_vehicles: normalized.unlockedVehicles,
            selected_vehicle: normalized.selectedVehicleId,
            unlocked_maps: normalized.unlockedMaps,
            selected_map: normalized.selectedMapId,
            map_records: normalized.mapRecords,
            updated_at: new Date().toISOString(),
          });
      } catch (e) {
        console.error('Failed to save progress to Supabase', e);
      }
    }
  }

  async reset(): Promise<SummitProgress> {
    const fresh = normalizeProgress(null);
    await this.save(fresh);
    return fresh;
  }
}

export const summitProgressRepository = new HybridSummitProgressRepository();
