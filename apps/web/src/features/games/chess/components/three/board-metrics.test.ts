import assert from 'node:assert';
import { describe, it } from 'node:test';
import { fromAlgebraic } from '../../engine/chess-board';
import { BOARD_HALF, cameraPositionFor, squareToWorld } from './board-metrics';

function at(name: string): [number, number] {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return squareToWorld(index);
}

describe('3D board metrics', () => {
  describe('square placement', () => {
    it('puts the a-file at negative x and the h-file at positive x', () => {
      assert.strictEqual(at('a1')[0], -3.5);
      assert.strictEqual(at('h1')[0], 3.5);
    });

    it('puts rank 8 at negative z and rank 1 at positive z', () => {
      assert.strictEqual(at('a8')[1], -3.5);
      assert.strictEqual(at('a1')[1], 3.5);
    });

    it('keeps every square inside the board', () => {
      for (let square = 0; square < 64; square += 1) {
        const [x, z] = squareToWorld(square);
        assert.ok(Math.abs(x) <= BOARD_HALF, `x of square ${square} is on the board`);
        assert.ok(Math.abs(z) <= BOARD_HALF, `z of square ${square} is on the board`);
      }
    });

    it('gives all 64 squares a distinct position', () => {
      const seen = new Set(
        Array.from({ length: 64 }, (_, square) => squareToWorld(square).join(',')),
      );
      assert.strictEqual(seen.size, 64);
    });

    it('spaces neighbouring squares exactly one unit apart', () => {
      assert.strictEqual(at('b1')[0] - at('a1')[0], 1);
      assert.strictEqual(at('a2')[1] - at('a1')[1], -1);
    });
  });

  describe('board orientation', () => {
    it('parks the camera behind White for White’s point of view', () => {
      const [, , z] = cameraPositionFor('w');
      assert.ok(z > 0, 'the camera sits on the same side as rank 1');
    });

    it('mirrors the camera for Black', () => {
      const white = cameraPositionFor('w');
      const black = cameraPositionFor('b');

      assert.strictEqual(black[2], -white[2]);
      assert.strictEqual(black[1], white[1], 'both views look down from the same height');
    });
  });
});
