import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  CLASSIC_4_LAYOUT,
  EXTENDED_6_LAYOUT,
  assignSeatsToArms,
  colorForSeat,
  finishSteps,
  globalTrackIndex,
  homeStretchIndex,
  isFinishedSteps,
  isHomeStretchSteps,
  isSafeCell,
  isTrackSteps,
  resolveLayout,
} from './board-layout';

describe('Ludo Board Layout Tests', () => {
  describe('1. Layout resolution by player count', () => {
    it('uses the classic 4-arm layout for 2, 3, and 4 players', () => {
      assert.strictEqual(resolveLayout(2).id, 'classic4');
      assert.strictEqual(resolveLayout(3).id, 'classic4');
      assert.strictEqual(resolveLayout(4).id, 'classic4');
    });

    it('uses the extended 6-arm layout for 5 and 6 players', () => {
      assert.strictEqual(resolveLayout(5).id, 'extended6');
      assert.strictEqual(resolveLayout(6).id, 'extended6');
    });

    it('classic layout has 52 track cells, extended has 54', () => {
      assert.strictEqual(CLASSIC_4_LAYOUT.trackLength, 52);
      assert.strictEqual(EXTENDED_6_LAYOUT.trackLength, 54);
    });
  });

  describe('2. Seat-to-arm assignment', () => {
    it('places 2 players on opposite arms for symmetry', () => {
      assert.deepStrictEqual(assignSeatsToArms(2), [0, 2]);
    });

    it('places 3 and 4 players on sequential arms', () => {
      assert.deepStrictEqual(assignSeatsToArms(3), [0, 1, 2]);
      assert.deepStrictEqual(assignSeatsToArms(4), [0, 1, 2, 3]);
    });

    it('places up to 6 players sequentially on the extended layout', () => {
      assert.deepStrictEqual(assignSeatsToArms(6), [0, 1, 2, 3, 4, 5]);
      assert.deepStrictEqual(assignSeatsToArms(5), [0, 1, 2, 3, 4]);
    });

    it('assigns distinct colors per seat', () => {
      for (const seatCount of [2, 3, 4, 5, 6]) {
        const colors = Array.from({ length: seatCount }, (_, i) => colorForSeat(i, seatCount));
        assert.strictEqual(new Set(colors).size, seatCount, `seatCount=${seatCount}`);
      }
    });
  });

  describe('3. Track index math', () => {
    it('computes the entry square as globalTrackIndex(color, 1) === entryOffset', () => {
      const layout = CLASSIC_4_LAYOUT;
      layout.colors.forEach((color, i) => {
        assert.strictEqual(globalTrackIndex(layout, color, 1), layout.entryOffsets[i]);
      });
    });

    it('wraps around the track using modulo arithmetic', () => {
      const layout = CLASSIC_4_LAYOUT;
      // blue enters at 39; stepping 20 further should wrap past 52
      const idx = globalTrackIndex(layout, 'blue', 20);
      assert.strictEqual(idx, (39 + 20 - 1) % 52);
    });

    it('classifies steps into track / home-stretch / finished buckets', () => {
      const layout = CLASSIC_4_LAYOUT;
      assert.strictEqual(isTrackSteps(layout, 1), true);
      assert.strictEqual(isTrackSteps(layout, 52), true);
      assert.strictEqual(isTrackSteps(layout, 53), false);

      assert.strictEqual(isHomeStretchSteps(layout, 53), true);
      assert.strictEqual(isHomeStretchSteps(layout, 58), true);
      assert.strictEqual(isHomeStretchSteps(layout, 59), false);

      assert.strictEqual(finishSteps(layout), 59);
      assert.strictEqual(isFinishedSteps(layout, 59), true);
      assert.strictEqual(homeStretchIndex(layout, 53), 1);
      assert.strictEqual(homeStretchIndex(layout, 58), 6);
    });
  });

  describe('4. Safe cells', () => {
    it('marks each color entry square and its star offset as safe', () => {
      const layout = CLASSIC_4_LAYOUT;
      for (const offset of layout.entryOffsets) {
        assert.strictEqual(isSafeCell(layout, offset), true);
        assert.strictEqual(isSafeCell(layout, (offset + 8) % layout.trackLength), true);
      }
    });

    it('does not mark arbitrary non-safe cells as safe', () => {
      const layout = CLASSIC_4_LAYOUT;
      assert.strictEqual(isSafeCell(layout, 3), false);
    });
  });
});
