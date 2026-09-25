import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  areAllPiecesStopped,
  calculateBotShot,
  createCarromGame,
  createPockets,
  resolveTurn,
  setStrikerAim,
  setStrikerPosition,
  shootStriker,
  stepPhysics,
} from './carrom-engine';

describe('Carrom Engine', () => {
  describe('Game Initialization', () => {
    it('initializes classic carrom layout with 19 coins and 4 pockets', () => {
      const state = createCarromGame({ setupType: 'classic' });
      assert.equal(state.phase, 'positioning');
      assert.equal(state.activePlayer, 'player1');
      assert.equal(state.pockets.length, 4);
      assert.equal(state.coins.length, 19);

      const whites = state.coins.filter((c) => c.type === 'white');
      const blacks = state.coins.filter((c) => c.type === 'black');
      const queens = state.coins.filter((c) => c.type === 'queen');

      assert.equal(whites.length, 9);
      assert.equal(blacks.length, 9);
      assert.equal(queens.length, 1);
      assert.equal(queens[0].x, 400);
      assert.equal(queens[0].y, 400);
    });

    it('initializes blitz layout with 9 coins', () => {
      const state = createCarromGame({ setupType: 'blitz' });
      assert.equal(state.coins.length, 9);
      const whites = state.coins.filter((c) => c.type === 'white');
      const blacks = state.coins.filter((c) => c.type === 'black');
      const queens = state.coins.filter((c) => c.type === 'queen');
      assert.equal(whites.length, 4);
      assert.equal(blacks.length, 4);
      assert.equal(queens.length, 1);
    });

    it('positions pockets at four distinct corners of the board', () => {
      const pockets = createPockets(800, 44, 36);
      assert.equal(pockets.length, 4);
      assert.ok(pockets[0].x < 100 && pockets[0].y < 100);
      assert.ok(pockets[1].x > 700 && pockets[1].y < 100);
      assert.ok(pockets[2].x < 100 && pockets[2].y > 700);
      assert.ok(pockets[3].x > 700 && pockets[3].y > 700);
    });
  });

  describe('Striker Positioning and Aiming', () => {
    it('sets striker along baseline within bounds', () => {
      const state = createCarromGame();
      const initialY = state.striker.y;

      const success = setStrikerPosition(state, 350);
      assert.equal(success, true);
      assert.equal(state.striker.x, 350);
      assert.equal(state.striker.y, initialY);

      // Clamps outside max boundary
      setStrikerPosition(state, 900);
      assert.equal(state.striker.x, state.baseline.maxX);
    });

    it('prevents striker placement on top of an existing coin', () => {
      const state = createCarromGame();
      // Place a coin directly on the baseline
      state.coins[0].x = 350;
      state.coins[0].y = state.striker.y;
      state.coins[0].isPocketed = false;

      const success = setStrikerPosition(state, 350);
      assert.equal(success, false);
    });

    it('updates aim angle and power', () => {
      const state = createCarromGame();
      setStrikerAim(state, -Math.PI / 4, 75);
      assert.ok(Math.abs(state.aimAngle - -Math.PI / 4) < 0.001);
      assert.equal(state.aimPower, 75);
      assert.equal(state.phase, 'aiming');
    });

    it('launches striker into simulation phase with velocity', () => {
      const state = createCarromGame();
      setStrikerAim(state, -Math.PI / 2, 80);
      const launched = shootStriker(state);

      assert.equal(launched, true);
      assert.equal(state.phase, 'simulating');
      assert.ok(state.striker.vy < -100);
      assert.equal(areAllPiecesStopped(state), false);
    });
  });

  describe('Physics Simulation', () => {
    it('damps piece velocity over time through friction', () => {
      const state = createCarromGame();
      state.striker.vx = 400;
      state.striker.vy = 0;

      stepPhysics(state, 0.5);
      assert.ok(state.striker.vx < 400);
      assert.ok(state.striker.x > 400);
    });

    it('rebounds pieces off board cushion borders', () => {
      const state = createCarromGame();
      // Position coin moving rapidly toward left cushion
      const minBound = state.config.innerBorder + state.coins[0].radius;
      state.coins[0].x = minBound + 5;
      state.coins[0].vx = -300;
      state.coins[0].vy = 0;

      stepPhysics(state, 0.05);
      assert.ok(state.coins[0].vx > 0); // Rebounded to the right
      assert.ok(state.coins[0].x >= minBound);
    });

    it('resolves elastic collisions between striker and coin', () => {
      const state = createCarromGame();
      // Isolate the coin so it does not collide into the rest of the center pack
      state.coins.slice(1).forEach((c) => {
        c.isPocketed = true;
      });

      const coin = state.coins[0];
      coin.x = 400;
      coin.y = 500;
      coin.vx = 0;
      coin.vy = 0;

      state.striker.x = 400;
      state.striker.y = 530;
      state.striker.vx = 0;
      state.striker.vy = -500;

      const { collisions } = stepPhysics(state, 0.05);
      assert.ok(collisions.length > 0);
      assert.ok(coin.vy < 0); // Coin gained upward momentum
    });

    it('detects pocket entry and captures the piece', () => {
      const state = createCarromGame();
      const pocket = state.pockets[0]; // Top-left pocket
      const coin = state.coins[0];

      // Place coin directly adjacent to pocket moving toward it
      coin.x = pocket.x + 10;
      coin.y = pocket.y + 10;
      coin.vx = -100;
      coin.vy = -100;

      const { pockets } = stepPhysics(state, 0.1);
      assert.equal(coin.isPocketed, true);
      assert.equal(coin.pocketId, pocket.id);
      assert.equal(pockets.length, 1);
    });
  });

  describe('Official Rules and Turn Resolution', () => {
    it('grants extra turn when player 1 pockets a white coin', () => {
      const state = createCarromGame();
      const result = resolveTurn(state, [{ pieceId: 'coin-1', type: 'white', pocketId: 0 }]);

      assert.equal(result.extraTurn, true);
      assert.equal(state.activePlayer, 'player1');
      assert.equal(state.coinsPocketedCount.white, 1);
    });

    it('passes turn to player 2 when player 1 misses', () => {
      const state = createCarromGame();
      const result = resolveTurn(state, []);

      assert.equal(result.extraTurn, false);
      assert.equal(state.activePlayer, 'player2');
      assert.equal(state.striker.y, state.baseline.player2Y);
    });

    it('applies foul and returns penalty coin when striker is pocketed', () => {
      const state = createCarromGame();
      state.coinsPocketedCount.white = 2;
      state.coins[1].isPocketed = true;
      state.coins[1].type = 'white';

      const result = resolveTurn(state, [{ pieceId: 'striker', type: 'striker', pocketId: 2 }]);

      assert.equal(result.strikerFoul, true);
      assert.equal(result.extraTurn, false);
      assert.equal(state.activePlayer, 'player2');
      assert.equal(state.coins[1].isPocketed, false); // Returned to center
    });

    it('handles Queen pocketing and subsequent cover', () => {
      const state = createCarromGame();
      // Pocket queen alone on first shot
      const result1 = resolveTurn(state, [{ pieceId: 'queen', type: 'queen', pocketId: 1 }]);

      assert.equal(state.queenState.pendingCoverBy, 'player1');
      assert.equal(result1.extraTurn, true);

      // Successfully cover queen with white coin on next shot
      const result2 = resolveTurn(state, [{ pieceId: 'white-1', type: 'white', pocketId: 3 }]);

      assert.equal(result2.queenCovered, true);
      assert.equal(state.queenState.coveredBy, 'player1');
      assert.equal(state.queenState.pendingCoverBy, null);
      assert.equal(result2.extraTurn, true);
    });

    it('returns Queen to center if player fails to cover on subsequent shot', () => {
      const state = createCarromGame();
      // Pocket Queen
      resolveTurn(state, [{ pieceId: 'queen', type: 'queen', pocketId: 1 }]);
      assert.equal(state.queenState.pendingCoverBy, 'player1');

      // Miss on the cover shot
      const result2 = resolveTurn(state, []);
      assert.equal(result2.queenReturned, true);
      assert.equal(state.queenState.coveredBy, null);
      assert.equal(state.queenState.pendingCoverBy, null);

      const queen = state.coins.find((c) => c.type === 'queen');
      assert.equal(queen?.isPocketed, false);
      assert.equal(queen?.x, 400);
      assert.equal(queen?.y, 400);
    });

    it('detects game over when all player coins are cleared', () => {
      const state = createCarromGame({ setupType: 'blitz' });
      // Mark all 4 white coins as pocketed
      state.coins
        .filter((c) => c.type === 'white')
        .forEach((c) => {
          c.isPocketed = true;
        });

      resolveTurn(state, [{ pieceId: 'white-final', type: 'white', pocketId: 0 }]);

      assert.equal(state.phase, 'game-over');
      assert.equal(state.winner, 'player1');
      assert.ok(state.score.player1 > 0);
    });
  });

  describe('AI Bot Shot Calculation', () => {
    it('calculates a valid aim angle, baseline position, and power for bot', () => {
      const state = createCarromGame({ mode: 'vs-ai' });
      state.activePlayer = 'player2';

      const botShot = calculateBotShot(state);
      assert.ok(botShot.strikerX >= state.baseline.minX);
      assert.ok(botShot.strikerX <= state.baseline.maxX);
      assert.ok(botShot.power >= 10);
      assert.ok(botShot.power <= 100);
      assert.equal(typeof botShot.angle, 'number');
    });
  });
});
