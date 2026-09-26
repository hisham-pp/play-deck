'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameScorePayload } from '@playdeck/game-types';

export type GameLifecycleStatus =
  'idle' | 'ready' | 'playing' | 'paused' | 'game-over' | 'completed';

export interface UseGameLifecycleOptions {
  initialStatus?: GameLifecycleStatus;
  enableKeyboardShortcuts?: boolean;
  onGameStart?: () => void;
  onGamePause?: () => void;
  onGameResume?: () => void;
  onGameRestart?: () => void;
  onGameOver?: (result: GameScorePayload) => void;
}

export interface UseGameLifecycleReturn {
  status: GameLifecycleStatus;
  score: number;
  highScore: number;
  durationMs: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isReady: boolean;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePause: () => void;
  restartGame: () => void;
  finishGame: (payload?: Partial<GameScorePayload>) => void;
  setScore: (scoreOrUpdater: number | ((prev: number) => number)) => void;
}

export function useGameLifecycle(options: UseGameLifecycleOptions = {}): UseGameLifecycleReturn {
  const {
    initialStatus = 'ready',
    enableKeyboardShortcuts = true,
    onGameStart,
    onGamePause,
    onGameResume,
    onGameRestart,
    onGameOver,
  } = options;

  const [status, setStatus] = useState<GameLifecycleStatus>(initialStatus);
  const [score, setScoreState] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [durationMs, setDurationMs] = useState<number>(0);

  const startTimeRef = useRef<number | null>(null);
  const accumulatedDurationRef = useRef<number>(0);

  const setScore = useCallback((scoreOrUpdater: number | ((prev: number) => number)) => {
    setScoreState((prev) => {
      const next = typeof scoreOrUpdater === 'function' ? scoreOrUpdater(prev) : scoreOrUpdater;
      setHighScore((prevHigh) => Math.max(prevHigh, next));
      return next;
    });
  }, []);

  const startGame = useCallback(() => {
    setStatus('playing');
    setScoreState(0);
    setDurationMs(0);
    accumulatedDurationRef.current = 0;
    startTimeRef.current = performance.now();
    onGameStart?.();
  }, [onGameStart]);

  const pauseGame = useCallback(() => {
    setStatus((current) => {
      if (current !== 'playing') return current;
      if (startTimeRef.current !== null) {
        accumulatedDurationRef.current += performance.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
      setDurationMs(Math.round(accumulatedDurationRef.current));
      onGamePause?.();
      return 'paused';
    });
  }, [onGamePause]);

  const resumeGame = useCallback(() => {
    setStatus((current) => {
      if (current !== 'paused') return current;
      startTimeRef.current = performance.now();
      onGameResume?.();
      return 'playing';
    });
  }, [onGameResume]);

  const togglePause = useCallback(() => {
    setStatus((current) => {
      if (current === 'playing') {
        if (startTimeRef.current !== null) {
          accumulatedDurationRef.current += performance.now() - startTimeRef.current;
          startTimeRef.current = null;
        }
        setDurationMs(Math.round(accumulatedDurationRef.current));
        onGamePause?.();
        return 'paused';
      }
      if (current === 'paused') {
        startTimeRef.current = performance.now();
        onGameResume?.();
        return 'playing';
      }
      return current;
    });
  }, [onGamePause, onGameResume]);

  const restartGame = useCallback(() => {
    setStatus('ready');
    setScoreState(0);
    setDurationMs(0);
    accumulatedDurationRef.current = 0;
    startTimeRef.current = null;
    onGameRestart?.();
  }, [onGameRestart]);

  const finishGame = useCallback(
    (payload?: Partial<GameScorePayload>) => {
      setStatus((current) => {
        if (current === 'game-over' || current === 'completed') return current;

        let finalDuration = accumulatedDurationRef.current;
        if (startTimeRef.current !== null) {
          finalDuration += performance.now() - startTimeRef.current;
          startTimeRef.current = null;
        }
        finalDuration = Math.round(finalDuration);
        setDurationMs(finalDuration);

        const finalScore = payload?.score !== undefined ? payload.score : score;
        const newHighScore = Math.max(highScore, finalScore);
        setHighScore(newHighScore);

        const result: GameScorePayload = {
          score: finalScore,
          highScore: newHighScore,
          durationMs: finalDuration,
          ...payload,
        };

        onGameOver?.(result);
        return 'game-over';
      });
    },
    [score, highScore, onGameOver],
  );

  // Keyboard controls for standard pause & restart actions
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      } else if (e.code === 'KeyR' && (status === 'game-over' || status === 'completed')) {
        e.preventDefault();
        restartGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, togglePause, restartGame, status]);

  return {
    status,
    score,
    highScore,
    durationMs,
    isPlaying: status === 'playing',
    isPaused: status === 'paused',
    isGameOver: status === 'game-over' || status === 'completed',
    isReady: status === 'ready' || status === 'idle',
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    restartGame,
    finishGame,
    setScore,
  };
}

/**
 * Reusable requestAnimationFrame loop hook with delta time calculations.
 */
export function useGameLoop(
  callback: (deltaTimeMs: number) => void,
  options: { isRunning: boolean; maxDeltaMs?: number } = { isRunning: true },
) {
  const { isRunning, maxDeltaMs = 100 } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!isRunning) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min(currentTime - lastTime, maxDeltaMs);
      lastTime = currentTime;

      callbackRef.current(delta);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, maxDeltaMs]);
}
