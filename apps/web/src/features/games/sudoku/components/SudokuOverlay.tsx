'use client';

import { Grid3x3, Pause, PartyPopper, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { getDifficultyConfig } from '../engine/sudoku-constants';
import type { SudokuDifficulty, SudokuState, SudokuStats } from '../types/sudoku.types';
import { formatBestTime, formatDuration } from '../utils/format-duration';
import { SudokuDifficultyPicker } from './SudokuDifficultyPicker';

export interface SudokuOverlayProps {
  state: SudokuState;
  stats: SudokuStats | null;
  /** True while the player is browsing levels mid-run. */
  levelMenuOpen: boolean;
  onNewPuzzle: (difficulty?: SudokuDifficulty) => void;
  onOpenLevelMenu: () => void;
  onCloseLevelMenu: () => void;
  onReset: () => void;
  onResume: () => void;
}

const PANEL =
  'absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-xl md:rounded-2xl bg-surface-base/95 backdrop-blur-sm p-4 sm:p-6 text-center overflow-y-auto';
const TITLE = 'font-display font-black text-xl sm:text-2xl text-deck-900 dark:text-white';
const SUBTITLE = 'text-xs sm:text-sm text-deck-600 dark:text-deck-400 max-w-sm';
const BTN_TYPE = 'button';

function LevelPanel({
  state,
  stats,
  onNewPuzzle,
  onCancel,
}: Pick<SudokuOverlayProps, 'state' | 'stats' | 'onNewPuzzle'> & { onCancel?: () => void }) {
  return (
    <div className={PANEL}>
      <div className="flex flex-col items-center gap-1.5">
        <Grid3x3 className="w-7 h-7 text-amber-500" />
        <h2 className={TITLE}>Pick your grid</h2>
        <p className={SUBTITLE}>
          Seven levels, from a gentle Starter to a near-minimal Insane. Every puzzle is generated
          fresh with exactly one solution.
        </p>
      </div>

      <div className="w-full max-w-lg">
        <SudokuDifficultyPicker
          activeDifficulty={state.difficulty}
          stats={stats}
          onPick={onNewPuzzle}
        />
      </div>

      {onCancel && (
        <Button type={BTN_TYPE} variant="ghost" onClick={onCancel}>
          Keep playing this one
        </Button>
      )}
    </div>
  );
}

function PausedPanel({ state, onResume }: Pick<SudokuOverlayProps, 'state' | 'onResume'>) {
  return (
    <div className={PANEL}>
      <Pause className="w-7 h-7 text-amber-500" />
      <h2 className={TITLE}>Paused</h2>
      <p className={SUBTITLE}>
        The clock is stopped at {formatDuration(state.elapsedMs)} and the grid is hidden.
      </p>
      <Button type={BTN_TYPE} variant="primary" onClick={onResume} className="min-w-[160px]">
        Resume (P)
      </Button>
    </div>
  );
}

function CompletedPanel({
  state,
  onNewPuzzle,
  onOpenLevelMenu,
}: Pick<SudokuOverlayProps, 'state' | 'onNewPuzzle' | 'onOpenLevelMenu'>) {
  const config = getDifficultyConfig(state.difficulty);

  return (
    <div className={PANEL}>
      <PartyPopper className="w-8 h-8 text-amber-500" />
      <h2 className={TITLE}>Solved</h2>

      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-deck-500 font-semibold">
            Your time
          </span>
          <span className="font-mono font-black text-2xl text-amber-500">
            {formatDuration(state.elapsedMs)}
          </span>
        </div>
        <div className="w-px h-10 bg-surface-border" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-deck-500 font-semibold">
            {config.label} best
          </span>
          <span className="font-mono font-bold text-2xl text-deck-900 dark:text-white">
            {formatBestTime(state.bestTimeMs)}
          </span>
        </div>
      </div>

      {state.isNewBestTime && (
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-500">
          <Sparkles className="w-4 h-4" />
          New personal best
        </p>
      )}

      <p className={SUBTITLE}>
        {state.mistakes === 0
          ? 'A flawless grid — not a single wrong digit.'
          : `${state.mistakes} mistake${state.mistakes === 1 ? '' : 's'} along the way.`}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type={BTN_TYPE} variant="primary" onClick={() => onNewPuzzle()}>
          Another {config.label}
        </Button>
        <Button type={BTN_TYPE} variant="outline" onClick={onOpenLevelMenu}>
          Change level
        </Button>
      </div>
    </div>
  );
}

function FailedPanel({
  state,
  onNewPuzzle,
  onReset,
}: Pick<SudokuOverlayProps, 'state' | 'onNewPuzzle' | 'onReset'>) {
  return (
    <div className={PANEL}>
      <XCircle className="w-8 h-8 text-rose-500" />
      <h2 className={TITLE}>Out of lives</h2>
      <p className={SUBTITLE}>
        {state.maxMistakes} mistake{state.maxMistakes === 1 ? '' : 's'} was the budget on{' '}
        {getDifficultyConfig(state.difficulty).label}. The grid held out at{' '}
        {formatDuration(state.elapsedMs)}.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type={BTN_TYPE} variant="primary" onClick={onReset} className="gap-1.5">
          <RotateCcw className="w-4 h-4" />
          Retry this grid
        </Button>
        <Button type={BTN_TYPE} variant="outline" onClick={() => onNewPuzzle()}>
          New puzzle
        </Button>
      </div>
    </div>
  );
}

/** Renders whichever panel the current status calls for, or nothing while playing. */
export function SudokuOverlay({
  state,
  stats,
  levelMenuOpen,
  onNewPuzzle,
  onOpenLevelMenu,
  onCloseLevelMenu,
  onReset,
  onResume,
}: SudokuOverlayProps) {
  if (levelMenuOpen || state.status === 'idle') {
    return (
      <LevelPanel
        state={state}
        stats={stats}
        onNewPuzzle={onNewPuzzle}
        onCancel={
          state.status === 'paused' || state.status === 'playing' ? onCloseLevelMenu : undefined
        }
      />
    );
  }

  switch (state.status) {
    case 'paused':
      return <PausedPanel state={state} onResume={onResume} />;
    case 'completed':
      return (
        <CompletedPanel state={state} onNewPuzzle={onNewPuzzle} onOpenLevelMenu={onOpenLevelMenu} />
      );
    case 'failed':
      return <FailedPanel state={state} onNewPuzzle={onNewPuzzle} onReset={onReset} />;
    default:
      return null;
  }
}
