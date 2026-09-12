'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SnakeEngine } from '../engine/snake-engine';
import { snakeStatsRepository } from '../services/snake-stats-repository';
import type {
  Direction,
  SnakeDifficulty,
  SnakeGameStatus,
  SnakeState,
  SnakeStats,
} from '../types/snake.types';

function useAutoPause(engine: SnakeEngine) {
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

function useCountdown(status: SnakeGameStatus, engine: SnakeEngine) {
  useEffect(() => {
    if (status !== 'countdown') return;
    const interval = setInterval(() => {
      engine.countdownTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [status, engine]);
}

function useGameLoop(status: SnakeGameStatus, engine: SnakeEngine) {
  useEffect(() => {
    if (status !== 'playing') return;

    let rafId: number;
    let lastTime = performance.now();
    let accumulated = 0;

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      accumulated += delta;

      const currentSpeed = engine.getState().speedMs;
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

export function useSnakeEngine(onGameOverCallback?: (score: number) => void) {
  const engineRef = useRef<SnakeEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SnakeEngine(0);
  }
  const engine = engineRef.current;

  const [state, setState] = useState<SnakeState>(() => engine.getState());
  const [stats, setStats] = useState<SnakeStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    snakeStatsRepository.getStats().then((loaded) => {
      if (!isMounted) return;
      setStats(loaded);
      engine.setHighScore(loaded.highScore);
    });
    return () => {
      isMounted = false;
    };
  }, [engine]);

  useEffect(() => {
    return engine.subscribe(setState);
  }, [engine]);

  const prevStatusRef = useRef(state.status);
  useEffect(() => {
    if (prevStatusRef.current !== 'game-over' && state.status === 'game-over') {
      snakeStatsRepository.saveScore(state.score).then(({ stats: s }) => setStats(s));
      onGameOverCallback?.(state.score);
    }
    prevStatusRef.current = state.status;
  }, [state.status, state.score, onGameOverCallback]);

  useAutoPause(engine);
  useCountdown(state.status, engine);
  useGameLoop(state.status, engine);

  const startGame = useCallback(() => engine.start(), [engine]);
  const pauseGame = useCallback(() => engine.pause(), [engine]);
  const resumeGame = useCallback(() => engine.resume(), [engine]);
  const restartGame = useCallback(() => engine.restart(), [engine]);
  const changeDirection = useCallback((dir: Direction) => engine.changeDirection(dir), [engine]);
  const configureGame = useCallback(
    (gridSize: number, baseSpeedMs: number, difficulty: SnakeDifficulty) => {
      engine.configure(gridSize, baseSpeedMs, difficulty);
    },
    [engine],
  );

  return {
    state,
    stats,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    changeDirection,
    configureGame,
  };
}
