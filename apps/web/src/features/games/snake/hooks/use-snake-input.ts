'use client';

import { useEffect, useRef } from 'react';
import type { Direction, SnakeGameStatus } from '../types/snake.types';

interface SnakeInputHandlers {
  onDirectionChange: (dir: Direction) => void;
  onPause: () => void;
  onResume: () => void;
  onStart: () => void;
  onRestart: () => void;
}

interface UseSnakeInputOptions extends SnakeInputHandlers {
  status: SnakeGameStatus;
}

const SWIPE_THRESHOLD_PX = 25;

const DIR_UP: Direction = 'UP';
const DIR_DOWN: Direction = 'DOWN';
const DIR_LEFT: Direction = 'LEFT';
const DIR_RIGHT: Direction = 'RIGHT';

const DIRECTION_KEY_MAP: Record<string, Direction> = {
  ArrowUp: DIR_UP,
  w: DIR_UP,
  W: DIR_UP,
  ArrowDown: DIR_DOWN,
  s: DIR_DOWN,
  S: DIR_DOWN,
  ArrowLeft: DIR_LEFT,
  a: DIR_LEFT,
  A: DIR_LEFT,
  ArrowRight: DIR_RIGHT,
  d: DIR_RIGHT,
  D: DIR_RIGHT,
};

function resolveSwipe(deltaX: number, deltaY: number): Direction | null {
  if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX && Math.abs(deltaY) < SWIPE_THRESHOLD_PX) {
    return null;
  }
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? DIR_RIGHT : DIR_LEFT;
  }
  return deltaY > 0 ? DIR_DOWN : DIR_UP;
}

function handleNonDirectionKey(key: string, status: SnakeGameStatus, handlers: SnakeInputHandlers) {
  if (key === ' ' || key === 'p' || key === 'P') {
    if (status === 'playing') handlers.onPause();
    else if (status === 'paused') handlers.onResume();
  } else if (key === 'r' || key === 'R') {
    if (status !== 'idle') handlers.onRestart();
  } else if (key === 'Enter') {
    if (status === 'idle') handlers.onStart();
    else if (status === 'game-over') handlers.onRestart();
  }
}

export function useSnakeInput(options: UseSnakeInputOptions) {
  const { status, onDirectionChange, onPause, onResume, onStart, onRestart } = options;
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isNavKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key);
      if (isNavKey && (status === 'playing' || status === 'countdown')) {
        e.preventDefault();
      }

      const dir = DIRECTION_KEY_MAP[e.key];
      if (dir) {
        onDirectionChange(dir);
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
      }

      handleNonDirectionKey(e.key, status, {
        onDirectionChange,
        onPause,
        onResume,
        onStart,
        onRestart,
      });
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, onDirectionChange, onPause, onResume, onStart, onRestart]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch || !touchStartRef.current) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const swipeDir = resolveSwipe(deltaX, deltaY);
    if (swipeDir) {
      onDirectionChange(swipeDir);
    }
  };

  return { handleTouchStart, handleTouchEnd };
}
