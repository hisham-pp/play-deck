'use client';

import React, { useEffect, useRef } from 'react';
import { EMPTY_CELL, GRID_SIZE } from '../engine/sudoku-constants';
import { boxOf, colOf, rowOf } from '../engine/sudoku-grid';
import type { SudokuState } from '../types/sudoku.types';
import { SudokuCell } from './SudokuCell';

export interface SudokuBoardProps {
  state: SudokuState;
  /** Hides digits while paused so the clock cannot be cheated. */
  concealed: boolean;
  onSelect: (index: number) => void;
}

function sharesUnit(a: number, b: number): boolean {
  return rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b);
}

export function SudokuBoard({ state, concealed, onSelect }: SudokuBoardProps) {
  const { cells, selectedIndex, conflicts, errors, status } = state;
  const boardRef = useRef<HTMLDivElement>(null);

  // Keep DOM focus on the selected cell so keyboard play and screen-reader
  // focus stay in step, but only while focus already lives inside the board.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || !board.contains(document.activeElement)) return;

    const target = board.querySelector<HTMLButtonElement>(`[data-cell-index="${selectedIndex}"]`);
    target?.focus({ preventScroll: true });
  }, [selectedIndex]);

  const selectedValue = cells[selectedIndex]?.value ?? EMPTY_CELL;
  const conflictSet = new Set(conflicts);
  const errorSet = new Set(errors);
  const interactive = status === 'playing';

  return (
    <div
      ref={boardRef}
      role="grid"
      aria-label="Sudoku board, 9 by 9"
      aria-rowcount={GRID_SIZE}
      aria-colcount={GRID_SIZE}
      className="grid grid-cols-9 w-full aspect-square overflow-hidden rounded-xl md:rounded-2xl border-2 border-deck-400/70 dark:border-deck-600 bg-surface-raised shadow-arcade"
    >
      {Array.from({ length: GRID_SIZE }, (_, row) => (
        <div key={row} role="row" className="contents">
          {Array.from({ length: GRID_SIZE }, (_, col) => {
            const index = row * GRID_SIZE + col;
            const cell = cells[index];
            const displayed = concealed
              ? { ...cell, value: cell.given ? cell.value : EMPTY_CELL, candidates: [] }
              : cell;

            return (
              <SudokuCell
                key={index}
                index={index}
                cell={displayed}
                isSelected={index === selectedIndex}
                isPeer={index !== selectedIndex && sharesUnit(index, selectedIndex)}
                isSameDigit={
                  !concealed &&
                  selectedValue !== EMPTY_CELL &&
                  cell.value === selectedValue &&
                  index !== selectedIndex
                }
                isConflict={!concealed && conflictSet.has(index)}
                isError={!concealed && errorSet.has(index)}
                disabled={!interactive}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
