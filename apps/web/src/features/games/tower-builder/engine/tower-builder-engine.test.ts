import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ARENA_WIDTH,
  BASE_PLATFORM_WIDTH,
  BASE_PLATFORM_Y,
  createInitialTowerBuilderState,
  dropPiece,
  moveCrane,
  startTowerGame,
  stepTowerGame,
} from './tower-builder-engine';

describe('Tower Builder Engine', () => {
  it('initializes in idle state with 3 lives and default dimensions', () => {
    const state = createInitialTowerBuilderState(100);
    assert.equal(state.status, 'idle');
    assert.equal(state.lives, 3);
    assert.equal(state.score, 0);
    assert.equal(state.highScore, 100);
    assert.equal(state.highestY, BASE_PLATFORM_Y);
    assert.equal(state.baseWidth, BASE_PLATFORM_WIDTH);
    assert.equal(state.droppingPiece, null);
  });

  it('starts game and moves crane over time', () => {
    let state = createInitialTowerBuilderState(0);
    state = startTowerGame(state);
    assert.equal(state.status, 'playing');

    const initialX = state.craneX;
    state = stepTowerGame(state, 0.1);
    assert.notEqual(state.craneX, initialX);
  });

  it('manually positions crane within arena boundaries', () => {
    let state = startTowerGame(createInitialTowerBuilderState(0));
    state = moveCrane(state, 300);
    assert.equal(state.craneX, 300);

    // Clamps to edges
    state = moveCrane(state, 9999);
    assert.ok(state.craneX < ARENA_WIDTH);

    state = moveCrane(state, -100);
    assert.ok(state.craneX > 0);
  });

  it('drops a piece and lands it successfully when centered', () => {
    let state = startTowerGame(createInitialTowerBuilderState(0));
    // Center crane over base platform
    state = moveCrane(state, ARENA_WIDTH / 2);
    state = dropPiece(state);
    assert.ok(state.droppingPiece !== null);

    // Simulate physics until block lands
    for (let i = 0; i < 60; i++) {
      state = stepTowerGame(state, 0.05);
      if (state.droppingPiece === null) break;
    }

    assert.equal(state.droppingPiece, null);
    assert.equal(state.placedBlocks.length, 1);
    assert.ok(state.highestY > BASE_PLATFORM_Y);
    assert.ok(state.score > 0);
    assert.equal(state.lives, 3);
  });

  it('penalizes player with lost life and debris on edge tumble', () => {
    let state = startTowerGame(createInitialTowerBuilderState(0));
    // Position crane far off to the edge where it will miss the base platform
    state = moveCrane(state, 40);
    state = dropPiece(state);

    // Simulate physics until block falls past target
    for (let i = 0; i < 60; i++) {
      state = stepTowerGame(state, 0.05);
      if (state.droppingPiece === null) break;
    }

    assert.equal(state.placedBlocks.length, 0);
    assert.equal(state.lives, 2);
    assert.equal(state.fallingBlocks.length, 1);
  });

  it('triggers game over when all 3 lives are lost', () => {
    let state = startTowerGame(createInitialTowerBuilderState(0));
    state.lives = 1;

    // Drop block far from center to trigger failure
    state = moveCrane(state, 40);
    state = dropPiece(state);

    for (let i = 0; i < 60; i++) {
      state = stepTowerGame(state, 0.05);
      if (state.droppingPiece === null) break;
    }

    assert.equal(state.lives, 0);
    assert.equal(state.status, 'game_over');
  });
});
