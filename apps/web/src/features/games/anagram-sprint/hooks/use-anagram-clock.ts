'use client';

import { useEffect, useState } from 'react';
import { STATUS_PLAYING } from '../engine/anagram-constants';
import { currentRound } from '../engine/anagram-state';
import type { AnagramState } from '../types/anagram-sprint.types';

/** Fine enough for a readable countdown without repainting every frame. */
const TICK_INTERVAL_MS = 100;

export interface AnagramClock {
  /** Whole seconds left on the current word, never negative. */
  secondsLeft: number;
  /** 0 when the word is dealt, 1 when the clock runs out. */
  progress: number;
  /** Milliseconds spent on the word so far — what an answer is timed by. */
  elapsedMs: number;
  isExpired: boolean;
}

/**
 * Derived from wall time rather than counted down tick by tick, so a throttled
 * background tab cannot hand a player extra seconds.
 */
export function useAnagramClock(state: AnagramState, onExpire: () => void): AnagramClock {
  const [now, setNow] = useState(() => Date.now());
  const isRunning = state.status === STATUS_PLAYING;

  useEffect(() => {
    if (!isRunning) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isRunning, state.roundIndex]);

  const totalMs = (currentRound(state)?.seconds ?? 0) * 1000;
  const elapsedMs = isRunning ? Math.max(0, now - state.roundStartedAt) : 0;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const isExpired = isRunning && totalMs > 0 && remainingMs <= 0;

  useEffect(() => {
    if (isExpired) onExpire();
  }, [isExpired, onExpire]);

  return {
    secondsLeft: Math.ceil(remainingMs / 1000),
    progress: totalMs > 0 ? Math.min(1, elapsedMs / totalMs) : 0,
    elapsedMs,
    isExpired,
  };
}
