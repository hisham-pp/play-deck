'use client';

import { Grid3x3, Pause, Play, RotateCcw, Trophy, XCircle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getDifficultyConfig } from '../engine/sudoku-constants';
import type { SudokuState } from '../types/sudoku.types';
import { formatBestTime, formatDuration } from '../utils/format-duration';

export interface SudokuOverlayProps {
  state: SudokuState;
  onOpenSetup: () => void;
  onNewPuzzle: () => void;
  onReset: () => void;
  onResume: () => void;
}

const PANEL =
  'absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl md:rounded-2xl bg-surface-base/90 backdrop-blur-sm p-6 text-center';
const ICON_TILE =
  'w-14 h-14 rounded-2xl bg-surface-raised border border-surface-border flex items-center justify-center mb-3 shadow-lg';
const TITLE = 'text-xl sm:text-2xl font-black font-display text-deck-950 dark:text-white mb-1';
const SUBTITLE =
  'text-xs sm:text-sm text-deck-600 dark:text-deck-400 max-w-xs mb-5 leading-relaxed';
const ACTIONS = 'flex flex-col gap-2 w-full max-w-xs';
const ICON_SM = 'w-4 h-4';
const FULL_BTN = 'w-full gap-2';
const VARIANT_PRIMARY = 'primary' as const;

function IdlePanel({ onOpenSetup }: Pick<SudokuOverlayProps, 'onOpenSetup'>) {
  return (
    <div className={PANEL}>
      <div className={ICON_TILE}>
        <Grid3x3 className="w-7 h-7 text-amber-500" />
      </div>
      <h3 className={TITLE}>Sudoku</h3>
      <p className={SUBTITLE}>
        Seven levels of freshly generated grids, each with exactly one solution. Pick a level to
        deal your first puzzle.
      </p>

      <div className={ACTIONS}>
        <Button onClick={onOpenSetup} variant={VARIANT_PRIMARY} size="lg" className={FULL_BTN}>
          <Play className={`${ICON_SM} fill-current`} />
          <span>Choose a Level</span>
        </Button>
      </div>
    </div>
  );
}

function PausedPanel({ state, onResume }: Pick<SudokuOverlayProps, 'state' | 'onResume'>) {
  return (
    <div className={PANEL} role="dialog" aria-modal="true" aria-label="Paused">
      <div className={ICON_TILE}>
        <Pause className="w-7 h-7 text-amber-500" />
      </div>
      <h3 className={TITLE}>Paused</h3>
      <p className={SUBTITLE}>
        The clock is stopped at {formatDuration(state.elapsedMs)} and the grid is hidden.
      </p>

      <div className={ACTIONS}>
        <Button onClick={onResume} variant={VARIANT_PRIMARY} size="lg" className={FULL_BTN}>
          <Play className={`${ICON_SM} fill-current`} />
          <span>Resume (P)</span>
        </Button>
      </div>
    </div>
  );
}

function CompletedPanel({
  state,
  onNewPuzzle,
  onOpenSetup,
}: Pick<SudokuOverlayProps, 'state' | 'onNewPuzzle' | 'onOpenSetup'>) {
  const config = getDifficultyConfig(state.difficulty);

  return (
    <div className={PANEL} role="dialog" aria-modal="true" aria-label="Puzzle solved">
      <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">
        {config.label} Cleared
      </span>
      <h3 className="text-2xl font-black font-display text-deck-950 dark:text-white mb-3">
        SOLVED
      </h3>

      <div className="p-4 rounded-xl border border-surface-border bg-surface-raised w-full max-w-xs mb-3 flex items-center justify-around">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-deck-400 uppercase">Your Time</span>
          <span className="text-2xl font-mono font-black text-amber-500">
            {formatDuration(state.elapsedMs)}
          </span>
        </div>
        <div className="h-8 w-px bg-surface-border" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-deck-400 uppercase">Best</span>
          <span className="text-2xl font-mono font-black text-deck-700 dark:text-deck-200">
            {formatBestTime(state.bestTimeMs)}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-deck-500 font-mono mb-4">
        {state.mistakes === 0
          ? 'Flawless — not a single wrong digit'
          : `${state.mistakes} mistake${state.mistakes === 1 ? '' : 's'} along the way`}
      </p>

      {state.isNewBestTime && (
        <div className="mb-4">
          <Badge variant="warning" className="gap-1 px-3 py-1 text-xs">
            <Trophy className="w-3 h-3" />
            <span>New Personal Best!</span>
          </Badge>
        </div>
      )}

      <div className={ACTIONS}>
        <Button onClick={onNewPuzzle} variant={VARIANT_PRIMARY} size="lg" className={FULL_BTN}>
          <RotateCcw className={ICON_SM} />
          <span>Another {config.label}</span>
        </Button>
        <Button onClick={onOpenSetup} variant="outline" size="md" className={FULL_BTN}>
          <Grid3x3 className={ICON_SM} />
          <span>Change Level</span>
        </Button>
      </div>
    </div>
  );
}

function FailedPanel({
  state,
  onReset,
  onOpenSetup,
}: Pick<SudokuOverlayProps, 'state' | 'onReset' | 'onOpenSetup'>) {
  const config = getDifficultyConfig(state.difficulty);

  return (
    <div className={PANEL} role="dialog" aria-modal="true" aria-label="Out of lives">
      <div className={ICON_TILE}>
        <XCircle className="w-7 h-7 text-rose-500" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1">
        Out of Lives
      </span>
      <h3 className={TITLE}>GRID LOST</h3>
      <p className={SUBTITLE}>
        {config.label} allows {state.maxMistakes} mistake{state.maxMistakes === 1 ? '' : 's'}. You
        held out for {formatDuration(state.elapsedMs)}.
      </p>

      <div className={ACTIONS}>
        <Button onClick={onReset} variant={VARIANT_PRIMARY} size="lg" className={FULL_BTN}>
          <RotateCcw className={ICON_SM} />
          <span>Retry This Grid</span>
        </Button>
        <Button onClick={onOpenSetup} variant="outline" size="md" className={FULL_BTN}>
          <Grid3x3 className={ICON_SM} />
          <span>New Puzzle</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Compact in-board states only. Choosing a difficulty lives in the setup modal,
 * so nothing here ever has to scroll inside the board's square.
 */
export function SudokuOverlay({
  state,
  onOpenSetup,
  onNewPuzzle,
  onReset,
  onResume,
}: SudokuOverlayProps) {
  switch (state.status) {
    case 'idle':
      return <IdlePanel onOpenSetup={onOpenSetup} />;
    case 'paused':
      return <PausedPanel state={state} onResume={onResume} />;
    case 'completed':
      return <CompletedPanel state={state} onNewPuzzle={onNewPuzzle} onOpenSetup={onOpenSetup} />;
    case 'failed':
      return <FailedPanel state={state} onReset={onReset} onOpenSetup={onOpenSetup} />;
    default:
      return null;
  }
}
