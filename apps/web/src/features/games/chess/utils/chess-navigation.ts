import { colOf, isInBounds, rowOf, squareOf } from '../engine/chess-board';
import { BOARD_SIZE } from '../engine/chess-constants';
import type { PieceColor } from '../types/chess.types';

/** A step in what the player sees: +1 right and +1 up the screen. */
export interface ScreenStep {
  dx: number;
  dy: number;
}

/**
 * Turns a step across the screen into a step across the board.
 *
 * Squares never move when the board is flipped -- the camera does -- so the
 * arrow keys are the one place that has to know which way round the player is
 * looking. Getting this wrong makes a flipped board feel broken even though
 * every square is where it should be.
 */
export function stepSquare(
  square: number,
  step: ScreenStep,
  orientation: PieceColor,
): number | null {
  // From White's side, screen-right is the next file and screen-up is the next
  // rank, which is a lower row index. Black sees both reversed.
  const facing = orientation === 'w' ? 1 : -1;

  const row = rowOf(square) - step.dy * facing;
  const col = colOf(square) + step.dx * facing;

  if (!isInBounds(row, col)) return null;
  return squareOf(row, col);
}

/** The square a player starts on when they first focus the board. */
export function homeSquare(orientation: PieceColor): number {
  // The e-file square on the near player's own back rank.
  return orientation === 'w' ? squareOf(BOARD_SIZE - 1, 4) : squareOf(0, 4);
}

export const ARROW_STEPS: Record<string, ScreenStep> = {
  ArrowUp: { dx: 0, dy: 1 },
  ArrowDown: { dx: 0, dy: -1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
};

/** Jumps to the edge of the board in a direction, for Home/End style keys. */
export function edgeSquare(square: number, step: ScreenStep, orientation: PieceColor): number {
  let current = square;
  for (let guard = 0; guard < BOARD_SIZE; guard += 1) {
    const next = stepSquare(current, step, orientation);
    if (next === null) return current;
    current = next;
  }
  return current;
}
