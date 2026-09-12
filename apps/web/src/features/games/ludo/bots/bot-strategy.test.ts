import assert from 'node:assert';
import { describe, it } from 'node:test';
import { LudoEngine } from '../engine/ludo-engine';
import type { LudoPlayer } from '../types/ludo.types';
import { LUDO_BOT_DEFINITIONS } from './bot-registry';

function makePlayers(count: number): LudoPlayer[] {
  const colors: LudoPlayer['color'][] = ['red', 'green', 'yellow', 'blue', 'purple', 'cyan'];
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i}`,
    displayName: `Player ${i}`,
    type: 'bot' as const,
    color: colors[i],
    seatIndex: i,
    status: 'ready' as const,
    ready: true,
  }));
}

function randomDiceValue(): number {
  return Math.floor(Math.random() * 6) + 1;
}

describe('Ludo Bot Strategy Property Tests', () => {
  describe('1. Bots never produce an illegal action', () => {
    for (const seatCount of [2, 3, 4, 6]) {
      it(`stays legal across many turns with ${seatCount} players`, () => {
        const engine = new LudoEngine(makePlayers(seatCount));
        engine.startGame('player-0');

        for (let turn = 0; turn < 60; turn++) {
          const state = engine.getState();
          if (state.status === 'completed') break;

          const seatIndex = state.currentTurnSeatIndex;
          const player = state.players.find((p) => p.seatIndex === seatIndex);
          assert.ok(player, 'current-turn seat must resolve to a player');

          if (state.turnPhase === 'awaiting-roll') {
            engine.rollDice(player.playerId, randomDiceValue());
            continue;
          }

          if (state.turnPhase === 'awaiting-move') {
            const legalActions = engine.getLegalActions(seatIndex);
            assert.ok(legalActions.length > 0, 'awaiting-move phase implies at least one legal move');

            const botDef = LUDO_BOT_DEFINITIONS[turn % LUDO_BOT_DEFINITIONS.length];
            const chosen = botDef.strategy.chooseAction(state, player.playerId, legalActions);

            assert.strictEqual(chosen.type, 'MOVE_PIECE');
            const isLegal = legalActions.some(
              (candidate) =>
                candidate.type === 'MOVE_PIECE' &&
                chosen.type === 'MOVE_PIECE' &&
                candidate.payload.pieceId === chosen.payload.pieceId,
            );
            assert.ok(isLegal, `bot ${botDef.id} chose an action outside the legal set`);

            engine.dispatch(chosen);

            const afterState = engine.getState();
            for (const p of afterState.players) {
              assert.strictEqual(p.pieces.length, 4, 'piece count per player must stay constant');
            }
          }
        }
      });
    }
  });

  describe('2. Bots prefer captures when one is available', () => {
    it('the hard-aggressive bot chooses a capturing move over a non-capturing one', () => {
      // Set up: red-0 exits and advances to a non-safe cell; green-0 exits and
      // sits on a cell red can reach exactly this turn, creating a capture option
      // alongside plain, non-capturing base-exit moves for red's other pieces.
      const captureEngine = new LudoEngine(makePlayers(2), { requireSixToExitBase: false });
      captureEngine.startGame('player-0');
      captureEngine.rollDice('player-0', 3);
      captureEngine.movePiece('player-0', 'red-0'); // steps 1
      captureEngine.rollDice('player-1', 3);
      captureEngine.movePiece('player-1', 'green-0'); // steps 1 (safe)
      captureEngine.rollDice('player-0', 5);
      captureEngine.movePiece('player-0', 'red-0'); // steps 6 (idx 5)
      captureEngine.rollDice('player-1', 2);
      captureEngine.movePiece('player-1', 'green-0'); // steps 3 (idx 15)
      captureEngine.rollDice('player-0', 6);
      captureEngine.movePiece('player-0', 'red-0'); // steps 12 (idx 11), extra turn
      captureEngine.rollDice('player-0', 4); // red-0 12 -> 16 (idx 15) captures green-0

      const state = captureEngine.getState();
      const legalActions = captureEngine.getLegalActions(0);
      const botDef = LUDO_BOT_DEFINITIONS.find((b) => b.id === 'nova-hard-aggressive')!;
      const chosen = botDef.strategy.chooseAction(state, 'player-0', legalActions);

      assert.strictEqual(chosen.type, 'MOVE_PIECE');
      assert.strictEqual((chosen as { payload: { pieceId: string } }).payload.pieceId, 'red-0');
    });
  });
});
