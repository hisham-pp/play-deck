import assert from 'node:assert';
import { describe, it } from 'node:test';
import { CLASSIC_4_LAYOUT } from './board-layout';
import { applyCaptureIfAny } from './capture';
import { createInitialLudoState } from './ludo-state';
import type { LudoPieceState, LudoPlayer } from '../types/ludo.types';

function makePlayers(): LudoPlayer[] {
  const colors: LudoPlayer['color'][] = ['red', 'green', 'yellow', 'blue'];
  return colors.map((color, i) => ({
    id: `player-${i}`,
    displayName: `Player ${i}`,
    type: 'human' as const,
    color,
    seatIndex: i,
    status: 'ready' as const,
    ready: true,
  }));
}

function withPieceAt(state: ReturnType<typeof createInitialLudoState>, pieceId: string, steps: number) {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      pieces: p.pieces.map((piece) =>
        piece.id === pieceId ? { ...piece, location: 'track' as const, steps } : piece,
      ),
    })),
  };
}

describe('Ludo Capture Tests', () => {
  describe('1. Capture on a non-safe cell', () => {
    it('sends a single opponent piece back to base', () => {
      // red entry offset 0, green entry offset 13. Green piece at steps=1 sits on
      // global index 13. Red piece reaching global index 13 needs steps such that
      // (0 + steps - 1) % 52 === 13 -> steps = 14 (not a safe cell: 13 is green's
      // own entry, safe only for green's stack check is irrelevant here — entry
      // squares are safe for everyone in this simplified model, so use a non-safe
      // mid-arm cell instead: global index 5, red steps = 6).
      let state = createInitialLudoState(makePlayers());
      state = withPieceAt(state, 'green-0', 45); // green at (13+45-1)%52 = 5
      state = withPieceAt(state, 'red-0', 6); // red at (0+6-1)%52 = 5

      const movedPiece = state.players[0].pieces[0] as LudoPieceState;
      const result = applyCaptureIfAny(state, CLASSIC_4_LAYOUT, movedPiece);

      assert.deepStrictEqual(result.capturedPieceIds, ['green-0']);
      const greenPiece = result.state.players[1].pieces[0];
      assert.strictEqual(greenPiece.location, 'base');
      assert.strictEqual(greenPiece.steps, 0);
    });
  });

  describe('2. Safe cells never trigger a capture', () => {
    it('does not capture a piece sitting on a safe cell', () => {
      let state = createInitialLudoState(makePlayers());
      // Green's own entry square (global index 13) is safe.
      state = withPieceAt(state, 'green-0', 1);
      state = withPieceAt(state, 'red-0', 14); // (0+14-1)%52 = 13

      const movedPiece = state.players[0].pieces[0];
      const result = applyCaptureIfAny(state, CLASSIC_4_LAYOUT, movedPiece);
      assert.deepStrictEqual(result.capturedPieceIds, []);
    });
  });

  describe('3. Stacked same-color pieces are safe from capture', () => {
    it('does not capture when two opponent pieces share the cell', () => {
      let state = createInitialLudoState(makePlayers());
      state = withPieceAt(state, 'green-0', 45); // global 5
      state = withPieceAt(state, 'green-1', 45); // global 5 (stacked)
      state = withPieceAt(state, 'red-0', 6); // global 5

      const movedPiece = state.players[0].pieces[0];
      const result = applyCaptureIfAny(state, CLASSIC_4_LAYOUT, movedPiece);
      assert.deepStrictEqual(result.capturedPieceIds, []);
    });
  });

  describe('4. No self-capture', () => {
    it('never captures the moving piece itself or same-color teammates', () => {
      let state = createInitialLudoState(makePlayers());
      state = withPieceAt(state, 'red-1', 6); // same color, same cell as mover
      const movedPiece = { ...state.players[0].pieces[0], location: 'track' as const, steps: 6 };
      const result = applyCaptureIfAny(state, CLASSIC_4_LAYOUT, movedPiece);
      assert.deepStrictEqual(result.capturedPieceIds, []);
    });
  });
});
