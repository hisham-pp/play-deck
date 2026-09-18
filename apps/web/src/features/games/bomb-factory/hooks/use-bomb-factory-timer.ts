'use client';

import { useEffect, useRef, useState } from 'react';
import { PHASE_ASSEMBLY } from '../engine/bomb-factory-constants';
import { remainingSeconds } from '../engine/bomb-factory-scoring';
import type { BombFactoryState } from '../types/bomb-factory.types';

const TICK_MS = 250;

/**
 * Drives the shop-floor clock. Every client counts down on its own, but only
 * the host is allowed to call time, so a slow connection never fails a machine
 * the rest of the room just finished.
 */
export function useBombFactoryTimer(
  state: BombFactoryState,
  onExpire: (() => void) | null,
): number {
  const [secondsLeft, setSecondsLeft] = useState(() => remainingSeconds(state, Date.now()));
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (state.phase !== PHASE_ASSEMBLY || state.startedAt === null) {
      setSecondsLeft(remainingSeconds(state, Date.now()));
      return;
    }

    const tick = () => {
      const left = remainingSeconds(state, Date.now());
      setSecondsLeft(left);
      if (left <= 0) expireRef.current?.();
    };

    tick();
    const timer = setInterval(tick, TICK_MS);
    return () => clearInterval(timer);
  }, [state]);

  return secondsLeft;
}
