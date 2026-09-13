import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CLASSIC_4_LAYOUT, EXTENDED_6_LAYOUT, globalTrackIndex } from '../../engine/board-layout';
import type { LudoPieceState } from '../../types/ludo.types';
import {
  CELL_SIZE,
  HEX_BOARD_RADIUS,
  HEX_TRACK_RADIUS,
  baseSlotPosition,
  boardExtent,
  homeStretchPosition,
  pieceCellKey,
  stackOffset,
  stackScale,
  trackCellPosition,
  type Vec2,
} from './board-geometry';

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function piece(partial: Partial<LudoPieceState>): LudoPieceState {
  return {
    id: 'red-0',
    color: 'red',
    pieceIndex: 0,
    location: 'track',
    steps: 1,
    ...partial,
  } as LudoPieceState;
}

describe('board-geometry', () => {
  describe('extended 6-arm track', () => {
    it('spaces every track cell one cell apart around the ring', () => {
      const layout = EXTENDED_6_LAYOUT;
      for (let i = 0; i < layout.trackLength; i += 1) {
        const here = trackCellPosition(layout, i);
        const next = trackCellPosition(layout, (i + 1) % layout.trackLength);
        const gap = distance(here, next);
        // Cells either continue along a side or turn a hexagon corner; both
        // steps have to stay close to one cell so the path reads as a loop.
        assert.ok(gap > CELL_SIZE * 0.7, `gap ${gap} too small at ${i}`);
        assert.ok(gap < CELL_SIZE * 1.35, `gap ${gap} too large at ${i}`);
      }
    });

    it('keeps every track cell on the hexagon perimeter', () => {
      const layout = EXTENDED_6_LAYOUT;
      for (let i = 0; i < layout.trackLength; i += 1) {
        const radius = Math.hypot(...trackCellPosition(layout, i));
        // Between the hexagon apothem and its circumradius, never outside.
        assert.ok(radius <= HEX_TRACK_RADIUS + 1e-9, `cell ${i} escaped the ring`);
        assert.ok(radius >= (HEX_TRACK_RADIUS * Math.sqrt(3)) / 2 - 1e-9, `cell ${i} fell inward`);
      }
    });

    it('gives each colour its own stretch of nine consecutive cells', () => {
      const layout = EXTENDED_6_LAYOUT;
      const entries = layout.colors.map((color) =>
        trackCellPosition(layout, globalTrackIndex(layout, color, 1)),
      );
      for (let i = 0; i < entries.length; i += 1) {
        for (let j = i + 1; j < entries.length; j += 1) {
          assert.ok(distance(entries[i], entries[j]) > CELL_SIZE, 'entry squares overlap');
        }
      }
    });

    it('walks the home stretch inward without leaving the corridor', () => {
      const layout = EXTENDED_6_LAYOUT;
      for (const color of layout.colors) {
        let previous = HEX_TRACK_RADIUS;
        for (let step = 1; step <= layout.homeStretchLength; step += 1) {
          const radius = Math.hypot(...homeStretchPosition(layout, color, step));
          assert.ok(radius < previous, `${color} stretch ${step} did not move inward`);
          previous = radius;
        }
        assert.ok(previous > 0, `${color} stretch reached the centre`);
      }
    });

    it('keeps the six base yards apart and inside the board', () => {
      const layout = EXTENDED_6_LAYOUT;
      const slots = layout.colors.flatMap((color) =>
        [0, 1, 2, 3].map((index) => baseSlotPosition(layout, color, index)),
      );

      for (let i = 0; i < slots.length; i += 1) {
        assert.ok(Math.hypot(...slots[i]) < HEX_BOARD_RADIUS, 'a base slot fell off the board');
        for (let j = i + 1; j < slots.length; j += 1) {
          assert.ok(distance(slots[i], slots[j]) > CELL_SIZE * 0.9, 'base slots overlap');
        }
      }
    });

    it('frames a bigger board than the cross board', () => {
      assert.ok(boardExtent(EXTENDED_6_LAYOUT) > boardExtent(CLASSIC_4_LAYOUT));
    });
  });

  describe('stacking', () => {
    it('gives pieces on the same track square the same cell key', () => {
      const layout = CLASSIC_4_LAYOUT;
      const first = pieceCellKey(layout, piece({ id: 'red-0', pieceIndex: 0, steps: 5 }));
      const second = pieceCellKey(layout, piece({ id: 'red-1', pieceIndex: 1, steps: 5 }));
      assert.equal(first, second);
    });

    it('keeps pieces in different base slots unstacked', () => {
      const layout = CLASSIC_4_LAYOUT;
      const first = pieceCellKey(
        layout,
        piece({ id: 'red-0', pieceIndex: 0, location: 'base', steps: 0 }),
      );
      const second = pieceCellKey(
        layout,
        piece({ id: 'red-1', pieceIndex: 1, location: 'base', steps: 0 }),
      );
      assert.notEqual(first, second);
    });

    it('shrinks pieces further as more of them share a square', () => {
      assert.equal(stackScale(1), 1);
      assert.ok(stackScale(2) < stackScale(1));
      assert.ok(stackScale(3) < stackScale(2));
      assert.ok(stackScale(4) < stackScale(3));
    });

    it('keeps a whole stack inside its own square', () => {
      for (const count of [1, 2, 3, 4]) {
        for (let index = 0; index < count; index += 1) {
          const [dx, dz] = stackOffset(index, count);
          const reach = Math.hypot(dx, dz) + stackScale(count) * CELL_SIZE * 0.42;
          assert.ok(reach < CELL_SIZE * 0.7, `stack of ${count} spills out of its cell`);
        }
      }
    });
  });
});
