'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import { toAlgebraic } from '../engine/chess-board';
import { BOARD_SIZE, TOTAL_SQUARES } from '../engine/chess-constants';
import type { ChessGameState, PieceColor } from '../types/chess.types';
import { describeSquare } from '../utils/chess-labels';

export interface ChessAccessibleGridProps {
  state: ChessGameState;
  cursor: number;
  selected: number | null;
  targets: number[];
  orientation: PieceColor;
  /** Moves the cursor only; picking a piece up is a deliberate act. */
  onFocusSquare: (square: number) => void;
  /**
   * Assistive technology that activates a button by clicking it, rather than
   * by sending Enter, still has to be able to play.
   */
  onActivateSquare: (square: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/**
 * The board as a real grid of buttons, laid over the 3D canvas.
 *
 * A WebGL canvas is a single opaque element: it cannot be tabbed into, and a
 * screen reader has nothing to read out. This grid carries the semantics and
 * the keyboard while the canvas underneath carries the picture. It is
 * invisible but not hidden -- focus genuinely moves through it and the 3D
 * cursor follows, so a keyboard player can see where they are.
 *
 * The grid takes no pointer events, so mouse and touch go straight to the 3D
 * board. Enter and Space are consumed on keydown, so the click handler only
 * ever fires for a screen reader's virtual click, never twice for one press.
 */
export function ChessAccessibleGrid({
  state,
  cursor,
  selected,
  targets,
  orientation,
  onFocusSquare,
  onActivateSquare,
  onKeyDown,
}: ChessAccessibleGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Keep DOM focus on the square the cursor is on, but only once focus is
  // already inside the board -- otherwise a move would steal it from the page.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !grid.contains(document.activeElement)) return;

    grid.querySelector<HTMLButtonElement>(`[data-square="${cursor}"]`)?.focus({
      preventScroll: true,
    });
  }, [cursor]);

  const targetSet = new Set(targets);

  // Reading order follows the player's own view of the board.
  const order = Array.from({ length: TOTAL_SQUARES }, (_, index) =>
    orientation === 'w' ? index : TOTAL_SQUARES - 1 - index,
  );

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Chess board, 8 by 8. Arrow keys move, Enter picks up and places a piece."
      aria-rowcount={BOARD_SIZE}
      aria-colcount={BOARD_SIZE}
      onKeyDown={onKeyDown}
      className="absolute inset-0 z-10 grid grid-cols-8 pointer-events-none"
    >
      {order.map((square) => {
        const piece = state.position.board[square];
        const isTarget = targetSet.has(square);
        const isSelected = selected === square;

        const label = [
          describeSquare(square, piece),
          isSelected ? 'selected' : '',
          isTarget ? (piece ? 'can be captured' : 'can move here') : '',
        ]
          .filter(Boolean)
          .join(', ');

        return (
          <button
            key={square}
            type="button"
            role="gridcell"
            data-square={square}
            aria-label={label}
            aria-selected={isSelected}
            // A roving tabindex keeps the whole board to a single tab stop.
            tabIndex={square === cursor ? 0 : -1}
            onFocus={() => onFocusSquare(square)}
            onClick={() => onActivateSquare(square)}
            className="opacity-0 focus:outline-none"
          >
            {toAlgebraic(square)}
          </button>
        );
      })}
    </div>
  );
}
