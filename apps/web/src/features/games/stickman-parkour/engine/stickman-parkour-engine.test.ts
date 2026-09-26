import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createInitialParkourState,
  jumpPlayer,
  slidePlayer,
  startParkourGame,
  stepParkourEngine,
} from './stickman-parkour-engine';

describe('Stickman Parkour Engine — State & Initialization', () => {
  it('creates initial parkour state with starting platforms and grounded runner', () => {
    const state = createInitialParkourState(1200);
    assert.equal(state.status, 'ready');
    assert.equal(state.player.isGrounded, true);
    assert.equal(state.highScore, 1200);
    assert.ok(state.platforms.length >= 5);
  });

  it('starts game in playing status', () => {
    const state = createInitialParkourState();
    const running = startParkourGame(state);
    assert.equal(running.status, 'playing');
    assert.equal(running.player.state, 'running');
  });
});

describe('Stickman Parkour Engine — Jumping & Wall Kicks', () => {
  it('executes ground jump and launches airborne', () => {
    let state = startParkourGame(createInitialParkourState());
    state = jumpPlayer(state);

    assert.equal(state.player.isGrounded, false);
    assert.ok(state.player.vy < 0); // upward velocity
    assert.equal(state.player.state, 'jumping');
  });

  it('executes double jump when already in the air', () => {
    let state = startParkourGame(createInitialParkourState());
    state = jumpPlayer(state); // 1st jump
    assert.equal(state.player.canDoubleJump, true);

    state = jumpPlayer(state); // 2nd jump
    assert.equal(state.player.canDoubleJump, false);
    assert.ok(state.player.vy < 0);
  });

  it('executes wall kick when adjacent to a vertical wall obstacle', () => {
    let state = startParkourGame(createInitialParkourState());
    // Place wall directly ahead of player
    state.platforms[0].obstacles = [
      {
        id: 'test_wall',
        type: 'wall',
        x: state.player.x + state.player.width + 10,
        y: state.player.y - 40,
        width: 25,
        height: 80,
      },
    ];

    state = jumpPlayer(state);
    assert.equal(state.player.state, 'wall_kick');
    assert.equal(state.stats.wallJumps, 1);
    assert.ok(state.score > 0);
  });
});

describe('Stickman Parkour Engine — Sliding & Collision', () => {
  it('slides into low stance and recovers standing height after duration', () => {
    let state = startParkourGame(createInitialParkourState());
    state = slidePlayer(state);

    assert.equal(state.player.state, 'sliding');
    assert.equal(state.player.height, 26);
    assert.equal(state.stats.slides, 1);

    // Step through time past slide duration
    for (let i = 0; i < 10; i++) {
      state = stepParkourEngine(state, 0.1);
    }

    assert.equal(state.player.state, 'running');
    assert.equal(state.player.height, 52);
  });

  it('triggers turbo boost when hitting a booster pad', () => {
    let state = startParkourGame(createInitialParkourState());
    // Place booster on player
    state.platforms[0].obstacles = [
      {
        id: 'test_booster',
        type: 'booster',
        x: state.player.x,
        y: state.player.y + 40,
        width: 50,
        height: 20,
      },
    ];

    state = stepParkourEngine(state, 0.05);
    assert.equal(state.stats.boostersHit, 1);
    assert.equal(state.momentum, 3.0);
  });

  it('triggers game over when falling into alley gap below 600px', () => {
    let state = startParkourGame(createInitialParkourState());
    state.player.y = 650; // Dropped into alley chasm

    state = stepParkourEngine(state, 0.05);
    assert.equal(state.status, 'game_over');
  });
});
