import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { activeTilesOf, createBoard, largestRegionOf, neighborsOf, toIndex } from './grid';

const SIZE = { columns: 4, rows: 4 };

describe('Color Thief grid', () => {
  it('gives a middle tile four orthogonal neighbours', () => {
    assert.deepEqual(neighborsOf(toIndex(1, 1, 4), SIZE), [1, 4, 6, 9]);
  });

  it('clips neighbours at the corners and edges', () => {
    assert.deepEqual(neighborsOf(0, SIZE), [1, 4]);
    assert.deepEqual(neighborsOf(15, SIZE), [11, 14]);
    assert.deepEqual(neighborsOf(3, SIZE), [2, 7]);
  });

  it('never treats a diagonal as adjacent', () => {
    assert.ok(!neighborsOf(5, SIZE).includes(0));
    assert.ok(!neighborsOf(5, SIZE).includes(10));
  });

  it('starts every tile neutral and unfrozen', () => {
    const board = createBoard(SIZE);
    assert.equal(board.length, 16);
    assert.ok(board.every((tile) => tile.owner === null && tile.frozenUntilRound === 0));
  });

  it('counts only thawed tiles as active territory', () => {
    const board = createBoard(SIZE).map((tile) =>
      tile.index < 3 ? { ...tile, owner: 0, frozenUntilRound: tile.index === 2 ? 5 : 0 } : tile,
    );
    assert.equal(activeTilesOf(board, 0, 1).length, 2);
    assert.equal(activeTilesOf(board, 0, 6).length, 3);
  });

  it('measures the largest connected blob, not the total', () => {
    // 0-1 joined, 15 stranded in the far corner.
    const board = createBoard(SIZE).map((tile) =>
      [0, 1, 15].includes(tile.index) ? { ...tile, owner: 0 } : tile,
    );
    assert.equal(largestRegionOf(board, 0, SIZE, 1), 2);
  });

  it('ignores frozen tiles when measuring a blob', () => {
    const board = createBoard(SIZE).map((tile) =>
      [0, 1, 2].includes(tile.index)
        ? { ...tile, owner: 0, frozenUntilRound: tile.index === 1 ? 5 : 0 }
        : tile,
    );
    // Freezing the middle tile splits one run of three into two singletons.
    assert.equal(largestRegionOf(board, 0, SIZE, 1), 1);
  });
});
