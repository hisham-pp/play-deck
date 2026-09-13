'use client';

import { useEffect } from 'react';
import type { SudokuEngine } from '../engine/sudoku-engine';
import type { SudokuStatus } from '../types/sudoku.types';

/** How often the clock advances. Fine enough for a readable second hand. */
const TICK_INTERVAL_MS = 250;

/**
 * Drives the puzzle clock from wall time rather than counting intervals, so a
 * throttled background tab cannot silently slow the timer down.
 */
export function useSudokuTimer(status: SudokuStatus, engine: SudokuEngine) {
  useEffect(() => {
    if (status !== 'playing') return;

    let last = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - last;
      last = now;
      engine.tick(delta);
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [status, engine]);
}

/** Pauses the run when the tab goes to the background. */
export function useSudokuAutoPause(engine: SudokuEngine) {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && engine.getState().status === 'playing') {
        engine.pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [engine]);
}
