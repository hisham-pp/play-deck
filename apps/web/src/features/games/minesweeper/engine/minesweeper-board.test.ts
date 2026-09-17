import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  countAdjacentMines,
  createBlankCells,
  getNeighbors,
  isValidPosition,
  toIndex,
  toRowCol,
} from './minesweeper-board';

describe('MinesweeperBoard Math', () => {
  it('converts row and col to index correctly', () => {
    assert.equal(toIndex(0, 0, 9), 0);
    assert.equal(toIndex(0, 8, 9), 8);
    assert.equal(toIndex(1, 0, 9), 9);
    assert.equal(toIndex(8, 8, 9), 80);
    assert.equal(toIndex(2, 5, 10), 25);
  });

  it('converts index back to row and col correctly', () => {
    assert.deepEqual(toRowCol(0, 9), { row: 0, col: 0 });
    assert.deepEqual(toRowCol(8, 9), { row: 0, col: 8 });
    assert.deepEqual(toRowCol(9, 9), { row: 1, col: 0 });
    assert.deepEqual(toRowCol(80, 9), { row: 8, col: 8 });
    assert.deepEqual(toRowCol(25, 10), { row: 2, col: 5 });
  });

  it('validates board boundaries', () => {
    assert.equal(isValidPosition(0, 0, 9, 9), true);
    assert.equal(isValidPosition(8, 8, 9, 9), true);
    assert.equal(isValidPosition(-1, 0, 9, 9), false);
    assert.equal(isValidPosition(0, -1, 9, 9), false);
    assert.equal(isValidPosition(9, 0, 9, 9), false);
    assert.equal(isValidPosition(0, 9, 9, 9), false);
  });

  it('returns exactly 3 neighbors for a corner cell', () => {
    const topLeft = getNeighbors(toIndex(0, 0, 9), 9, 9);
    assert.equal(topLeft.length, 3);
    assert.ok(topLeft.includes(toIndex(0, 1, 9)));
    assert.ok(topLeft.includes(toIndex(1, 0, 9)));
    assert.ok(topLeft.includes(toIndex(1, 1, 9)));

    const bottomRight = getNeighbors(toIndex(8, 8, 9), 9, 9);
    assert.equal(bottomRight.length, 3);
    assert.ok(bottomRight.includes(toIndex(7, 7, 9)));
    assert.ok(bottomRight.includes(toIndex(7, 8, 9)));
    assert.ok(bottomRight.includes(toIndex(8, 7, 9)));
  });

  it('returns exactly 5 neighbors for an edge cell', () => {
    const topEdge = getNeighbors(toIndex(0, 4, 9), 9, 9);
    assert.equal(topEdge.length, 5);
  });

  it('returns exactly 8 neighbors for an interior cell', () => {
    const center = getNeighbors(toIndex(4, 4, 9), 9, 9);
    assert.equal(center.length, 8);
  });

  it('creates blank cells with proper initialization', () => {
    const cells = createBlankCells(9, 9);
    assert.equal(cells.length, 81);
    for (let i = 0; i < cells.length; i++) {
      assert.equal(cells[i].id, i);
      assert.equal(cells[i].isMine, false);
      assert.equal(cells[i].isRevealed, false);
      assert.equal(cells[i].isFlagged, false);
      assert.equal(cells[i].adjacentMines, 0);
    }
  });

  it('correctly counts adjacent mines around a cell', () => {
    const cells = createBlankCells(3, 3);
    // Place mines at (0, 0) and (0, 1)
    cells[toIndex(0, 0, 3)].isMine = true;
    cells[toIndex(0, 1, 3)].isMine = true;

    // Center cell (1, 1) should have 2 adjacent mines
    const count = countAdjacentMines(toIndex(1, 1, 3), cells, 3, 3);
    assert.equal(count, 2);

    // Bottom right cell (2, 2) has 0 mines adjacent
    const countBr = countAdjacentMines(toIndex(2, 2, 3), cells, 3, 3);
    assert.equal(countBr, 0);
  });
});
