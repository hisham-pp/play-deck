'use client';

import { useEffect, useRef } from 'react';
import type { TetrisGameStatus } from '../types/tetris.types';
import {
  PREVENT_DEFAULT_KEYS,
  REPEATABLE_PLAYING_ACTIONS,
  resolveIdleKeyAction,
  resolvePlayingKeyAction,
} from './tetris-key-map';

interface TetrisInputHandlers {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  onPause: () => void;
  onResume: () => void;
  onStart: () => void;
  onRestart: () => void;
}

interface UseTetrisInputOptions extends TetrisInputHandlers {
  status: TetrisGameStatus;
}

const DAS_MS = 170;
const ARR_MS = 45;
const SWIPE_THRESHOLD_PX = 25;
const TAP_MAX_DURATION_MS = 200;
const TAP_MAX_MOVEMENT_PX = 12;

export function useTetrisInput(options: UseTetrisInputOptions) {
  const { status, onMoveLeft, onMoveRight, onSoftDrop, onHardDrop, onRotateCW } = options;

  const handlersRef = useRef(options);
  handlersRef.current = options;

  const dasTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const softDropTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeDirectionRef = useRef<'left' | 'right' | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const clearHorizontalTimers = () => {
    if (dasTimerRef.current) clearTimeout(dasTimerRef.current);
    if (arrTimerRef.current) clearInterval(arrTimerRef.current);
    dasTimerRef.current = null;
    arrTimerRef.current = null;
    activeDirectionRef.current = null;
  };

  const clearSoftDropTimer = () => {
    if (softDropTimerRef.current) clearInterval(softDropTimerRef.current);
    softDropTimerRef.current = null;
  };

  const startHorizontalRepeat = (direction: 'left' | 'right') => {
    if (activeDirectionRef.current === direction) return;
    clearHorizontalTimers();
    activeDirectionRef.current = direction;

    const move = () => {
      if (direction === 'left') handlersRef.current.onMoveLeft();
      else handlersRef.current.onMoveRight();
    };

    move();
    dasTimerRef.current = setTimeout(() => {
      arrTimerRef.current = setInterval(move, ARR_MS);
    }, DAS_MS);
  };

  const startSoftDropRepeat = () => {
    if (softDropTimerRef.current) return;
    handlersRef.current.onSoftDrop();
    softDropTimerRef.current = setInterval(() => {
      handlersRef.current.onSoftDrop();
    }, ARR_MS);
  };

  useEffect(() => {
    return () => {
      clearHorizontalTimers();
      clearSoftDropTimer();
    };
  }, []);

  useEffect(() => {
    if (status !== 'playing') {
      clearHorizontalTimers();
      clearSoftDropTimer();
    }
  }, [status]);

  useEffect(() => {
    const handleIdleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') e.preventDefault();
      const action = resolveIdleKeyAction(e.key, status);
      const handlers = handlersRef.current;
      if (action === 'resume') handlers.onResume();
      else if (action === 'restart') handlers.onRestart();
      else if (action === 'start') handlers.onStart();
    };

    const dispatchPlayingAction = (e: KeyboardEvent) => {
      const action = resolvePlayingKeyAction(e.key);
      if (!action || (e.repeat && REPEATABLE_PLAYING_ACTIONS.has(action))) return;

      const handlers = handlersRef.current;
      switch (action) {
        case 'move-left':
          startHorizontalRepeat('left');
          break;
        case 'move-right':
          startHorizontalRepeat('right');
          break;
        case 'soft-drop':
          startSoftDropRepeat();
          break;
        case 'hard-drop':
          e.preventDefault();
          handlers.onHardDrop();
          break;
        case 'rotate-cw':
          handlers.onRotateCW();
          break;
        case 'rotate-ccw':
          handlers.onRotateCCW();
          break;
        case 'hold':
          handlers.onHold();
          break;
        case 'pause':
          handlers.onPause();
          break;
        case 'restart':
          handlers.onRestart();
          break;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (PREVENT_DEFAULT_KEYS.has(e.key) && (status === 'playing' || status === 'countdown')) {
        e.preventDefault();
      }

      if (status !== 'playing') {
        handleIdleKey(e);
        return;
      }
      dispatchPlayingAction(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const action = resolvePlayingKeyAction(e.key);
      if (action === 'move-left' && activeDirectionRef.current === 'left') {
        clearHorizontalTimers();
      } else if (action === 'move-right' && activeDirectionRef.current === 'right') {
        clearHorizontalTimers();
      } else if (action === 'soft-drop') {
        clearSoftDropTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch || !touchStartRef.current) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    const isTap =
      deltaTime <= TAP_MAX_DURATION_MS &&
      Math.abs(deltaX) < TAP_MAX_MOVEMENT_PX &&
      Math.abs(deltaY) < TAP_MAX_MOVEMENT_PX;

    if (isTap) {
      onRotateCW();
      return;
    }

    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > SWIPE_THRESHOLD_PX * 2) {
      onHardDrop();
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
      if (deltaX > 0) onMoveRight();
      else onMoveLeft();
      return;
    }

    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > SWIPE_THRESHOLD_PX) {
      onSoftDrop();
    }
  };

  return { handleTouchStart, handleTouchEnd };
}
