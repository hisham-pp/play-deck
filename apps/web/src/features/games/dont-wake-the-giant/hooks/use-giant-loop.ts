'use client';

import { useEffect, useRef } from 'react';

/** A single long stall must not teleport the whole crew across the room. */
const MAX_STEP_SEC = 1 / 20;

/**
 * Drives the simulation off `requestAnimationFrame`. The callback is kept in a
 * ref so a re-render never restarts the loop mid-heist.
 */
export function useGiantLoop(running: boolean, onFrame: (dtSec: number) => void): void {
  const callback = useRef(onFrame);
  callback.current = onFrame;

  useEffect(() => {
    if (!running || typeof window === 'undefined') return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dtSec = Math.min((now - last) / 1000, MAX_STEP_SEC);
      last = now;
      callback.current(dtSec);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [running]);
}
