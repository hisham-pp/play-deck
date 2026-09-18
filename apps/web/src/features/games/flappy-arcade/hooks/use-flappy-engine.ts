'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialFlappyState,
  DEFAULT_FLAPPY_CONFIG,
  stepFlappyGame,
} from '../engine/flappy-engine';
import type { FlappyGameState, FlappyStats } from '../engine/flappy-types';
import { flappySoundService } from '../services/flappy-sound.service';
import { DEFAULT_FLAPPY_STATS, flappyStatsRepository } from '../services/flappy-stats-repository';

interface UseFlappyEngineOptions {
  onGameOver?: (score: number) => void;
  soundEnabled?: boolean;
}

export function useFlappyEngine({ onGameOver, soundEnabled = true }: UseFlappyEngineOptions = {}) {
  const [stats, setStats] = useState<FlappyStats>(DEFAULT_FLAPPY_STATS);
  const [state, setState] = useState<FlappyGameState>(() =>
    createInitialFlappyState(0, DEFAULT_FLAPPY_CONFIG),
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const flapRequestedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  // Sync sound service setting
  useEffect(() => {
    flappySoundService.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Load persistent stats
  const refreshStats = useCallback(async () => {
    try {
      const loaded = await flappyStatsRepository.getStats();
      setStats(loaded);
      setState((prev) => ({
        ...prev,
        highScore: Math.max(prev.highScore, loaded.bestScore),
      }));
    } catch {
      // IndexedDB fallback
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const flap = useCallback(() => {
    if (stateRef.current.status === 'idle') {
      // Auto-start on first tap
      lastTimeRef.current = performance.now();
      setState((prev) => ({ ...prev, status: 'playing' }));
      flapRequestedRef.current = true;
      return;
    }

    if (stateRef.current.status === 'playing') {
      flapRequestedRef.current = true;
    }
  }, []);

  const startGame = useCallback(() => {
    lastTimeRef.current = performance.now();
    setState((prev) => ({ ...prev, status: 'playing' }));
    flapRequestedRef.current = true;
  }, []);

  const pauseGame = useCallback(() => {
    setState((prev) => (prev.status === 'playing' ? { ...prev, status: 'paused' } : prev));
  }, []);

  const resumeGame = useCallback(() => {
    if (stateRef.current.status === 'paused') {
      lastTimeRef.current = performance.now();
      setState((prev) => ({ ...prev, status: 'playing' }));
    }
  }, []);

  const restartGame = useCallback(() => {
    flapRequestedRef.current = false;
    const initial = createInitialFlappyState(
      Math.max(stateRef.current.highScore, stats.bestScore),
      DEFAULT_FLAPPY_CONFIG,
    );
    initial.status = 'playing';
    lastTimeRef.current = performance.now();
    setState(initial);
    flap();
  }, [flap, stats.bestScore]);

  // Main game loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      // Cap dt to prevent tunneling after tab switches
      const dt = Math.min(rawDt, 0.05);

      const currentState = stateRef.current;
      const input = { flap: flapRequestedRef.current };
      flapRequestedRef.current = false;

      const nextState = stepFlappyGame(
        currentState,
        dt,
        input,
        {
          onFlap: () => flappySoundService.playFlap(),
          onScore: (score) => {
            if (score % 10 === 0) {
              flappySoundService.playMilestone();
            } else {
              flappySoundService.playScore();
            }
          },
          onCollision: () => flappySoundService.playCollision(),
          onGameOver: (finalScore) => {
            // Persist stats
            flappyStatsRepository
              .recordGameResult(finalScore, finalScore)
              .then((updated) => setStats(updated))
              .catch(() => {});

            onGameOverRef.current?.(finalScore);
          },
        },
        DEFAULT_FLAPPY_CONFIG,
      );

      setState(nextState);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    state,
    stats,
    flap,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    refreshStats,
  };
}
