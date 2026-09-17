'use client';

import { useCallback, type KeyboardEvent } from 'react';
import type { PieceColor } from '../types/chess.types';
import { ARROW_STEPS, edgeSquare, stepSquare } from '../utils/chess-navigation';

export interface UseChessKeyboardOptions {
  cursor: number;
  orientation: PieceColor;
  onMoveCursor: (square: number) => void;
  onActivate: (square: number) => void;
  onCancel: () => void;
  onFlip: () => void;
  onUndo: () => void;
}

/**
 * Keyboard play for the board grid.
 *
 * The handler is bound to the board itself rather than to the window, so the
 * arrow keys only take over once a player has actually moved focus onto the
 * board, and the rest of the page keeps its own keys.
 */
export function useChessKeyboard({
  cursor,
  orientation,
  onMoveCursor,
  onActivate,
  onCancel,
  onFlip,
  onUndo,
}: UseChessKeyboardOptions) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const step = ARROW_STEPS[event.key];

      if (step) {
        event.preventDefault();
        // Ctrl with an arrow runs to the edge, the way a spreadsheet does.
        const next = event.ctrlKey
          ? edgeSquare(cursor, step, orientation)
          : stepSquare(cursor, step, orientation);
        if (next !== null) onMoveCursor(next);
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate(cursor);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      // Single-letter shortcuts, but never while a modifier is held, so they
      // cannot swallow browser or screen-reader commands.
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const key = event.key.toLowerCase();
      if (key === 'f') {
        event.preventDefault();
        onFlip();
      } else if (key === 'u') {
        event.preventDefault();
        onUndo();
      }
    },
    [cursor, orientation, onMoveCursor, onActivate, onCancel, onFlip, onUndo],
  );
}
