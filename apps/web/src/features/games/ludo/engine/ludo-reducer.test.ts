import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { LudoPlayer } from '../types/ludo.types';
import { LudoEngine } from './ludo-engine';

function makePlayers(count: number): LudoPlayer[] {
  const colors: LudoPlayer['color'][] = ['red', 'green', 'yellow', 'blue', 'purple', 'cyan'];
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

describe('Ludo Engine/Reducer Integration Tests', () => {
  describe('1. Game start and turn/phase enforcement', () => {
    it('rejects actions before START_GAME', () => {
      const engine = new LudoEngine(makePlayers(2));
      engine.rollDice('player-0', 6);
      assert.strictEqual(engine.getState().dice.value, null);
    });

    it('rejects rolls from a player who is not on turn', () => {
      const engine = new LudoEngine(makePlayers(2));
      engine.startGame('player-0');
      engine.rollDice('player-1', 6);
      assert.strictEqual(engine.getState().dice.value, null);
      assert.strictEqual(engine.getState().currentTurnSeatIndex, 0);
    });

    it('rejects MOVE_PIECE before a roll has happened', () => {
      const engine = new LudoEngine(makePlayers(2));
      engine.startGame('player-0');
      engine.movePiece('player-0', 'red-0');
      assert.strictEqual(engine.getState().players[0].pieces[0].location, 'base');
    });
  });

  describe('2. Rolling a non-6 with everything in base auto-passes the turn', () => {
    it('advances to the next seat with no legal moves', () => {
      const engine = new LudoEngine(makePlayers(2));
      engine.startGame('player-0');
      engine.rollDice('player-0', 4);
      const state = engine.getState();
      assert.strictEqual(state.currentTurnSeatIndex, 1);
      assert.strictEqual(state.turnPhase, 'awaiting-roll');
    });
  });

  describe('3. Rolling a 6 lets a piece leave base and grants an extra turn', () => {
    it('moves red-0 out of base and keeps the turn on seat 0', () => {
      const engine = new LudoEngine(makePlayers(2));
      engine.startGame('player-0');
      engine.rollDice('player-0', 6);
      assert.strictEqual(engine.getState().turnPhase, 'awaiting-move');

      const legal = engine.getLegalActions(0);
      assert.strictEqual(legal.length, 4);

      engine.movePiece('player-0', 'red-0');
      const state = engine.getState();
      assert.strictEqual(state.players[0].pieces[0].location, 'track');
      assert.strictEqual(state.players[0].pieces[0].steps, 1);
      assert.strictEqual(state.currentTurnSeatIndex, 0, 'six grants an extra turn');
      assert.strictEqual(state.turnPhase, 'awaiting-roll');
    });
  });

  describe('4. Three consecutive sixes forfeits the turn', () => {
    it('passes the turn without allowing a move on the third six', () => {
      const engine = new LudoEngine(makePlayers(2));
      engine.startGame('player-0');
      engine.rollDice('player-0', 6);
      engine.movePiece('player-0', 'red-0');
      engine.rollDice('player-0', 6);
      engine.movePiece('player-0', 'red-1');
      engine.rollDice('player-0', 6);

      const state = engine.getState();
      assert.strictEqual(state.currentTurnSeatIndex, 1);
      assert.strictEqual(state.players[0].consecutiveSixes, 0);
    });
  });

  describe('5. Rejects illegal MOVE_PIECE actions', () => {
    it('rejects moving a piece not present in the legal action list', () => {
      const engine = new LudoEngine(makePlayers(2));
      engine.startGame('player-0');
      engine.rollDice('player-0', 3);
      // dice 3, everything in base -> already auto-passed; try dispatching directly
      engine.movePiece('player-1', 'green-0');
      assert.strictEqual(engine.getState().players[1].pieces[0].location, 'base');
    });
  });

  describe('6. Action log accumulation', () => {
    it('appends every accepted action to actionLog', () => {
      const engine = new LudoEngine(makePlayers(2));
      engine.startGame('player-0');
      engine.rollDice('player-0', 6);
      engine.movePiece('player-0', 'red-0');
      const log = engine.getState().actionLog;
      assert.strictEqual(log[0].type, 'START_GAME');
      assert.strictEqual(log[1].type, 'ROLL_DICE');
      assert.strictEqual(log[2].type, 'MOVE_PIECE');
    });
  });

  describe('7. Serialization round-trip', () => {
    it('survives JSON.stringify/parse identically', () => {
      const engine = new LudoEngine(makePlayers(4));
      engine.startGame('player-0');
      engine.rollDice('player-0', 6);
      engine.movePiece('player-0', 'red-0');
      const state = engine.getState();
      const roundTripped = JSON.parse(JSON.stringify(state));
      assert.deepStrictEqual(roundTripped, state);
    });
  });

  describe('8. Subscription notifications', () => {
    it('notifies subscribers on dispatch and honors unsubscribe', () => {
      const engine = new LudoEngine(makePlayers(2));
      let calls = 0;
      const unsubscribe = engine.subscribe(() => calls++);
      engine.startGame('player-0');
      assert.strictEqual(calls, 1);
      unsubscribe();
      engine.rollDice('player-0', 4);
      assert.strictEqual(calls, 1);
    });
  });

  describe('9. Capture during a move (full deterministic sequence)', () => {
    it('sends a captured opponent piece back to base when landed on exactly', () => {
      // red entry offset 0, green entry offset 13 (see makePlayers colors above).
      const engine = new LudoEngine(makePlayers(2), { requireSixToExitBase: false });
      engine.startGame('player-0');

      engine.rollDice('player-0', 3); // red-0 exits -> steps 1 (idx 0)
      engine.movePiece('player-0', 'red-0');
      engine.rollDice('player-1', 3); // green-0 exits -> steps 1 (idx 13, safe)
      engine.movePiece('player-1', 'green-0');
      engine.rollDice('player-0', 5); // red-0 1 -> 6 (idx 5)
      engine.movePiece('player-0', 'red-0');
      engine.rollDice('player-1', 2); // green-0 1 -> 3 (idx 15, not safe)
      engine.movePiece('player-1', 'green-0');
      engine.rollDice('player-0', 6); // red-0 6 -> 12 (idx 11); six grants an extra turn
      engine.movePiece('player-0', 'red-0');
      engine.rollDice('player-0', 4); // red-0 12 -> 16 (idx 15) -> lands on green-0

      const legal = engine.getLegalActions(0);
      assert.ok(legal.some((a) => a.type === 'MOVE_PIECE' && a.payload.pieceId === 'red-0'));
      engine.movePiece('player-0', 'red-0');

      const finalState = engine.getState();
      const greenPiece = finalState.players[1].pieces[0];
      assert.strictEqual(greenPiece.location, 'base');
      assert.strictEqual(greenPiece.steps, 0);
      assert.strictEqual(finalState.players[0].pieces[0].steps, 16);
      assert.match(finalState.lastMoveNote ?? '', /captured/i);
      assert.strictEqual(finalState.currentTurnSeatIndex, 0, 'capturing grants bonus roll');
      assert.strictEqual(finalState.turnPhase, 'awaiting-roll');
    });
  });

  describe('10. Reaching home grants an extra turn', () => {
    it('grants a bonus roll when a piece reaches home with a non-6 roll', () => {
      const engine = new LudoEngine(makePlayers(2), { requireSixToExitBase: false });
      engine.startGame('player-0');
      // Set red-0 right before finish: finish is 57, so set steps to 55
      const state = engine.getState();
      state.players[0].pieces[0].location = 'home-stretch';
      state.players[0].pieces[0].steps = 55;
      engine.rollDice('player-0', 2); // 55 + 2 = 57 -> finishes to home
      engine.movePiece('player-0', 'red-0');

      const next = engine.getState();
      assert.strictEqual(next.players[0].pieces[0].location, 'home');
      assert.strictEqual(next.players[0].pieces[0].steps, 57);
      assert.strictEqual(next.currentTurnSeatIndex, 0, 'reaching home grants bonus roll');
      assert.strictEqual(next.turnPhase, 'awaiting-roll');
    });
  });
});
