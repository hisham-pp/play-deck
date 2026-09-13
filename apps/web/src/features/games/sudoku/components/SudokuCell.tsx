'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DIGITS, EMPTY_CELL, GRID_SIZE } from '../engine/sudoku-constants';
import { colOf, rowOf } from '../engine/sudoku-grid';
import type { SudokuCellState } from '../types/sudoku.types';

export interface SudokuCellProps {
  index: number;
  cell: SudokuCellState;
  isSelected: boolean;
  /** Shares a row, column or box with the selected cell. */
  isPeer: boolean;
  /** Holds the same digit as the selected cell. */
  isSameDigit: boolean;
  isConflict: boolean;
  isError: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}

function describeCell(cell: SudokuCellState, row: number, col: number): string {
  const position = `Row ${row + 1}, column ${col + 1}`;
  if (cell.value !== EMPTY_CELL) {
    return `${position}, ${cell.value}${cell.given ? ', given' : ''}`;
  }
  if (cell.candidates.length > 0) {
    return `${position}, empty, notes ${cell.candidates.join(', ')}`;
  }
  return `${position}, empty`;
}

/** Heavier rules mark the 3x3 box edges; hairlines separate cells inside them. */
function boxBorderClasses(row: number, col: number): string {
  return cn(
    'border-r border-b border-surface-border',
    col % 3 === 2 && col !== GRID_SIZE - 1 && 'border-r-2 border-r-deck-400/70',
    row % 3 === 2 && row !== GRID_SIZE - 1 && 'border-b-2 border-b-deck-400/70',
    col === GRID_SIZE - 1 && 'border-r-0',
    row === GRID_SIZE - 1 && 'border-b-0',
  );
}

function CandidateGrid({ candidates }: { candidates: number[] }) {
  return (
    <span
      aria-hidden="true"
      className="grid grid-cols-3 grid-rows-3 w-full h-full p-[2px] leading-none text-[7px] sm:text-[9px] md:text-[10px] font-mono text-deck-500 dark:text-deck-400"
    >
      {DIGITS.map((digit) => (
        <span key={digit} className="flex items-center justify-center">
          {candidates.includes(digit) ? digit : ''}
        </span>
      ))}
    </span>
  );
}

export function SudokuCell({
  index,
  cell,
  isSelected,
  isPeer,
  isSameDigit,
  isConflict,
  isError,
  disabled,
  onSelect,
}: SudokuCellProps) {
  const row = rowOf(index);
  const col = colOf(index);
  const isFlagged = isConflict || isError;

  return (
    <button
      type="button"
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
      aria-selected={isSelected}
      aria-readonly={cell.given || undefined}
      aria-invalid={isFlagged || undefined}
      aria-label={describeCell(cell, row, col)}
      data-cell-index={index}
      disabled={disabled}
      onClick={() => onSelect(index)}
      className={cn(
        'relative aspect-square w-full flex items-center justify-center select-none touch-manipulation',
        'font-display font-bold text-base sm:text-xl md:text-2xl transition-colors duration-100',
        'focus:outline-none focus-visible:z-10',
        boxBorderClasses(row, col),
        // Base surface, then progressively stronger highlight states.
        'bg-surface-raised text-deck-900 dark:text-deck-100',
        isPeer && !isSelected && 'bg-amber-500/[0.07] dark:bg-amber-400/[0.06]',
        isSameDigit && !isSelected && 'bg-amber-500/20 dark:bg-amber-400/15',
        isSelected && 'bg-amber-500/30 dark:bg-amber-400/25',
        // Givens read as printed ink; player entries are the warm accent.
        cell.given
          ? 'text-deck-900 dark:text-white'
          : 'text-amber-600 dark:text-amber-300 font-black',
        isFlagged && 'text-rose-600 dark:text-rose-400',
        isConflict && 'bg-rose-500/15 dark:bg-rose-500/20',
        isSelected && isFlagged && 'bg-rose-500/30',
        !disabled && !cell.given && 'cursor-pointer hover:bg-amber-500/15',
        disabled && 'cursor-default',
      )}
    >
      {cell.value !== EMPTY_CELL ? (
        <span>{cell.value}</span>
      ) : (
        <CandidateGrid candidates={cell.candidates} />
      )}

      {isSelected && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-amber-500 dark:ring-amber-400"
        />
      )}
    </button>
  );
}
