import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createInitialRacingState,
  jumpHurdle,
  setBoost,
  shiftLane,
  startRacingGame,
  stepRacingEngine,
} from './stickman-racing-engine';

describe('Stickman Racing Engine — Initialization', () => {
  it('creates initial race state with 3-lane track and rivals', () => {
    const state = createInitialRacingState(2500, 400);
    assert.equal(state.status, 'ready');
    assert.equal(state.player.lane, 1);
    assert.equal(state.rivals.length, 2);
    assert.equal(state.highScore, 2500);
    assert.ok(state.hurdles.length > 5);
  });

  it('starts race in racing status', () => {
    const state = createInitialRacingState();
    const running = startRacingGame(state);
    assert.equal(running.status, 'racing');
    assert.equal(running.player.finished, false);
  });
});

describe('Stickman Racing Engine — Lane Shifting & Jumping', () => {
  it('shifts lane left and right within bounds', () => {
    let state = startRacingGame(createInitialRacingState());
    assert.equal(state.player.targetLane, 1);

    // Shift left to lane 0
    state = shiftLane(state, -1);
    assert.equal(state.player.targetLane, 0);

    // Cannot shift further left
    state = shiftLane(state, -1);
    assert.equal(state.player.targetLane, 0);

    // Shift right to lane 1, then lane 2
    state = shiftLane(state, 1);
    assert.equal(state.player.targetLane, 1);
    state = shiftLane(state, 1);
    assert.equal(state.player.targetLane, 2);

    // Cannot shift past lane 2
    state = shiftLane(state, 1);
    assert.equal(state.player.targetLane, 2);
  });

  it('triggers hurdle jump with vertical velocity', () => {
    let state = startRacingGame(createInitialRacingState());
    state = jumpHurdle(state);

    assert.equal(state.player.isJumping, true);
    assert.ok(state.player.jumpVy > 0);
  });
});

describe('Stickman Racing Engine — Slipstream, Nitro, and Hurdle Collisions', () => {
  it('charges nitro rapidly when drafting behind rival', () => {
    let state = startRacingGame(createInitialRacingState());
    // Position rival 8 meters directly ahead in same lane
    state.rivals[0].targetLane = state.player.targetLane;
    state.rivals[0].distanceMeters = state.player.distanceMeters + 8;
    const initialNitro = state.player.nitroGauge;

    state = stepRacingEngine(state, 0.5);
    assert.equal(state.player.isDrafting, true);
    assert.ok(state.player.nitroGauge > initialNitro);
    assert.ok(state.stats.draftSeconds > 0);
  });

  it('activates supersonic boost when nitro is available', () => {
    let state = startRacingGame(createInitialRacingState());
    state.player.nitroGauge = 50;

    state = setBoost(state, true);
    assert.equal(state.player.isBoosting, true);

    state = stepRacingEngine(state, 0.2);
    assert.ok(state.player.speed >= 30.0);
  });

  it('clears hurdle cleanly when jumped', () => {
    let state = startRacingGame(createInitialRacingState());
    // Place hurdle 1 meter ahead
    state.hurdles = [
      {
        id: 'h1',
        lane: state.player.targetLane,
        distanceMeters: state.player.distanceMeters + 1,
      },
    ];

    state = jumpHurdle(state);
    state.player.jumpY = 1.2; // in air

    state = stepRacingEngine(state, 0.1);
    assert.equal(state.stats.hurdlesCleared, 1);
    assert.equal(state.stats.stumbles, 0);
  });

  it('stumbles runner when hitting hurdle on ground without boost', () => {
    let state = startRacingGame(createInitialRacingState());
    state.hurdles = [
      {
        id: 'h1',
        lane: state.player.targetLane,
        distanceMeters: state.player.distanceMeters + 1,
      },
    ];
    state.player.jumpY = 0; // on ground

    state = stepRacingEngine(state, 0.1);
    assert.equal(state.stats.stumbles, 1);
    assert.ok(state.player.stumbleTimer > 0);
  });

  it('crosses finish line and concludes race with rank and score', () => {
    let state = startRacingGame(createInitialRacingState(0, 100));
    state.player.distanceMeters = 98; // 2m to finish

    state = stepRacingEngine(state, 0.1);
    state = stepRacingEngine(state, 0.1);
    assert.equal(state.status, 'finished');
    assert.equal(state.player.finished, true);
    assert.ok(state.player.rank >= 1 && state.player.rank <= 3);
  });
});
