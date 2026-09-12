'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TetrisEngine } from '../engine/tetris-engine';
import { tetrisStatsRepository } from '../services/tetris-stats-repository';
import type { TetrisState, TetrisStats } from '../types/tetris.types';
import { lineClearSfx, useAutoPause, useCountdown, useGravityLoop } from './use-tetris-lifecycle';
import { useTetrisSound } from './use-tetris-sound';

export function useTetrisEngine(
  onGameOverCallback?: (score: number, linesCleared: number) => void,
) {
  const engineRef = useRef<TetrisEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new TetrisEngine(0);
  }
  const engine = engineRef.current;
  const { play } = useTetrisSound();

  const [state, setState] = useState<TetrisState>(() => engine.getState());
  const [stats, setStats] = useState<TetrisStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    tetrisStatsRepository.getStats().then((loaded) => {
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
  const prevLevelRef = useRef(state.level);
  const prevClearedLinesRef = useRef(state.lastClearedLines);
  const prevStatusForResetRef = useRef(state.status);

  useEffect(() => {
    if (prevStatusRef.current !== 'game-over' && state.status === 'game-over') {
      play('game-over');
      tetrisStatsRepository
        .saveScore(state.score, state.linesCleared)
        .then(({ stats: s }) => setStats(s));
      onGameOverCallback?.(state.score, state.linesCleared);
    }
    prevStatusRef.current = state.status;
  }, [state.status, state.score, state.linesCleared, onGameOverCallback, play]);

  useEffect(() => {
    if (state.status === 'countdown' && prevStatusForResetRef.current !== 'countdown') {
      // A fresh run just started (START/RESTART) — resync refs without firing lock/clear sfx.
      prevClearedLinesRef.current = state.lastClearedLines;
    }
    prevStatusForResetRef.current = state.status;
  }, [state.status, state.lastClearedLines]);

  useEffect(() => {
    if (state.lastClearedLines !== prevClearedLinesRef.current) {
      if (state.lastClearedLines.length > 0) {
        play(lineClearSfx(state.lastClearedLines.length));
      } else {
        play('lock');
      }
      prevClearedLinesRef.current = state.lastClearedLines;
    }
  }, [state.lastClearedLines, play]);

  useEffect(() => {
    if (state.level > prevLevelRef.current) {
      play('level-up');
    }
    prevLevelRef.current = state.level;
  }, [state.level, play]);

  useAutoPause(engine);
  useCountdown(state.status, engine);
  useGravityLoop(state.status, engine);

  const startGame = useCallback(() => {
    play('start');
    engine.start();
  }, [engine, play]);
  const pauseGame = useCallback(() => {
    play('pause');
    engine.pause();
  }, [engine, play]);
  const resumeGame = useCallback(() => engine.resume(), [engine]);
  const restartGame = useCallback(() => {
    play('start');
    engine.restart();
  }, [engine, play]);
  const moveLeft = useCallback(() => {
    engine.moveLeft();
    play('move');
  }, [engine, play]);
  const moveRight = useCallback(() => {
    engine.moveRight();
    play('move');
  }, [engine, play]);
  const softDrop = useCallback(() => {
    engine.softDrop();
    play('soft-drop');
  }, [engine, play]);
  const hardDrop = useCallback(() => {
    engine.hardDrop();
    play('hard-drop');
  }, [engine, play]);
  const rotateCW = useCallback(() => {
    engine.rotateClockwise();
    play('rotate');
  }, [engine, play]);
  const rotateCCW = useCallback(() => {
    engine.rotateCounterClockwise();
    play('rotate');
  }, [engine, play]);
  const holdPiece = useCallback(() => {
    engine.hold();
    play('hold');
  }, [engine, play]);

  return {
    state,
    stats,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotateCW,
    rotateCCW,
    holdPiece,
  };
}
