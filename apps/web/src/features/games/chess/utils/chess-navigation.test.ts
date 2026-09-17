import assert from 'node:assert';
import { describe, it } from 'node:test';
import { fromAlgebraic, toAlgebraic } from '../engine/chess-board';
import { ARROW_STEPS, edgeSquare, homeSquare, stepSquare } from './chess-navigation';

function square(name: string): number {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return index;
}

/** Presses an arrow key from a named square and reports where focus lands. */
function press(from: string, key: string, orientation: 'w' | 'b'): string | null {
  const next = stepSquare(square(from), ARROW_STEPS[key], orientation);
  return next === null ? null : toAlgebraic(next);
}

describe('Board navigation', () => {
  describe('from White’s side', () => {
    it('moves up the board towards rank 8', () => {
      assert.strictEqual(press('e4', 'ArrowUp', 'w'), 'e5');
      assert.strictEqual(press('e4', 'ArrowDown', 'w'), 'e3');
    });

    it('moves right towards the h-file', () => {
      assert.strictEqual(press('e4', 'ArrowRight', 'w'), 'f4');
      assert.strictEqual(press('e4', 'ArrowLeft', 'w'), 'd4');
    });

    it('stops at the edges rather than wrapping', () => {
      assert.strictEqual(press('a1', 'ArrowLeft', 'w'), null);
      assert.strictEqual(press('a1', 'ArrowDown', 'w'), null);
      assert.strictEqual(press('h8', 'ArrowRight', 'w'), null);
      assert.strictEqual(press('h8', 'ArrowUp', 'w'), null);
    });
  });

  describe('from Black’s side', () => {
    it('follows what the player sees, not the board’s own axes', () => {
      // Black looks from the other end, so screen-up runs towards rank 1.
      assert.strictEqual(press('e4', 'ArrowUp', 'b'), 'e3');
      assert.strictEqual(press('e4', 'ArrowDown', 'b'), 'e5');
      assert.strictEqual(press('e4', 'ArrowRight', 'b'), 'd4');
      assert.strictEqual(press('e4', 'ArrowLeft', 'b'), 'f4');
    });

    it('stops at the edges nearest the player', () => {
      assert.strictEqual(press('h1', 'ArrowLeft', 'b'), null);
      assert.strictEqual(press('h1', 'ArrowUp', 'b'), null);
      assert.strictEqual(press('a8', 'ArrowRight', 'b'), null);
      assert.strictEqual(press('a8', 'ArrowDown', 'b'), null);
    });
  });

  describe('round trips', () => {
    it('returns to the start after opposite steps, whichever way round', () => {
      for (const orientation of ['w', 'b'] as const) {
        for (const [key, opposite] of [
          ['ArrowUp', 'ArrowDown'],
          ['ArrowLeft', 'ArrowRight'],
        ]) {
          const there = stepSquare(square('d5'), ARROW_STEPS[key], orientation);
          assert.ok(there !== null);
          const back = stepSquare(there, ARROW_STEPS[opposite], orientation);
          assert.strictEqual(back, square('d5'));
        }
      }
    });

    it('reaches every square from a corner', () => {
      const seen = new Set<number>();
      for (let row = 0; row < 8; row += 1) {
        let current: number | null = stepSquare(square('a8'), { dx: 0, dy: -row }, 'w');
        while (current !== null) {
          seen.add(current);
          current = stepSquare(current, ARROW_STEPS.ArrowRight, 'w');
        }
      }
      assert.strictEqual(seen.size, 64);
    });
  });

  describe('edges and starting square', () => {
    it('runs to the far edge in one jump', () => {
      assert.strictEqual(toAlgebraic(edgeSquare(square('d4'), ARROW_STEPS.ArrowRight, 'w')), 'h4');
      assert.strictEqual(toAlgebraic(edgeSquare(square('d4'), ARROW_STEPS.ArrowUp, 'w')), 'd8');
      assert.strictEqual(toAlgebraic(edgeSquare(square('d4'), ARROW_STEPS.ArrowUp, 'b')), 'd1');
    });

    it('starts each player on their own king’s square', () => {
      assert.strictEqual(toAlgebraic(homeSquare('w')), 'e1');
      assert.strictEqual(toAlgebraic(homeSquare('b')), 'e8');
    });
  });
});
