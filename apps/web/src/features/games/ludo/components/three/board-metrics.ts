/** Shared world-space units for every Ludo board, kept free of board-specific
 *  geometry so the cross and hex layouts can both build on them. */

export const BOARD_SIZE = 15;
export const BOARD_GRID_SIZE = 15;
export const CELL_SIZE = 0.52;

/** Exact span of the 15x15 playfield in world units. */
export const BOARD_PHYSICAL_SIZE = BOARD_GRID_SIZE * CELL_SIZE;
/** A base yard covers a 6x6 block of grid cells. */
export const BASE_YARD_SIZE = 6 * CELL_SIZE;
/** The victory hub covers the middle 3x3 block. */
export const CENTER_SIZE = 3 * CELL_SIZE;

export const TAU = Math.PI * 2;

export type Vec2 = [number, number];

export function gridToWorld(col: number, row: number): Vec2 {
  const half = (BOARD_GRID_SIZE - 1) / 2;
  return [(col - half) * CELL_SIZE, (row - half) * CELL_SIZE];
}

/**
 * A mesh at world direction `angle` in the XZ plane needs rotation-y of
 * `-angle` for its local +X to point that way, because +Z runs the other way.
 */
export function yRotationForAngle(angle: number): number {
  return -angle;
}
