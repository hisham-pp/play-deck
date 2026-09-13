import assert from 'node:assert';
import { describe, it } from 'node:test';
import { CELL_COUNT, GRID_SIZE } from './sudoku-constants';
import { generateSolvedGrid } from './sudoku-generator';
import {
  PEERS,
  UNITS,
  boxOf,
  colOf,
  createEmptyValues,
  isOnBoard,
  isValidPlacement,
  rowOf,
  shuffle,
  toIndex,
} from './sudoku-grid';
import { createSeededRandom } from './sudoku-random';
import { findConflicts, isSolved, remainingDigitCounts } from './sudoku-validator';

describe('sudoku grid coordinates', () => {
  it('maps indices to rows, columns and boxes', () => {
    assert.strictEqual(rowOf(0), 0);
    assert.strictEqual(colOf(0), 0);
    assert.strictEqual(boxOf(0), 0);

    assert.strictEqual(rowOf(80), 8);
    assert.strictEqual(colOf(80), 8);
    assert.strictEqual(boxOf(80), 8);

    // Row 4, column 7 sits in the middle-right box (index 5).
    assert.strictEqual(boxOf(toIndex(4, 7)), 5);
  });

  it('round-trips index and coordinates', () => {
    for (let index = 0; index < CELL_COUNT; index++) {
      assert.strictEqual(toIndex(rowOf(index), colOf(index)), index);
    }
  });

  it('rejects coordinates outside the board', () => {
    assert.ok(isOnBoard(0, 0));
    assert.ok(isOnBoard(8, 8));
    assert.ok(!isOnBoard(-1, 0));
    assert.ok(!isOnBoard(0, 9));
  });
});

describe('units and peers', () => {
  it('builds 27 units of 9 cells', () => {
    assert.strictEqual(UNITS.length, 27);
    for (const unit of UNITS) assert.strictEqual(unit.length, GRID_SIZE);
  });

  it('gives every cell exactly 20 peers, never itself', () => {
    for (let index = 0; index < CELL_COUNT; index++) {
      assert.strictEqual(PEERS[index].length, 20);
      assert.ok(!PEERS[index].includes(index));
    }
  });

  it('treats peership as symmetric', () => {
    for (let index = 0; index < CELL_COUNT; index++) {
      for (const peer of PEERS[index]) {
        assert.ok(PEERS[peer].includes(index), `${peer} should see ${index}`);
      }
    }
  });
});

describe('placement validity', () => {
  it('blocks digits already present in a row, column or box', () => {
    const values = createEmptyValues();
    values[toIndex(0, 0)] = 5;

    assert.ok(!isValidPlacement(values, toIndex(0, 5), 5), 'same row');
    assert.ok(!isValidPlacement(values, toIndex(5, 0), 5), 'same column');
    assert.ok(!isValidPlacement(values, toIndex(1, 1), 5), 'same box');
    assert.ok(isValidPlacement(values, toIndex(4, 4), 5), 'unrelated cell');
  });

  it('always allows clearing a cell', () => {
    const values = createEmptyValues();
    values[0] = 9;
    assert.ok(isValidPlacement(values, 1, 0));
  });
});

describe('conflict and completion detection', () => {
  it('reports both members of a duplicate pair', () => {
    const values = createEmptyValues();
    values[toIndex(2, 2)] = 7;
    values[toIndex(2, 6)] = 7;

    assert.deepStrictEqual(findConflicts(values), [toIndex(2, 2), toIndex(2, 6)]);
  });

  it('finds no conflicts on an empty or valid board', () => {
    assert.deepStrictEqual(findConflicts(createEmptyValues()), []);
    assert.deepStrictEqual(findConflicts(generateSolvedGrid(createSeededRandom(7))), []);
  });

  it('only calls a full, conflict-free board solved', () => {
    const solved = generateSolvedGrid(createSeededRandom(11));
    assert.ok(isSolved(solved));

    const incomplete = solved.slice();
    incomplete[40] = 0;
    assert.ok(!isSolved(incomplete));

    const broken = solved.slice();
    broken[0] = broken[0] === 9 ? 8 : 9;
    assert.ok(!isSolved(broken));
  });

  it('counts remaining copies of each digit', () => {
    const values = createEmptyValues();
    assert.strictEqual(remainingDigitCounts(values)[3], 9);

    values[0] = 3;
    values[20] = 3;
    assert.strictEqual(remainingDigitCounts(values)[3], 7);
    assert.strictEqual(remainingDigitCounts(values)[4], 9);
  });
});

describe('shuffle', () => {
  it('preserves membership and leaves the source untouched', () => {
    const source = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = shuffle(source, createSeededRandom(3));

    assert.deepStrictEqual(source, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepStrictEqual(
      [...shuffled].sort((a, b) => a - b),
      source,
    );
  });
});
