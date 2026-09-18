import { squareToCoord } from '../engine/board-layout';
import { BOARD_COLUMNS, BOARD_ROWS } from '../engine/snake-ladder-constants';

/** Board-space point in a 0..100 square, matching the SVG overlay's viewBox. */
export interface BoardPoint {
  x: number;
  y: number;
}

export const BOARD_VIEWBOX = 100;

export const CELL_WIDTH = BOARD_VIEWBOX / BOARD_COLUMNS;
export const CELL_HEIGHT = BOARD_VIEWBOX / BOARD_ROWS;

/** Centre of a square, in the same 0..100 space the overlay draws in. */
export function squareCenter(square: number): BoardPoint {
  const { row, column } = squareToCoord(square);
  return {
    x: (column + 0.5) * CELL_WIDTH,
    y: (row + 0.5) * CELL_HEIGHT,
  };
}

/**
 * Nudges tokens sharing a square onto their own spot, so four seats on one
 * cell stay individually visible and clickable rather than stacking up.
 */
export function tokenOffset(indexOnSquare: number, countOnSquare: number): BoardPoint {
  if (countOnSquare <= 1) return { x: 0, y: 0 };

  const spread = CELL_WIDTH * 0.22;
  const corners: BoardPoint[] = [
    { x: -spread, y: -spread },
    { x: spread, y: -spread },
    { x: -spread, y: spread },
    { x: spread, y: spread },
  ];
  return corners[indexOnSquare % corners.length];
}
