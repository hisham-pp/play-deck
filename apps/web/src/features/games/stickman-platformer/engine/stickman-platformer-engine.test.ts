import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  advanceToNextLevel,
  createInitialPlatformerState,
  respawnPlayer,
  stepPlatformerGame,
} from './stickman-platformer-engine';

describe('Stickman Platformer Engine', () => {
  it('initializes in idle state with 3 lives and level 1 parameters', () => {
    const state = createInitialPlatformerState(50, 0);

    assert.equal(state.status, 'idle');
    assert.equal(state.lives, 3);
    assert.equal(state.score, 0);
    assert.equal(state.highScore, 50);
    assert.equal(state.currentLevelIndex, 0);
    assert.equal(state.level.id, 1);
    assert.equal(state.player.x, state.level.startX);
    assert.equal(state.player.y, state.level.startY);
  });

  it('moves player horizontally and handles jump inputs', () => {
    let state = createInitialPlatformerState(0, 0);
    state = { ...state, status: 'running' };

    // Move right
    const movedRight = stepPlatformerGame(state, 0.05, {
      left: false,
      right: true,
      jump: false,
    });
    assert.ok(movedRight.player.x > state.player.x);
    assert.equal(movedRight.player.facing, 'right');

    // Move left
    const movedLeft = stepPlatformerGame(movedRight, 0.05, {
      left: true,
      right: false,
      jump: false,
    });
    assert.ok(movedLeft.player.x < movedRight.player.x);
    assert.equal(movedLeft.player.facing, 'left');
  });

  it('collects coins and updates score', () => {
    let state = createInitialPlatformerState(0, 0);
    state = { ...state, status: 'running' };

    const firstCoin = state.level.coins[0];
    // Position player right onto the coin
    state.player.x = firstCoin.x - 5;
    state.player.y = firstCoin.y - 5;

    const nextState = stepPlatformerGame(state, 0.016, {
      left: false,
      right: false,
      jump: false,
    });
    assert.ok(nextState.score >= firstCoin.value);
    assert.equal(nextState.coinsCollected, 1);
    assert.equal(nextState.level.coins[0].collected, true);
  });

  it('respawns player and decrements lives on hazard collision', () => {
    let state = createInitialPlatformerState(0, 0);
    state = { ...state, status: 'running' };

    // Set an active checkpoint
    state.activeCheckpoint = { x: 200, y: 250 };

    const respawned = respawnPlayer(state);
    assert.equal(respawned.lives, 2);
    assert.equal(respawned.player.x, 200);
    assert.equal(respawned.player.y, 250);

    // Depleting remaining lives leads to game over
    const secondLoss = respawnPlayer(respawned);
    const finalLoss = respawnPlayer(secondLoss);
    assert.equal(finalLoss.lives, 0);
    assert.equal(finalLoss.status, 'game-over');
  });

  it('activates checkpoints and triggers level cleared at exit', () => {
    let state = createInitialPlatformerState(0, 0);
    state = { ...state, status: 'running' };

    const exit = state.level.exit;
    state.player.x = exit.x + 2;
    state.player.y = exit.y + 2;

    const cleared = stepPlatformerGame(state, 0.016, {
      left: false,
      right: false,
      jump: false,
    });
    assert.equal(cleared.status, 'level-cleared');
    assert.ok(cleared.score > 0);

    const advanced = advanceToNextLevel(cleared);
    assert.equal(advanced.currentLevelIndex, 1);
    assert.equal(advanced.level.id, 2);
    assert.equal(advanced.status, 'running');
  });
});
