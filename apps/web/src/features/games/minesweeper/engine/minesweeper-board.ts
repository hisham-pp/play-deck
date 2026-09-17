import type { CellPosition, MinesweeperCell } from '../types/minesweeper.types';

const NEIGHBOR_OFFSETS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

export function toIndex(row: number, col: number, cols: number): number {
  return row * cols + col;
}

export function toRowCol(index: number, cols: number): CellPosition {
  return {
    row: Math.floor(index / cols),
    col: index % cols,
  };
}

export function isValidPosition(row: number, col: number, rows: number, cols: number): boolean {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

export function getNeighbors(index: number, rows: number, cols: number): number[] {
  const { row, col } = toRowCol(index, cols);
  const neighbors: number[] = [];

  for (let i = 0; i < NEIGHBOR_OFFSETS.length; i++) {
    const [dRow, dCol] = NEIGHBOR_OFFSETS[i];
    const nRow = row + dRow;
    const nCol = col + dCol;
    if (isValidPosition(nRow, nCol, rows, cols)) {
      neighbors.push(toIndex(nRow, nCol, cols));
    }
  }

  return neighbors;
}

export function createBlankCells(rows: number, cols: number): MinesweeperCell[] {
  const total = rows * cols;
  const cells: MinesweeperCell[] = new Array(total);

  for (let index = 0; index < total; index++) {
    const { row, col } = toRowCol(index, cols);
    cells[index] = {
      id: index,
      row,
      col,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    };
  }

  return cells;
}

export function countAdjacentMines(
  index: number,
  cells: readonly MinesweeperCell[],
  rows: number,
  cols: number,
): number {
  const neighbors = getNeighbors(index, rows, cols);
  let count = 0;
  for (let i = 0; i < neighbors.length; i++) {
    if (cells[neighbors[i]].isMine) {
      count++;
    }
  }
  return count;
}
