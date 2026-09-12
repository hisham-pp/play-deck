import assert from 'node:assert';
import { describe, it } from 'node:test';
import { CLASSIC_4_LAYOUT } from './board-layout';
import { DEFAULT_RULE_SETTINGS } from './ludo-constants';
import { computeDestinationSteps, computeLegalMoveActions } from './movement';
import { createInitialLudoState } from './ludo-state';
import type { LudoPieceState, LudoPlayer } from '../types/ludo.types';

function basePiece(overrides: Partial<LudoPieceState> = {}): LudoPieceState {
  return { id: 'red-0', color: 'red', pieceIndex: 0, location: 'base', steps: 0, ...overrides };
}

function makePlayers(count: number): LudoPlayer[] {
  const colors: LudoPlayer['color'][] = ['red', 'green', 'yellow', 'blue'];
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i}`,
    displayName: `Player ${i}`,
    type: 'human' as const,
    color: colors[i],
    seatIndex: i,
    status: 'ready' as const,
    ready: true,
  }));
}

describe('Ludo Movement Tests', () => {
  describe('1. Leaving base', () => {
    it('requires a 6 to leave base by default', () => {
      const piece = basePiece();
      assert.strictEqual(
        computeDestinationSteps(piece, 3, DEFAULT_RULE_SETTINGS, CLASSIC_4_LAYOUT),
        null,
      );
      assert.strictEqual(
        computeDestinationSteps(piece, 6, DEFAULT_RULE_SETTINGS, CLASSIC_4_LAYOUT),
        1,
      );
    });

    it('allows any roll to leave base when requireSixToExitBase is false', () => {
      const piece = basePiece();
      const settings = { ...DEFAULT_RULE_SETTINGS, requireSixToExitBase: false };
      assert.strictEqual(computeDestinationSteps(piece, 3, settings, CLASSIC_4_LAYOUT), 1);
    });
  });

  describe('2. Track advancement', () => {
    it('advances a piece already on the track by the dice value', () => {
      const piece = basePiece({ location: 'track', steps: 10 });
      assert.strictEqual(
        computeDestinationSteps(piece, 4, DEFAULT_RULE_SETTINGS, CLASSIC_4_LAYOUT),
        14,
      );
    });
  });

  describe('3. Exact-roll-to-finish rule', () => {
    it('rejects overshooting home when an exact roll is required', () => {
      // finish = 52 + 6 + 1 = 59
      const piece = basePiece({ location: 'home-stretch', steps: 57 });
      assert.strictEqual(
        computeDestinationSteps(piece, 5, DEFAULT_RULE_SETTINGS, CLASSIC_4_LAYOUT),
        null,
      );
      assert.strictEqual(
        computeDestinationSteps(piece, 2, DEFAULT_RULE_SETTINGS, CLASSIC_4_LAYOUT),
        59,
      );
    });

    it('clamps to home on overshoot when exact roll is not required', () => {
      const piece = basePiece({ location: 'home-stretch', steps: 57 });
      const settings = { ...DEFAULT_RULE_SETTINGS, requireExactRollToFinish: false };
      assert.strictEqual(computeDestinationSteps(piece, 5, settings, CLASSIC_4_LAYOUT), 59);
    });

    it('never returns a legal move for a piece already home', () => {
      const piece = basePiece({ location: 'home', steps: 59 });
      assert.strictEqual(
        computeDestinationSteps(piece, 6, DEFAULT_RULE_SETTINGS, CLASSIC_4_LAYOUT),
        null,
      );
    });
  });

  describe('4. Legal move aggregation across a player', () => {
    it('reports no legal moves when all pieces are in base and dice is not 6', () => {
      const state = createInitialLudoState(makePlayers(4));
      const actions = computeLegalMoveActions(state, 0, 4);
      assert.strictEqual(actions.length, 0);
    });

    it('reports 4 legal base-exit moves when dice is 6 and all pieces are in base', () => {
      const state = createInitialLudoState(makePlayers(4));
      const actions = computeLegalMoveActions(state, 0, 6);
      assert.strictEqual(actions.length, 4);
      assert.ok(actions.every((a) => a.type === 'MOVE_PIECE'));
    });

    it('only offers moves for pieces belonging to the queried seat', () => {
      const state = createInitialLudoState(makePlayers(4));
      const actions = computeLegalMoveActions(state, 1, 6);
      assert.ok(
        actions.every((a) => a.type === 'MOVE_PIECE' && a.payload.pieceId.startsWith('green-')),
      );
    });
  });
});
