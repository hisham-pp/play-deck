import type { ColorThiefTile } from '../types/color-thief.types';

export interface GridSize {
  columns: number;
  rows: number;
}

export function toIndex(column: number, row: number, columns: number): number {
  return row * columns + column;
}

export function toColumn(index: number, columns: number): number {
  return index % columns;
}

export function toRow(index: number, columns: number): number {
  return Math.floor(index / columns);
}

export function isOnGrid(index: number, { columns, rows }: GridSize): boolean {
  return Number.isInteger(index) && index >= 0 && index < columns * rows;
}

/**
 * Orthogonal neighbours only. Diagonals are deliberately excluded: territory
 * that only touches at a corner should still count as isolated, which is what
 * makes the cheap-adjacent / expensive-isolated split in `territory.ts` bite.
 */
export function neighborsOf(index: number, { columns, rows }: GridSize): number[] {
  const column = toColumn(index, columns);
  const row = toRow(index, columns);
  const found: number[] = [];

  if (row > 0) found.push(index - columns);
  if (row < rows - 1) found.push(index + columns);
  if (column > 0) found.push(index - 1);
  if (column < columns - 1) found.push(index + 1);

  return found.sort((a, b) => a - b);
}

export function createBoard({ columns, rows }: GridSize): ColorThiefTile[] {
  return Array.from({ length: columns * rows }, (_, index) => ({
    index,
    owner: null,
    frozenUntilRound: 0,
    claimedAtAction: 0,
  }));
}

export function isFrozen(tile: ColorThiefTile, round: number): boolean {
  return tile.frozenUntilRound > round;
}

/** Tiles a seat holds and can actually use — frozen paint counts for nothing. */
export function activeTilesOf(
  board: ColorThiefTile[],
  seatIndex: number,
  round: number,
): ColorThiefTile[] {
  return board.filter((tile) => tile.owner === seatIndex && !isFrozen(tile, round));
}

/**
 * Size of the largest orthogonally connected blob a seat holds. Used to break
 * ties on equal tile counts: a solid wall beats the same paint scattered.
 */
export function largestRegionOf(
  board: ColorThiefTile[],
  seatIndex: number,
  size: GridSize,
  round: number,
): number {
  const owned = new Set(activeTilesOf(board, seatIndex, round).map((tile) => tile.index));
  const seen = new Set<number>();
  let best = 0;

  for (const start of owned) {
    if (seen.has(start)) continue;

    let regionSize = 0;
    const stack = [start];
    seen.add(start);

    while (stack.length > 0) {
      const current = stack.pop()!;
      regionSize++;
      for (const neighbor of neighborsOf(current, size)) {
        if (!owned.has(neighbor) || seen.has(neighbor)) continue;
        seen.add(neighbor);
        stack.push(neighbor);
      }
    }
    best = Math.max(best, regionSize);
  }

  return best;
}
