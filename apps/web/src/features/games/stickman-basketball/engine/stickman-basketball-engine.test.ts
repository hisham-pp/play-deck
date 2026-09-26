import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HOOPS,
  createInitialBasketballState,
  stepBasketballEngine,
} from './stickman-basketball-engine';

describe('Stickman Basketball Engine', () => {
  it('should initialize match state correctly', () => {
    const state = createInitialBasketballState();
    assert.equal(state.status, 'playing');
    assert.equal(state.gameTimeRemaining, 60);
    assert.equal(state.shotClock, 14);
    assert.equal(state.possession, 'p1');
    assert.equal(state.ball.holder, 'p1');
    assert.equal(state.p1.score, 0);
    assert.equal(state.p2.score, 0);
  });

  it('should move player when movement inputs provided', () => {
    const state = createInitialBasketballState();
    const initX = state.p1.x;

    const next = stepBasketballEngine(state, { p1: { moveRight: true } }, 0.05);
    assert.ok(next.p1.x > initX);
    assert.equal(next.p1.facing, 1);
  });

  it('should perform crossover and reverse direction', () => {
    const state = createInitialBasketballState();
    state.p1.facing = 1;

    const next = stepBasketballEngine(state, { p1: { crossover: true } }, 0.05);
    assert.equal(next.p1.facing, -1);
    assert.ok(next.p1.crossoverCooldown > 0);
    assert.ok(next.soundEvents.includes('crossover'));
  });

  it('should launch jump shot into flight', () => {
    const state = createInitialBasketballState();
    // Press shoot then release
    let next = stepBasketballEngine(state, { p1: { shootHold: true } }, 0.05);
    assert.equal(next.p1.isShooting, true);

    next = stepBasketballEngine(next, { p1: { shootRelease: true } }, 0.05);
    assert.equal(next.ball.holder, null);
    assert.equal(next.ball.inFlight, true);
    assert.ok(next.soundEvents.includes('shoot'));
  });

  it('should execute slam dunk when near rim', () => {
    const state = createInitialBasketballState();
    state.p1.x = HOOPS.right.rimX - 40; // in dunk range
    state.p1.y = HOOPS.right.y + 20;

    const next = stepBasketballEngine(state, { p1: { shootHold: true, moveRight: true } }, 0.05);

    assert.equal(next.status, 'scored');
    assert.equal(next.p1.score, 2);
    assert.ok(next.soundEvents.includes('dunk'));
  });

  it('should poke ball loose on successful steal', () => {
    const state = createInitialBasketballState();
    state.ball.holder = 'p2';
    state.p2.x = 400;
    state.p1.x = 420; // right next to p2

    const next = stepBasketballEngine(state, { p1: { steal: true } }, 0.05);
    assert.equal(next.ball.holder, null);
    assert.equal(next.ball.inFlight, true);
    assert.ok(next.soundEvents.includes('steal'));
  });

  it('should trigger game over when clock reaches zero', () => {
    const state = createInitialBasketballState();
    state.gameTimeRemaining = 0.04;

    const next = stepBasketballEngine(state, { p1: {} }, 0.05);
    assert.equal(next.status, 'game_over');
    assert.ok(next.soundEvents.includes('buzzer'));
  });
});
