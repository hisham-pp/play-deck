'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PLAYDECK_ACHIEVEMENTS } from '@/data/achievements';
import { useAchievementsStore } from '@/stores/achievements.store';
import { MAPS } from '../engine/maps';
import { applyRunToProgress } from '../engine/summit-engine';
import type { RunResult, SummitProgress, UpgradeId } from '../engine/summit-types';
import { VEHICLES } from '../engine/vehicles';
import {
  DEFAULT_SUMMIT_PROGRESS,
  purchaseUpgrade,
  summitProgressRepository,
} from '../services/summit-progress-repository';

/** Coins, upgrades and records, persisted through StorageService. */
export function useSummitProgress() {
  const [progress, setProgress] = useState<SummitProgress>(DEFAULT_SUMMIT_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    let cancelled = false;
    summitProgressRepository
      .load()
      .then((loaded) => {
        if (!cancelled) setProgress(loaded);
      })
      .catch(() => {
        // Storage can be unavailable (private mode); play on with defaults.
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((next: SummitProgress) => {
    progressRef.current = next;
    setProgress(next);
    void summitProgressRepository.save(next).catch(() => undefined);
  }, []);

  const recordRun = useCallback(
    (result: RunResult) => commit(applyRunToProgress(progressRef.current, result, progressRef.current.selectedMapId)),
    [commit],
  );

  const buyUpgrade = useCallback(
    (id: UpgradeId): boolean => {
      const next = purchaseUpgrade(progressRef.current, id);
      if (!next) return false;
      commit(next);
      
      const store = useAchievementsStore.getState();
      store.unlock(PLAYDECK_ACHIEVEMENTS.summit_upgrade_first);
      
      const levels = Object.values(next.upgrades);
      if (levels.some(l => l >= 5)) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_upgrade_max_one);
      if (levels.every(l => l >= 5)) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_upgrade_max_all);
      
      return true;
    },
    [commit],
  );

  const selectVehicle = useCallback(
    (vehicleId: string) => {
      if (progressRef.current.unlockedVehicles.includes(vehicleId)) {
        commit({ ...progressRef.current, selectedVehicleId: vehicleId });
      }
    },
    [commit],
  );

  const selectMap = useCallback(
    (mapId: string) => {
      if (progressRef.current.unlockedMaps.includes(mapId)) {
        commit({ ...progressRef.current, selectedMapId: mapId });
      }
    },
    [commit],
  );

  const unlockVehicle = useCallback(
    (vehicleId: string, cost: number): boolean => {
      const current = progressRef.current;
      if (current.unlockedVehicles.includes(vehicleId) || current.coins < cost) return false;
      
      const newVehicles = [...current.unlockedVehicles, vehicleId];
      commit({
        ...current,
        coins: current.coins - cost,
        unlockedVehicles: newVehicles,
        selectedVehicleId: vehicleId,
      });
      
      const store = useAchievementsStore.getState();
      if (newVehicles.length >= 2) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_vehicle_2);
      if (newVehicles.length >= VEHICLES.length) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_vehicle_all);
      
      return true;
    },
    [commit],
  );

  const unlockMap = useCallback(
    (mapId: string, cost: number): boolean => {
      const current = progressRef.current;
      if (current.unlockedMaps.includes(mapId) || current.coins < cost) return false;
      
      const newMaps = [...current.unlockedMaps, mapId];
      commit({
        ...current,
        coins: current.coins - cost,
        unlockedMaps: newMaps,
        selectedMapId: mapId,
      });
      
      const store = useAchievementsStore.getState();
      if (newMaps.length >= 2) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_map_2);
      if (newMaps.length >= MAPS.length) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_map_all);
      
      return true;
    },
    [commit],
  );

  const resetProgress = useCallback(async () => {
    const fresh = await summitProgressRepository.reset();
    progressRef.current = fresh;
    setProgress(fresh);
  }, []);

  return { 
    progress, 
    progressRef, 
    isLoaded, 
    recordRun, 
    buyUpgrade, 
    resetProgress,
    selectVehicle,
    selectMap,
    unlockVehicle,
    unlockMap
  };
}
