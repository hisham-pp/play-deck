import type { MinesweeperCell } from '../types/minesweeper.types';
import { countAdjacentMines, createBlankCells, getNeighbors } from './minesweeper-board';

export function placeMinesWithFirstClickSafety(
  rows: number,
  cols: number,
  minesCount: number,
  firstClickIndex: number,
  random: () => number = Math.random,
): MinesweeperCell[] {
  const cells = createBlankCells(rows, cols);
  const totalCells = rows * cols;
  const clampedMines = Math.min(minesCount, totalCells - 1);

  // Determine forbidden indices for mine placement
  const forbiddenIndices = new Set<number>();
  forbiddenIndices.add(firstClickIndex);

  const neighbors = getNeighbors(firstClickIndex, rows, cols);
  // If there is enough room for mines outside the 3x3 region, exclude neighbors too
  // so the first click opens an empty (zero) cell
  if (totalCells - clampedMines >= neighbors.length + 1) {
    for (const n of neighbors) {
      forbiddenIndices.add(n);
    }
  }

  // Collect available slots
  const availableSlots: number[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (!forbiddenIndices.has(i)) {
      availableSlots.push(i);
    }
  }

  // Fallback if available slots is less than clampedMines (e.g. extreme small custom boards)
  if (availableSlots.length < clampedMines) {
    for (const n of neighbors) {
      if (availableSlots.length < clampedMines && n !== firstClickIndex) {
        availableSlots.push(n);
      }
    }
  }

  // Fisher-Yates partial shuffle to pick mine indices
  let minesPlaced = 0;
  let remainingSlots = availableSlots.length;

  while (minesPlaced < clampedMines && remainingSlots > 0) {
    const pickIndex = Math.floor(random() * remainingSlots);
    const cellIndex = availableSlots[pickIndex];

    cells[cellIndex].isMine = true;
    minesPlaced++;

    // Swap picked with last remaining
    availableSlots[pickIndex] = availableSlots[remainingSlots - 1];
    remainingSlots--;
  }

  // Calculate adjacent mine counts for all cells
  for (let i = 0; i < totalCells; i++) {
    if (!cells[i].isMine) {
      cells[i].adjacentMines = countAdjacentMines(i, cells, rows, cols);
    }
  }

  return cells;
}
