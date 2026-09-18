'use client';

import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { GAME_ID } from '../engine/bomb-factory-constants';
import { createPrivateRandom } from '../engine/bomb-factory-rng';
import { generateDossier } from '../engine/information-splitter';
import type {
  BombFactoryMode,
  DistributionPlan,
  Dossier,
  MachineSpec,
} from '../types/bomb-factory.types';

interface StoredDossiers {
  signature: string;
  dossiers: Dossier[];
}

interface UseBombFactoryDossiersOptions {
  mode: BombFactoryMode;
  spec: MachineSpec | null;
  plan: DistributionPlan;
  localSeatId: string | null;
  roomCode: string | null;
}

/**
 * Draws the facts this client is entitled to and nothing else. Online, that is
 * one seat's share; on a single device it is every seat's, because there is
 * only one client to hold them. Nothing generated here is ever transmitted.
 */
export function useBombFactoryDossiers({
  mode,
  spec,
  plan,
  localSeatId,
  roomCode,
}: UseBombFactoryDossiersOptions): Dossier[] {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);

  const seatIds =
    mode === 'local'
      ? [...new Set(plan.map((entry) => entry.seatId))].sort()
      : localSeatId
        ? [localSeatId]
        : [];
  const signature = spec ? `${spec.seed}:${spec.index}:${seatIds.join(',')}` : '';

  useEffect(() => {
    if (!spec || seatIds.length === 0) {
      setDossiers([]);
      return;
    }

    let cancelled = false;
    const storageKey = STORAGE_KEYS.gameSave(GAME_ID, roomCode ?? 'local');

    async function restoreOrDraw() {
      // A refresh mid-machine must not lose a seat's share: without it the
      // room would deadlock waiting for a verdict nobody can give any more.
      const stored = await StorageService.get<StoredDossiers>(storageKey);
      if (cancelled) return;
      if (stored?.signature === signature) {
        setDossiers(stored.dossiers);
        return;
      }

      const random = createPrivateRandom();
      const drawn = seatIds.map((seatId) => generateDossier(spec!, plan, seatId, random));
      if (cancelled) return;
      setDossiers(drawn);
      await StorageService.set<StoredDossiers>(storageKey, { signature, dossiers: drawn });
    }

    void restoreOrDraw();
    return () => {
      cancelled = true;
    };
    // `signature` already folds in the machine, its seed and the seats dealt to.
  }, [signature, roomCode]);

  return dossiers;
}
