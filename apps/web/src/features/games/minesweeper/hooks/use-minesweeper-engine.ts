'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_DIFFICULTY,
  STATUS_LOST,
  STATUS_PLAYING,
  STATUS_WON,
} from '../engine/minesweeper-constants';
import { MinesweeperEngine } from '../engine/minesweeper-engine';
import { minesweeperSound } from '../services/minesweeper-sound.service';
import { minesweeperStatsRepository } from '../services/minesweeper-stats-repository';
import type {
  BoardDimensions,
  MinesweeperDifficulty,
  MinesweeperGameStatus,
  MinesweeperState,
  MinesweeperStats,
} from '../types/minesweeper.types';

export interface UseMinesweeperEngineOptions {
  onWin?: (difficulty: MinesweeperDifficulty, elapsedMs: number, isNewBest: boolean) => void;
  onLose?: (difficulty: MinesweeperDifficulty) => void;
}

function useMinesweeperTimer(status: MinesweeperGameStatus, engine: MinesweeperEngine) {
  useEffect(() => {
    if (status !== STATUS_PLAYING) return;
    const interval = setInterval(() => {
      engine.tick(1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [status, engine]);
}

function useMinesweeperSettlement(
  state: MinesweeperState,
  onWin:
    | ((difficulty: MinesweeperDifficulty, elapsedMs: number, isNewBest: boolean) => void)
    | undefined,
  onLose: ((difficulty: MinesweeperDifficulty) => void) | undefined,
  setStats: React.Dispatch<React.SetStateAction<MinesweeperStats | null>>,
) {
  const previousStatusRef = useRef(state.status);

  useEffect(() => {
    const prev = previousStatusRef.current;
    previousStatusRef.current = state.status;
    if (prev === state.status) return;

    if (state.status === STATUS_WON) {
      minesweeperSound.playVictory();
      minesweeperStatsRepository
        .recordCompletion(state.difficulty, state.elapsedMs)
        .then(({ isNewBestTime, stats: updated }) => {
          setStats(updated);
          onWin?.(state.difficulty, state.elapsedMs, isNewBestTime);
        });
    } else if (state.status === STATUS_LOST) {
      minesweeperSound.playExplosion();
      minesweeperStatsRepository.recordLoss(state.difficulty).then((updated) => {
        setStats(updated);
        onLose?.(state.difficulty);
      });
    }
  }, [state.status, state.difficulty, state.elapsedMs, onWin, onLose, setStats]);
}

export function useMinesweeperEngine({ onWin, onLose }: UseMinesweeperEngineOptions = {}) {
  const engineRef = useRef<MinesweeperEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new MinesweeperEngine(DEFAULT_DIFFICULTY);
  }
  const engine = engineRef.current;

  const [state, setState] = useState<MinesweeperState>(() => engine.getState());
  const [stats, setStats] = useState<MinesweeperStats | null>(null);

  useEffect(() => engine.subscribe(setState), [engine]);
  useEffect(() => () => engine.destroy(), [engine]);

  // Load stats on mount
  useEffect(() => {
    let active = true;
    minesweeperStatsRepository.getStats().then((loaded) => {
      if (!active) return;
      setStats(loaded);
      const currentDiff = engine.getState().difficulty;
      engine.setBestTime(loaded.byDifficulty[currentDiff]?.bestTimeMs ?? null);
    });
    return () => {
      active = false;
    };
  }, [engine]);

  useMinesweeperSettlement(state, onWin, onLose, setStats);
  useMinesweeperTimer(state.status, engine);

  const revealCell = useCallback(
    (index: number) => {
      const cell = state.cells[index];
      if (cell.isRevealed || cell.isFlagged) return;

      engine.revealCell(index);
      if (state.firstClick) {
        minesweeperStatsRepository.recordStart(state.difficulty).then(setStats);
      }
      minesweeperSound.playReveal();
    },
    [engine, state.cells, state.difficulty, state.firstClick],
  );

  const toggleFlag = useCallback(
    (index: number) => {
      const cell = state.cells[index];
      if (cell.isRevealed) return;

      const wasFlagged = cell.isFlagged;
      engine.toggleFlag(index);
      if (wasFlagged) {
        minesweeperSound.playUnflag();
      } else {
        minesweeperSound.playFlag();
      }
    },
    [engine, state.cells],
  );

  const chordCell = useCallback(
    (index: number) => {
      engine.chordCell(index);
      minesweeperSound.playChord();
    },
    [engine],
  );

  const newGame = useCallback(
    (difficulty?: MinesweeperDifficulty, customConfig?: BoardDimensions) => {
      const targetDiff = difficulty ?? engine.getState().difficulty;
      engine.newGame(targetDiff, customConfig);
      if (stats) {
        engine.setBestTime(stats.byDifficulty[targetDiff]?.bestTimeMs ?? null);
      }
    },
    [engine, stats],
  );

  const controls = useMemo(
    () => ({
      revealCell,
      toggleFlag,
      chordCell,
      selectCell: (index: number) => engine.selectCell(index),
      moveSelection: (rowDelta: number, colDelta: number) =>
        engine.moveSelection(rowDelta, colDelta),
      newGame,
      resetGame: () => engine.reset(),
    }),
    [revealCell, toggleFlag, chordCell, newGame, engine],
  );

  return { state, stats, controls };
}

export type MinesweeperControls = ReturnType<typeof useMinesweeperEngine>['controls'];
