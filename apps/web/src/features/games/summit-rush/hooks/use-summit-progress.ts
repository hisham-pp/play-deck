'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { applyRunToProgress } from '../engine/summit-engine';
import type { RunResult, SummitProgress, UpgradeId } from '../engine/summit-types';
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
    (result: RunResult) => commit(applyRunToProgress(progressRef.current, result)),
    [commit],
  );

  const buyUpgrade = useCallback(
    (id: UpgradeId): boolean => {
      const next = purchaseUpgrade(progressRef.current, id);
      if (!next) return false;
      commit(next);
      return true;
    },
    [commit],
  );

  const resetProgress = useCallback(async () => {
    const fresh = await summitProgressRepository.reset();
    progressRef.current = fresh;
    setProgress(fresh);
  }, []);

  return { progress, progressRef, isLoaded, recordRun, buyUpgrade, resetProgress };
}
