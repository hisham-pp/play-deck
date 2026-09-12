'use client';

import { useEffect } from 'react';
import type { TetrisEngine } from '../engine/tetris-engine';
import type { TetrisGameStatus } from '../types/tetris.types';

export function useAutoPause(engine: TetrisEngine) {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && engine.getState().status === 'playing') {
        engine.pause();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    return () => window.removeEventListener('visibilitychange', handleVisibility);
  }, [engine]);
}

export function useCountdown(status: TetrisGameStatus, engine: TetrisEngine) {
  useEffect(() => {
    if (status !== 'countdown') return;
    const interval = setInterval(() => {
      engine.countdownTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [status, engine]);
}

export function useGravityLoop(status: TetrisGameStatus, engine: TetrisEngine) {
  useEffect(() => {
    if (status !== 'playing') return;

    let rafId: number;
    let lastTime = performance.now();
    let accumulated = 0;

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      accumulated += delta;

      const currentSpeed = engine.getState().gravityMs;
      if (accumulated >= currentSpeed) {
        engine.tick();
        accumulated = 0;
      }

      if (engine.getState().status === 'playing') {
        rafId = requestAnimationFrame(loop);
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [status, engine]);
}

export type LineClearSfx = 'clear-single' | 'clear-double' | 'clear-triple' | 'clear-tetris';

export function lineClearSfx(linesCleared: number): LineClearSfx {
  if (linesCleared >= 4) return 'clear-tetris';
  if (linesCleared === 3) return 'clear-triple';
  if (linesCleared === 2) return 'clear-double';
  return 'clear-single';
}
