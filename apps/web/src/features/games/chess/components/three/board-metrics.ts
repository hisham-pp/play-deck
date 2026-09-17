import { BOARD_SIZE } from '../../engine/chess-constants';
import type { PieceColor } from '../../types/chess.types';

/** One square is one world unit, so every other size reads as a fraction of it. */
export const SQUARE_SIZE = 1;
export const BOARD_SPAN = BOARD_SIZE * SQUARE_SIZE;
export const BOARD_HALF = BOARD_SPAN / 2;

/** Width of the decorative frame carrying the file and rank labels. */
export const FRAME_WIDTH = 0.62;
export const SQUARE_HEIGHT = 0.12;
export const SLAB_HEIGHT = 0.36;

/** Height pieces rest at, which is the top face of a square. */
export const PIECE_BASE_Y = SQUARE_HEIGHT / 2;

export type Vec2 = [number, number];

/**
 * Places a square in the world.
 *
 * Squares are indexed with a8 = 0, so column 0 is the a-file and row 0 is rank
 * 8. The a-file sits at negative x and rank 8 at negative z, which puts White's
 * home rank nearest a camera parked on the +z side.
 */
export function squareToWorld(square: number): Vec2 {
  const row = Math.floor(square / BOARD_SIZE);
  const col = square % BOARD_SIZE;
  const offset = (BOARD_SIZE - 1) / 2;

  return [(col - offset) * SQUARE_SIZE, (row - offset) * SQUARE_SIZE];
}

/** Camera framing, far enough back that the whole board and frame fit. */
export const CAMERA_HEIGHT = 9.6;
export const CAMERA_DEPTH = 8.4;
export const CAMERA_FOV = 40;
export const MIN_ZOOM = 6;
export const MAX_ZOOM = 18;

/** Width-to-height ratio below which the default framing clips the board's sides. */
const FULL_FRAME_ASPECT = 1.25;

/**
 * How much farther than the default the camera must sit so the whole board
 * stays in view. The field of view is vertical, so a tall, narrow viewport
 * (a phone, or a canvas squeezed beside the side panel) sees less width.
 */
export function framingScale(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0) return 1;
  return Math.max(1, FULL_FRAME_ASPECT / aspect);
}

/**
 * Where the camera sits for a given point of view. Flipping the board is a
 * camera move, not a re-mapping of squares, so nothing downstream of here has
 * to know which way the board is facing.
 */
export function cameraPositionFor(orientation: PieceColor): [number, number, number] {
  const side = orientation === 'w' ? 1 : -1;
  return [0, CAMERA_HEIGHT, CAMERA_DEPTH * side];
}

/** Pieces face the far side of the board, so the knights look at the enemy. */
export function pieceFacing(color: PieceColor): number {
  return color === 'w' ? 0 : Math.PI;
}
