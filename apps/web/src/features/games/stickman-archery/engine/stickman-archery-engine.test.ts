import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  advanceToNextRound,
  calculateTrajectoryPreview,
  createInitialArcheryState,
  releaseBow,
  resetForNextShot,
  startAiming,
  stepArcheryGame,
  updateAiming,
} from './stickman-archery-engine';

describe('Stickman Archery Engine', () => {
  it('initializes in aiming state with round 1 setup and 5 arrows', () => {
    const state = createInitialArcheryState(100, 0);

    assert.equal(state.status, 'aiming');
    assert.equal(state.roundIndex, 0);
    assert.equal(state.score, 0);
    assert.equal(state.highScore, 100);
    assert.equal(state.arrowsLeft, 5);
    assert.equal(state.targets.length, 1);
  });

  it('handles aim drag and arrow release physics', () => {
    let state = createInitialArcheryState(0, 0);

    state = startAiming(state, 200, 300);
    assert.ok(state.dragStart);

    // Pull bow back (drag left and down)
    state = updateAiming(state, 120, 350);
    assert.ok(state.currentDrag);

    // Trajectory preview
    const preview = calculateTrajectoryPreview(state.bow, state.dragStart, state.currentDrag, 0);
    assert.ok(preview.length > 0);

    // Release bow
    const released = releaseBow(state);
    assert.equal(released.status, 'flying');
    assert.equal(released.arrowsLeft, 4);
    assert.equal(released.arrow.isFlying, true);
    assert.ok(released.arrow.vx > 0);
  });

  it('steps flight physics and detects bullseye on target center', () => {
    let state = createInitialArcheryState(0, 0);
    const target = state.targets[0];

    // Position arrow right next to target center
    state = {
      ...state,
      status: 'flying',
      arrow: {
        x: target.x - 2,
        y: target.y + target.height / 2,
        vx: 100,
        vy: 0,
        angle: 0,
        isFlying: true,
        isStuck: false,
        stuckTargetId: null,
        offsetY: 0,
      },
    };

    const next = stepArcheryGame(state, 0.016);
    assert.ok(next.status === 'hit' || next.status === 'round-cleared');
    assert.equal(next.combo, 1);
    assert.ok(next.score >= 50);
    assert.equal(next.arrow.isStuck, true);
  });

  it('resets for next shot and advances to next round', () => {
    let state = createInitialArcheryState(0, 0);
    state = { ...state, status: 'hit', arrowsLeft: 4 };

    const resetState = resetForNextShot(state);
    assert.equal(resetState.status, 'aiming');
    assert.equal(resetState.arrow.isFlying, false);

    const advanced = advanceToNextRound(resetState);
    assert.equal(advanced.roundIndex, 1);
    assert.ok(advanced.wind !== 0);
    assert.equal(advanced.arrowsLeft, 5);
  });
});
