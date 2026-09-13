import assert from 'node:assert';
import { describe, it } from 'node:test';
import { MODE_LOCAL_2P, PLAYER_ONE, PLAYER_TWO } from './pen-fight-constants';
import { penFightReducer } from './pen-fight-reducer';
import { createInitialPenFightState } from './pen-fight-state';
import { computeAIFlick, computeFlickFromDrag, computeFlickSpin } from './pen-fight-utils';

describe('Pen Fight Engine Tests', () => {
  describe('Initial state', () => {
    it('starts round 1, aiming phase, player one active, no winner', () => {
      const state = createInitialPenFightState();
      assert.strictEqual(state.round, 1);
      assert.strictEqual(state.phase, 'aiming');
      assert.strictEqual(state.activePlayer, PLAYER_ONE);
      assert.strictEqual(state.matchWinner, null);
      assert.strictEqual(state.players.p2.isAI, true);
    });

    it('marks player two as human in local 2p mode', () => {
      const state = createInitialPenFightState(MODE_LOCAL_2P);
      assert.strictEqual(state.players.p2.isAI, false);
    });
  });

  describe('Turn handoff', () => {
    it('switches the active player when a round has no winner yet', () => {
      const state = createInitialPenFightState();
      const flicked = penFightReducer(state, { type: 'FLICK_TAKEN' });
      const settled = penFightReducer(flicked, { type: 'BEGIN_SETTLING' });
      const resolved = penFightReducer(settled, { type: 'ROUND_RESOLVED', winner: null });

      assert.strictEqual(resolved.activePlayer, PLAYER_TWO);
      assert.strictEqual(resolved.phase, 'aiming');
      assert.strictEqual(resolved.flickCount, 1);
    });
  });

  describe('Round & match resolution', () => {
    it('awards a round win and stays mid-match before the win threshold', () => {
      const state = createInitialPenFightState();
      const resolved = penFightReducer(state, { type: 'ROUND_RESOLVED', winner: PLAYER_ONE });

      assert.strictEqual(resolved.players.p1.roundWins, 1);
      assert.strictEqual(resolved.phase, 'round-over');
      assert.strictEqual(resolved.matchWinner, null);
    });

    it('declares a match winner once round wins reach the threshold', () => {
      let state = createInitialPenFightState();
      state = penFightReducer(state, { type: 'ROUND_RESOLVED', winner: PLAYER_ONE });
      state = penFightReducer(state, { type: 'NEXT_ROUND' });
      state = penFightReducer(state, { type: 'ROUND_RESOLVED', winner: PLAYER_ONE });

      assert.strictEqual(state.players.p1.roundWins, 2);
      assert.strictEqual(state.matchWinner, PLAYER_ONE);
      assert.strictEqual(state.phase, 'match-over');
    });

    it('alternates the starting player each round', () => {
      let state = createInitialPenFightState();
      state = penFightReducer(state, { type: 'ROUND_RESOLVED', winner: PLAYER_ONE });
      state = penFightReducer(state, { type: 'NEXT_ROUND' });

      assert.strictEqual(state.startingPlayer, PLAYER_TWO);
      assert.strictEqual(state.activePlayer, PLAYER_TWO);
      assert.strictEqual(state.round, 2);
    });

    it('does not award a round win on a draw', () => {
      const state = createInitialPenFightState();
      const resolved = penFightReducer(state, { type: 'ROUND_RESOLVED', winner: 'draw' });

      assert.strictEqual(resolved.players.p1.roundWins, 0);
      assert.strictEqual(resolved.players.p2.roundWins, 0);
      assert.strictEqual(resolved.roundWinner, 'draw');
      assert.strictEqual(resolved.phase, 'round-over');
    });
  });

  describe('SET_MODE', () => {
    it('resets the match when switching modes', () => {
      let state = createInitialPenFightState();
      state = penFightReducer(state, { type: 'ROUND_RESOLVED', winner: PLAYER_ONE });
      state = penFightReducer(state, { type: 'SET_MODE', mode: MODE_LOCAL_2P });

      assert.strictEqual(state.mode, MODE_LOCAL_2P);
      assert.strictEqual(state.players.p1.roundWins, 0);
      assert.strictEqual(state.players.p2.isAI, false);
    });
  });

  describe('computeFlickFromDrag', () => {
    it('produces zero power for a negligible drag', () => {
      const flick = computeFlickFromDrag({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
      assert.strictEqual(flick.power, 0);
    });

    it('points the flick opposite the drag direction (slingshot pull-back)', () => {
      // Drag from (0,0,0) to (0,0,1) — pen should launch toward -z.
      const flick = computeFlickFromDrag({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
      assert.ok(flick.direction.z < 0);
      assert.ok(flick.power > 0);
    });

    it('clamps power to a maximum of 1 for very large drags', () => {
      const flick = computeFlickFromDrag({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 50 });
      assert.strictEqual(flick.power, 1);
    });
  });

  describe('computeAIFlick', () => {
    it('aims roughly toward the opponent with perfect accuracy and no jitter', () => {
      const flick = computeAIFlick(
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
        'legend',
        () => 0.5,
      );
      assert.ok(flick.direction.z < 0);
      assert.ok(flick.power > 0 && flick.power <= 1);
    });
  });

  describe('computeFlickSpin', () => {
    const sampleFlicks = [
      { direction: { x: 0, y: 0, z: -1 }, power: 0 },
      { direction: { x: 0.6, y: 0, z: -0.8 }, power: 0.37 },
      { direction: { x: -1, y: 0, z: 0 }, power: 1 },
      { direction: { x: 0.9999, y: 0, z: 0.0141 }, power: 0.5 },
    ];

    it('is deterministic — the same flick always yields the identical spin', () => {
      // This is what keeps two devices in sync: both replay the same flick and must derive
      // bit-for-bit the same impulse. A regression here silently desyncs online matches.
      for (const { direction, power } of sampleFlicks) {
        const first = computeFlickSpin(direction, power);
        for (let i = 0; i < 50; i += 1) {
          assert.strictEqual(computeFlickSpin(direction, power), first);
        }
      }
    });

    it('stays within the +/-0.5 spin envelope for every flick', () => {
      for (const { direction, power } of sampleFlicks) {
        const spin = computeFlickSpin(direction, power);
        assert.ok(spin >= -0.5 && spin <= 0.5, `spin ${spin} out of range`);
      }
    });

    it('mirrors the spin when the flick direction is mirrored', () => {
      const right = computeFlickSpin({ x: 0.5, y: 0, z: -0.5 }, 0.5);
      const left = computeFlickSpin({ x: -0.5, y: 0, z: -0.5 }, 0.5);
      assert.strictEqual(right, -left);
    });

    it('varies with the flick, so shots are not all identical', () => {
      const straight = computeFlickSpin({ x: 0, y: 0, z: -1 }, 0.5);
      const angled = computeFlickSpin({ x: 0.7, y: 0, z: -0.7 }, 0.5);
      assert.notStrictEqual(straight, angled);
    });
  });
});
