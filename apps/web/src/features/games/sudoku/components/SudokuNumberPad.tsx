'use client';

import { Eraser, Lightbulb, Pencil, Undo2 } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { DIGITS } from '../engine/sudoku-constants';
import { remainingDigitCounts } from '../engine/sudoku-validator';
import type { SudokuState } from '../types/sudoku.types';

export interface SudokuNumberPadProps {
  state: SudokuState;
  onDigit: (digit: number) => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onUndo: () => void;
  onHint: () => void;
}

const TOOL_BUTTON =
  'flex flex-col items-center justify-center gap-1 rounded-xl border border-surface-border bg-surface-raised px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-deck-600 dark:text-deck-300 transition-colors hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none touch-manipulation';

const TOOL_ICON = 'w-4 h-4';
const BTN_TYPE = 'button';

function triggerHaptic() {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(10);
  } catch {
    // Vibration is a nicety; never let it break input.
  }
}

/**
 * The primary pointer input: nine digits plus the four tools. Digits that are
 * already placed nine times fade out, so the pad doubles as a progress read.
 */
export function SudokuNumberPad({
  state,
  onDigit,
  onErase,
  onToggleNotes,
  onUndo,
  onHint,
}: SudokuNumberPadProps) {
  const remaining = remainingDigitCounts(state.cells.map((cell) => cell.value));
  const disabled = state.status !== 'playing';

  const handle = (action: () => void) => () => {
    triggerHaptic();
    action();
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5" role="group" aria-label="Number pad">
        {DIGITS.map((digit) => {
          const left = remaining[digit];
          const exhausted = left <= 0;

          return (
            <button
              key={digit}
              type={BTN_TYPE}
              disabled={disabled || exhausted}
              onClick={handle(() => onDigit(digit))}
              aria-label={
                state.noteMode
                  ? `Toggle note ${digit}, ${left} remaining`
                  : `Enter ${digit}, ${left} remaining`
              }
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl border py-2 sm:py-2.5 touch-manipulation transition-all active:scale-95',
                'border-surface-border bg-surface-raised hover:border-amber-500/60 hover:bg-amber-500/10',
                'font-display font-black text-lg sm:text-2xl text-deck-900 dark:text-white',
                state.noteMode && 'text-amber-600 dark:text-amber-300',
                (disabled || exhausted) && 'opacity-35 pointer-events-none',
              )}
            >
              <span>{digit}</span>
              <span className="text-[9px] font-mono font-medium text-deck-500 leading-none">
                {Math.max(0, left)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <button
          type={BTN_TYPE}
          disabled={disabled}
          onClick={handle(onUndo)}
          aria-label="Undo last move"
          className={TOOL_BUTTON}
        >
          <Undo2 className={TOOL_ICON} />
          <span>Undo</span>
        </button>

        <button
          type={BTN_TYPE}
          disabled={disabled}
          onClick={handle(onErase)}
          aria-label="Erase selected cell"
          className={TOOL_BUTTON}
        >
          <Eraser className={TOOL_ICON} />
          <span>Erase</span>
        </button>

        <button
          type={BTN_TYPE}
          disabled={disabled}
          onClick={handle(onToggleNotes)}
          aria-pressed={state.noteMode}
          aria-label="Toggle pencil-mark mode"
          className={cn(
            TOOL_BUTTON,
            state.noteMode && 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300',
          )}
        >
          <Pencil className={TOOL_ICON} />
          <span>Notes {state.noteMode ? 'On' : 'Off'}</span>
        </button>

        <button
          type={BTN_TYPE}
          disabled={disabled || state.hintsRemaining <= 0}
          onClick={handle(onHint)}
          aria-label={`Reveal a digit, ${state.hintsRemaining} hints left`}
          className={TOOL_BUTTON}
        >
          <Lightbulb className={TOOL_ICON} />
          <span>Hint {state.hintsRemaining}</span>
        </button>
      </div>

      <p className="hidden md:block text-center text-[10px] font-mono text-deck-500">
        1-9 place • Shift+1-9 note • N notes • U undo • H hint • P pause
      </p>
    </div>
  );
}
