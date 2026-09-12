import type { GridCoordinate, TetrominoType } from '../types/tetris.types';

/**
 * Only single-step CW/CCW transitions are ever requested (rotation always
 * moves ±1 mod 4), so the key space is these 8 pairs rather than all 16.
 */
export type KickKey = '0->1' | '1->0' | '1->2' | '2->1' | '2->3' | '3->2' | '3->0' | '0->3';

/** Converts (dx, dy) pairs in guideline convention (dy positive = up) into grid offsets. */
function toKicks(...pairs: Array<[number, number]>): GridCoordinate[] {
  return pairs.map(([dx, dy]) => ({ row: -dy, col: dx }));
}

const JLSTZ_KICKS: Record<KickKey, GridCoordinate[]> = {
  '0->1': toKicks([0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]),
  '1->0': toKicks([0, 0], [1, 0], [1, -1], [0, 2], [1, 2]),
  '1->2': toKicks([0, 0], [1, 0], [1, -1], [0, 2], [1, 2]),
  '2->1': toKicks([0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]),
  '2->3': toKicks([0, 0], [1, 0], [1, 1], [0, -2], [1, -2]),
  '3->2': toKicks([0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]),
  '3->0': toKicks([0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]),
  '0->3': toKicks([0, 0], [1, 0], [1, 1], [0, -2], [1, -2]),
};

const I_KICKS: Record<KickKey, GridCoordinate[]> = {
  '0->1': toKicks([0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]),
  '1->0': toKicks([0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]),
  '1->2': toKicks([0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]),
  '2->1': toKicks([0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]),
  '2->3': toKicks([0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]),
  '3->2': toKicks([0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]),
  '3->0': toKicks([0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]),
  '0->3': toKicks([0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]),
};

const NO_KICK: Record<KickKey, GridCoordinate[]> = {
  '0->1': toKicks([0, 0]),
  '1->0': toKicks([0, 0]),
  '1->2': toKicks([0, 0]),
  '2->1': toKicks([0, 0]),
  '2->3': toKicks([0, 0]),
  '3->2': toKicks([0, 0]),
  '3->0': toKicks([0, 0]),
  '0->3': toKicks([0, 0]),
};

export function getKickTable(type: TetrominoType): Record<KickKey, GridCoordinate[]> {
  if (type === 'I') return I_KICKS;
  if (type === 'O') return NO_KICK;
  return JLSTZ_KICKS;
}
