import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getNeighbors, toIndex } from './minesweeper-board';
import { placeMinesWithFirstClickSafety } from './minesweeper-generator';

describe('MinesweeperGenerator', () => {
  it('places the exact number of mines requested for beginner preset', () => {
    const rows = 9;
    const cols = 9;
    const mines = 10;
    const firstClick = toIndex(4, 4, cols);

    const cells = placeMinesWithFirstClickSafety(rows, cols, mines, firstClick);
    const mineCount = cells.filter((c) => c.isMine).length;

    assert.equal(mineCount, mines);
  });

  it('guarantees first-click safety: first clicked cell is never a mine', () => {
    const rows = 9;
    const cols = 9;
    const mines = 10;

    // Test across all cells on board as potential first clicks
    for (let clickIdx = 0; clickIdx < rows * cols; clickIdx += 7) {
      const cells = placeMinesWithFirstClickSafety(rows, cols, mines, clickIdx);
      assert.equal(cells[clickIdx].isMine, false);
    }
  });

  it('excludes first-click neighbors when space permits so initial click opens empty zone', () => {
    const rows = 9;
    const cols = 9;
    const mines = 10;
    const firstClick = toIndex(4, 4, cols);

    const cells = placeMinesWithFirstClickSafety(rows, cols, mines, firstClick);
    assert.equal(cells[firstClick].isMine, false);
    assert.equal(cells[firstClick].adjacentMines, 0);

    const neighbors = getNeighbors(firstClick, rows, cols);
    for (const n of neighbors) {
      assert.equal(cells[n].isMine, false);
    }
  });

  it('computes accurate adjacentMine counts for all non-mine cells', () => {
    const rows = 16;
    const cols = 16;
    const mines = 40;
    const firstClick = toIndex(0, 0, cols);

    const cells = placeMinesWithFirstClickSafety(rows, cols, mines, firstClick);

    for (let i = 0; i < cells.length; i++) {
      if (!cells[i].isMine) {
        const neighbors = getNeighbors(i, rows, cols);
        const actualMines = neighbors.filter((n) => cells[n].isMine).length;
        assert.equal(cells[i].adjacentMines, actualMines);
      }
    }
  });

  it('handles custom board configurations', () => {
    const rows = 16;
    const cols = 30;
    const mines = 99; // Expert
    const firstClick = toIndex(8, 15, cols);

    const cells = placeMinesWithFirstClickSafety(rows, cols, mines, firstClick);
    assert.equal(cells.length, 480);
    assert.equal(cells.filter((c) => c.isMine).length, 99);
    assert.equal(cells[firstClick].isMine, false);
  });
});
