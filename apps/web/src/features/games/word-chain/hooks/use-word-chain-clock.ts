'use client';

import { useEffect, useState } from 'react';
import type { WordChainState } from '../types/word-chain.types';

/** Fine enough for a readable countdown without repainting every frame. */
const TICK_INTERVAL_MS = 100;

export interface WordChainClock {
  /** Whole seconds left on the current turn, never negative. */
  secondsLeft: number;
  /** 0 at the start of a turn, 1 when the clock runs out. */
  progress: number;
}

/**
 * The countdown is derived from wall time rather than counted down tick by
 * tick, so a throttled background tab cannot hand a player extra seconds.
 */
export function useWordChainClock(state: WordChainState, onExpire: () => void): WordChainClock {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.status !== 'playing') return;
    const interval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state.status]);

  const totalMs = state.turnSeconds * 1000;
  const elapsedMs = state.status === 'playing' ? Math.max(0, now - state.turnStartedAt) : 0;
  const remainingMs = Math.max(0, totalMs - elapsedMs);

  useEffect(() => {
    if (state.status !== 'playing') return;
    if (totalMs > 0 && remainingMs <= 0) onExpire();
  }, [state.status, totalMs, remainingMs, onExpire]);

  return {
    secondsLeft: Math.ceil(remainingMs / 1000),
    progress: totalMs > 0 ? Math.min(1, elapsedMs / totalMs) : 0,
  };
}
