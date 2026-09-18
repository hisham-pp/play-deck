'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ColorThiefAbility, ColorThiefTargetKind } from '../types/color-thief.types';

const TARGETS_REQUIRED: Record<ColorThiefTargetKind, number> = {
  none: 0,
  'enemy-tile': 1,
  'any-tile': 1,
  'own-and-enemy': 2,
};

const PROMPTS: Record<ColorThiefTargetKind, string[]> = {
  none: [],
  'enemy-tile': ['Pick a tile an opponent holds.'],
  'any-tile': ['Pick any tile — the splash takes it and everything around it.'],
  'own-and-enemy': ['Pick one of your own tiles.', 'Now pick the enemy tile to trade it for.'],
};

export interface UseColorThiefTargetingOptions {
  ability: ColorThiefAbility | null;
  /** Fires the ability once enough tiles have been picked. */
  onFire: (targets: number[]) => void;
  /** Aiming is abandoned whenever this flips false — a turn change, a pause. */
  canAct: boolean;
}

export interface UseColorThiefTargetingReturn {
  isTargeting: boolean;
  selectedTargets: number[];
  targetPrompt: string | null;
  /** Starts aiming, or fires straight away for an ability that needs no target. */
  toggleTargeting: () => void;
  cancelTargeting: () => void;
  /** Feeds a tile into the aim. Returns false when nothing was being aimed. */
  pickTarget: (index: number) => boolean;
}

export function useColorThiefTargeting({
  ability,
  onFire,
  canAct,
}: UseColorThiefTargetingOptions): UseColorThiefTargetingReturn {
  const [isTargeting, setIsTargeting] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);

  const cancelTargeting = useCallback(() => {
    setIsTargeting(false);
    setSelectedTargets([]);
  }, []);

  // Losing the turn mid-aim must not leave a half-built target list behind.
  useEffect(() => {
    if (!canAct) cancelTargeting();
  }, [canAct, cancelTargeting]);

  const toggleTargeting = useCallback(() => {
    if (!ability || ability.kind !== 'active') return;
    if (isTargeting) {
      cancelTargeting();
      return;
    }
    if (TARGETS_REQUIRED[ability.targetKind] === 0) {
      onFire([]);
      return;
    }
    setIsTargeting(true);
    setSelectedTargets([]);
  }, [ability, isTargeting, cancelTargeting, onFire]);

  const pickTarget = useCallback(
    (index: number) => {
      if (!isTargeting || !ability) return false;

      const needed = TARGETS_REQUIRED[ability.targetKind];
      const next = [...selectedTargets, index];

      if (next.length < needed) {
        setSelectedTargets(next);
        return true;
      }

      cancelTargeting();
      onFire(next);
      return true;
    },
    [isTargeting, ability, selectedTargets, cancelTargeting, onFire],
  );

  const targetPrompt =
    isTargeting && ability
      ? (PROMPTS[ability.targetKind][selectedTargets.length] ?? 'Pick a tile.')
      : null;

  return {
    isTargeting,
    selectedTargets,
    targetPrompt,
    toggleTargeting,
    cancelTargeting,
    pickTarget,
  };
}
