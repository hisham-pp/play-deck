import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FINAL_SQUARE } from '../engine/snake-ladder-constants';
import { BOARD_VIEWBOX, squareCenter, tokenOffset } from './board-geometry';

describe('board geometry', () => {
  it('keeps every square centre inside the board box', () => {
    for (let square = 1; square <= FINAL_SQUARE; square++) {
      const { x, y } = squareCenter(square);
      assert.ok(x > 0 && x < BOARD_VIEWBOX, `square ${square} x=${x} is off the board`);
      assert.ok(y > 0 && y < BOARD_VIEWBOX, `square ${square} y=${y} is off the board`);
    }
  });

  it('puts square 1 bottom-left and square 100 top-left', () => {
    assert.deepEqual(squareCenter(1), { x: 5, y: 95 });
    assert.deepEqual(squareCenter(FINAL_SQUARE), { x: 5, y: 5 });
  });

  it('gives every seat sharing a square its own offset', () => {
    const offsets = [0, 1, 2, 3].map((index) => tokenOffset(index, 4));
    const unique = new Set(offsets.map(({ x, y }) => `${x},${y}`));
    assert.equal(unique.size, 4);
  });

  it('leaves a lone token centred', () => {
    assert.deepEqual(tokenOffset(0, 1), { x: 0, y: 0 });
  });
});
