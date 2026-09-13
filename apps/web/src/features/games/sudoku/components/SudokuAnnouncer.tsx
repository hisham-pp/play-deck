'use client';

import React from 'react';
import type { SudokuState } from '../types/sudoku.types';
import { describeDuration } from '../utils/format-duration';

/**
 * Politely narrates the moments that matter to a screen-reader player. Routine
 * placements stay silent — the cell's own label already carries them.
 */
function announcementFor(state: SudokuState): string {
  if (state.status === 'completed') {
    return `Puzzle solved in ${describeDuration(state.elapsedMs)} with ${state.mistakes} mistake${
      state.mistakes === 1 ? '' : 's'
    }.`;
  }
  if (state.status === 'failed') {
    return 'Out of lives. The run is over.';
  }
  if (state.status === 'paused') {
    return 'Puzzle paused.';
  }

  const event = state.lastEvent;
  if (!event) return '';

  switch (event.type) {
    case 'mistake':
      return `${event.digit} is wrong. ${state.mistakes} of ${state.maxMistakes} mistakes used.`;
    case 'hint':
      return `Hint revealed ${event.digit}. ${state.hintsRemaining} hints left.`;
    case 'locked':
      return 'That cell is a given and cannot change.';
    case 'undo':
      return 'Move undone.';
    default:
      return '';
  }
}

export function SudokuAnnouncer({ state }: { state: SudokuState }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {announcementFor(state)}
    </p>
  );
}
