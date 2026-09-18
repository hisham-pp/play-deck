import type { SnakeLadderJump } from '../types/snake-and-ladder.types';
import { BOARD_COLUMNS, BOARD_ROWS, FINAL_SQUARE, LADDERS, SNAKES } from './snake-ladder-constants';

/** Grid position of a square, with (0,0) at the board's top-left cell. */
export interface SquareCoord {
  row: number;
  column: number;
}

export function isValidSquare(square: number): boolean {
  return Number.isInteger(square) && square >= 1 && square <= FINAL_SQUARE;
}

/**
 * Squares snake (boustrophedon) up the board: 1 sits bottom-left, 10 is
 * bottom-right, 11 sits directly above 10, and 100 lands top-left.
 */
export function squareToCoord(square: number): SquareCoord {
  if (!isValidSquare(square)) {
    throw new RangeError(`square ${square} is outside 1..${FINAL_SQUARE}`);
  }

  const index = square - 1;
  const rowFromBottom = Math.floor(index / BOARD_COLUMNS);
  const offset = index % BOARD_COLUMNS;
  const column = rowFromBottom % 2 === 0 ? offset : BOARD_COLUMNS - 1 - offset;

  return { row: BOARD_ROWS - 1 - rowFromBottom, column };
}

export function coordToSquare({ row, column }: SquareCoord): number {
  const rowFromBottom = BOARD_ROWS - 1 - row;
  const offset = rowFromBottom % 2 === 0 ? column : BOARD_COLUMNS - 1 - column;
  return rowFromBottom * BOARD_COLUMNS + offset + 1;
}

/** Every square in play order, 1..100. Handy for rendering the grid once. */
export function listSquares(): number[] {
  return Array.from({ length: FINAL_SQUARE }, (_, index) => index + 1);
}

/** The snake or ladder starting on `square`, or null when it is a plain cell. */
export function jumpAt(square: number): SnakeLadderJump | null {
  const ladderTo = LADDERS[square];
  if (ladderTo !== undefined) return { kind: 'ladder', from: square, to: ladderTo };

  const snakeTo = SNAKES[square];
  if (snakeTo !== undefined) return { kind: 'snake', from: square, to: snakeTo };

  return null;
}
