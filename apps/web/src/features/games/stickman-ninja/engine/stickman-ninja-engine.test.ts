import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createInitialNinjaState, stepNinjaEngine } from './stickman-ninja-engine';

describe('Stickman Ninja Engine', () => {
  it('should initialize state correctly for level 1', () => {
    const state = createInitialNinjaState(1, 0);
    assert.equal(state.status, 'playing');
    assert.equal(state.level, 1);
    assert.equal(state.player.shurikens, 5);
    assert.equal(state.player.smokeBombs, 2);
    assert.equal(state.player.health, 100);
    assert.ok(state.guards.length > 0);
    assert.equal(state.scrollCollected, false);
  });

  it('should update player position and facing when moving', () => {
    const state = createInitialNinjaState();
    const initX = state.player.x;

    const next = stepNinjaEngine(state, { moveRight: true }, 0.05);
    assert.ok(next.player.x > initX);
    assert.equal(next.player.facing, 1);
    assert.ok(next.player.noiseRadius > 0);
  });

  it('should reduce speed and noise when crouching', () => {
    const state = createInitialNinjaState();
    const walkNext = stepNinjaEngine(state, { moveRight: true }, 0.05);
    const crouchNext = stepNinjaEngine(state, { moveRight: true, crouch: true }, 0.05);

    assert.ok(crouchNext.player.noiseRadius < walkNext.player.noiseRadius);
    assert.ok(crouchNext.player.x < walkNext.player.x);
    assert.equal(crouchNext.player.isCrouched, true);
  });

  it('should apply jump velocity', () => {
    const state = createInitialNinjaState();
    const next = stepNinjaEngine(state, { jump: true }, 0.05);

    assert.ok(next.player.vy < 0);
    assert.equal(next.player.state, 'jumping');
  });

  it('should throw shuriken and reduce count', () => {
    const state = createInitialNinjaState();
    const initialShurikens = state.player.shurikens;

    const next = stepNinjaEngine(state, { throwShuriken: { targetX: 400, targetY: 300 } }, 0.05);

    assert.equal(next.player.shurikens, initialShurikens - 1);
    assert.equal(next.shurikens.length, 1);
    assert.ok(next.shurikens[0].active);
  });

  it('should deploy smoke bomb and stun nearby guards', () => {
    const state = createInitialNinjaState();
    state.guards[0].x = state.player.x + 30; // close to player

    const next = stepNinjaEngine(state, { deploySmoke: true }, 0.05);

    assert.equal(next.player.smokeBombs, 1);
    assert.equal(next.smokeClouds.length, 1);
    assert.equal(next.guards[0].state, 'stunned');
  });

  it('should execute silent takedown from behind guard', () => {
    const state = createInitialNinjaState();
    const guard = state.guards[0];
    guard.x = 100;
    guard.facing = 1; // Facing right

    state.player.x = 80; // Player is behind guard facing right
    state.player.facing = 1;

    const next = stepNinjaEngine(state, { takedown: true }, 0.05);

    assert.equal(next.guards[0].state, 'eliminated');
    assert.equal(next.player.state, 'takedown');
    assert.ok(next.score > 0);
  });

  it('should complete level when collecting secret scroll', () => {
    const state = createInitialNinjaState();
    state.player.x = state.scrollX;
    state.player.y = state.scrollY;

    const next = stepNinjaEngine(state, {}, 0.05);

    assert.equal(next.scrollCollected, true);
    assert.equal(next.status, 'level_clear');
    assert.ok(next.score > 500);
  });
});
