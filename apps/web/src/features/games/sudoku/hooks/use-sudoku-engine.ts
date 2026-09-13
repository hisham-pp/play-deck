'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_DIFFICULTY } from '../engine/sudoku-constants';
import { SudokuEngine } from '../engine/sudoku-engine';
import { sudokuStatsRepository } from '../services/sudoku-stats-repository';
import type { SudokuDifficulty, SudokuState, SudokuStats } from '../types/sudoku.types';
import { useSudokuAutoPause, useSudokuTimer } from './use-sudoku-timer';

export interface UseSudokuEngineOptions {
  onCompleted?: (difficulty: SudokuDifficulty, elapsedMs: number, isNewBestTime: boolean) => void;
  onFailed?: (difficulty: SudokuDifficulty) => void;
}

/**
 * Binds the pure engine to React: subscription, the clock, and best-time
 * persistence. All rules stay in the engine; this hook only wires it up.
 */
export function useSudokuEngine({ onCompleted, onFailed }: UseSudokuEngineOptions = {}) {
  const engineRef = useRef<SudokuEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SudokuEngine(DEFAULT_DIFFICULTY);
  }
  const engine = engineRef.current;

  const [state, setState] = useState<SudokuState>(() => engine.getState());
  const [stats, setStats] = useState<SudokuStats | null>(null);

  useEffect(() => engine.subscribe(setState), [engine]);
  useEffect(() => () => engine.destroy(), [engine]);

  useEffect(() => {
    let active = true;
    sudokuStatsRepository.getStats().then((loaded) => {
      if (!active) return;
      setStats(loaded);
      engine.setBestTime(loaded.bestTimes[engine.getState().difficulty] ?? null);
    });
    return () => {
      active = false;
    };
  }, [engine]);

  // Persist the finished run exactly once, when the status first flips.
  const settledStatusRef = useRef(state.status);
  useEffect(() => {
    const previous = settledStatusRef.current;
    settledStatusRef.current = state.status;
    if (previous === state.status) return;

    if (state.status === 'completed') {
      sudokuStatsRepository
        .recordCompletion(state.difficulty, state.elapsedMs)
        .then(({ isNewBestTime, stats: updated }) => {
          setStats(updated);
          onCompleted?.(state.difficulty, state.elapsedMs, isNewBestTime);
        });
    }

    if (state.status === 'failed') {
      onFailed?.(state.difficulty);
    }
  }, [state.status, state.difficulty, state.elapsedMs, onCompleted, onFailed]);

  useSudokuTimer(state.status, engine);
  useSudokuAutoPause(engine);

  const newPuzzle = useCallback(
    (difficulty?: SudokuDifficulty) => {
      const target = difficulty ?? engine.getState().difficulty;
      engine.newPuzzle(target);
      engine.setBestTime(stats?.bestTimes[target] ?? null);
      sudokuStatsRepository.recordStart(target).then(setStats);
    },
    [engine, stats],
  );

  const controls = useMemo(
    () => ({
      newPuzzle,
      reset: () => engine.reset(),
      selectCell: (index: number) => engine.selectCell(index),
      moveSelection: (rowDelta: number, colDelta: number) =>
        engine.moveSelection(rowDelta, colDelta),
      setDigit: (digit: number) => engine.setDigit(digit),
      toggleCandidate: (digit: number) => engine.toggleCandidate(digit),
      clearCell: () => engine.clearCell(),
      toggleNoteMode: () => engine.toggleNoteMode(),
      autoFillCandidates: () => engine.autoFillCandidates(),
      undo: () => engine.undo(),
      hint: () => engine.hint(),
      pause: () => engine.pause(),
      resume: () => engine.resume(),
    }),
    [engine, newPuzzle],
  );

  return { state, stats, controls };
}

export type SudokuControls = ReturnType<typeof useSudokuEngine>['controls'];
