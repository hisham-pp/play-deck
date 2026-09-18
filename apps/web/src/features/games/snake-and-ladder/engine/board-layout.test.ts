import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { coordToSquare, jumpAt, listSquares, squareToCoord } from './board-layout';
import { BOARD_COLUMNS, BOARD_ROWS, FINAL_SQUARE, LADDERS, SNAKES } from './snake-ladder-constants';

describe('Snake & Ladder board layout', () => {
  it('places 1 bottom-left and 100 top-left', () => {
    assert.deepEqual(squareToCoord(1), { row: BOARD_ROWS - 1, column: 0 });
    assert.deepEqual(squareToCoord(FINAL_SQUARE), { row: 0, column: 0 });
  });

  it('reverses direction on every row', () => {
    // 10 ends the bottom row on the right, 11 sits directly above it.
    assert.deepEqual(squareToCoord(10), { row: BOARD_ROWS - 1, column: BOARD_COLUMNS - 1 });
    assert.deepEqual(squareToCoord(11), { row: BOARD_ROWS - 2, column: BOARD_COLUMNS - 1 });
    assert.deepEqual(squareToCoord(20), { row: BOARD_ROWS - 2, column: 0 });
    assert.deepEqual(squareToCoord(21), { row: BOARD_ROWS - 3, column: 0 });
  });

  it('round-trips every square through its coordinate', () => {
    for (const square of listSquares()) {
      assert.equal(coordToSquare(squareToCoord(square)), square);
    }
  });

  it('rejects squares off the board', () => {
    assert.throws(() => squareToCoord(0), RangeError);
    assert.throws(() => squareToCoord(FINAL_SQUARE + 1), RangeError);
  });
});

describe('Snake & Ladder jump table', () => {
  it('always climbs a ladder and always slides a snake', () => {
    for (const [from, to] of Object.entries(LADDERS)) {
      assert.ok(to > Number(from), `ladder ${from} must go up, not to ${to}`);
    }
    for (const [from, to] of Object.entries(SNAKES)) {
      assert.ok(to < Number(from), `snake ${from} must go down, not to ${to}`);
    }
  });

  it('never puts two jumps on one square', () => {
    const heads = [...Object.keys(LADDERS), ...Object.keys(SNAKES)].map(Number);
    assert.equal(new Set(heads).size, heads.length, 'a square owns at most one jump');
  });

  it('never chains one jump straight into another', () => {
    // A landing square that is itself a jump head would move the token twice
    // in a single turn, which the reducer deliberately does not do.
    const heads = new Set([...Object.keys(LADDERS), ...Object.keys(SNAKES)].map(Number));
    for (const to of [...Object.values(LADDERS), ...Object.values(SNAKES)]) {
      assert.ok(!heads.has(to), `jump lands on ${to}, which starts another jump`);
    }
  });

  it('keeps square 100 free of jumps and reachable only by landing', () => {
    assert.equal(jumpAt(FINAL_SQUARE), null);
  });

  it('reports the jump starting on a square', () => {
    assert.deepEqual(jumpAt(1), { kind: 'ladder', from: 1, to: 38 });
    assert.deepEqual(jumpAt(16), { kind: 'snake', from: 16, to: 6 });
    assert.equal(jumpAt(2), null);
  });
});
