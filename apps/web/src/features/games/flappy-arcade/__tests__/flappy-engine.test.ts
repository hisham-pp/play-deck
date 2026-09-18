import assert from 'node:assert';
import { describe, it } from 'node:test';
import { calculateDifficulty } from '../engine/flappy-difficulty';
import {
  createInitialFlappyState,
  DEFAULT_FLAPPY_CONFIG,
  stepFlappyGame,
} from '../engine/flappy-engine';

describe('Flappy Engine — Game Lifecycle & Transitions', () => {
  it('creates initial state with status idle and correct baseline properties', () => {
    const state = createInitialFlappyState(42, DEFAULT_FLAPPY_CONFIG);

    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.score, 0);
    assert.strictEqual(state.highScore, 42);
    assert.strictEqual(state.pipes.length, 0);
  });

  it('does not progress physics when state is paused', () => {
    const state = createInitialFlappyState(10, DEFAULT_FLAPPY_CONFIG);
    state.status = 'paused';
    state.bird.y = 200;

    const next = stepFlappyGame(state, 0.1, { flap: false }, {}, DEFAULT_FLAPPY_CONFIG);
    assert.strictEqual(next.bird.y, 200);
    assert.strictEqual(next.status, 'paused');
  });

  it('spawns pipes and moves them leftwards during playing state', () => {
    let state = createInitialFlappyState(0, DEFAULT_FLAPPY_CONFIG);
    state.status = 'playing';

    // Step several times to spawn first pipe
    state = stepFlappyGame(state, 0.05, { flap: false }, {}, DEFAULT_FLAPPY_CONFIG);
    assert.ok(state.pipes.length > 0, 'Pipes array should have spawned a pipe');

    const firstPipeInitialX = state.pipes[0].x;
    state = stepFlappyGame(state, 0.1, { flap: false }, {}, DEFAULT_FLAPPY_CONFIG);
    assert.ok(state.pipes[0].x < firstPipeInitialX, 'Pipe should move leftward');
  });

  it('increments score and invokes onScore when bird passes pipe center', () => {
    let scoredValue = 0;
    let state = createInitialFlappyState(0, DEFAULT_FLAPPY_CONFIG);
    state.status = 'playing';

    // Manually place a pipe right before the bird
    // Bird is at x = 120
    state.pipes = [
      {
        id: 99,
        x: 125, // Pipe width = 64, center = 157
        width: 64,
        topHeight: 40,
        bottomY: 520,
        gap: 480,
        passed: false,
        pulsePhase: 0,
      },
    ];

    // Step forward so pipe scrolls past bird x (120)
    // Speed is ~170 px/s, with dt = 0.1, dx = 17 px
    // New pipe x = 125 - 17 = 108. Center = 108 + 32 = 140 (not passed yet)
    state = stepFlappyGame(state, 0.1, { flap: false }, {}, DEFAULT_FLAPPY_CONFIG);
    assert.strictEqual(state.score, 0);

    // Step further so pipe x becomes 125 - 34 = 91, center = 91 + 32 = 123 (bird at 120, almost passed)
    // Another step: pipe x = 70, center = 70 + 32 = 102 (bird at 120 > 102 -> passed!)
    state = stepFlappyGame(
      state,
      0.2,
      { flap: false },
      {
        onScore: (s) => {
          scoredValue = s;
        },
      },
      DEFAULT_FLAPPY_CONFIG,
    );

    assert.strictEqual(state.score, 1);
    assert.strictEqual(scoredValue, 1);
    assert.strictEqual(state.pipes[0].passed, true);
  });

  it('transitions to game-over when collision occurs', () => {
    let gameOverTriggered = false;
    const state = createInitialFlappyState(0, DEFAULT_FLAPPY_CONFIG);
    state.status = 'playing';

    // Place pipe directly colliding with bird
    state.bird.x = 120;
    state.bird.y = 100;
    state.pipes = [
      {
        id: 1,
        x: 100,
        width: 64,
        topHeight: 200, // Bird at y = 100 collides with topHeight = 200
        bottomY: 380,
        gap: 180,
        passed: false,
        pulsePhase: 0,
      },
    ];

    const next = stepFlappyGame(
      state,
      0.05,
      { flap: false },
      {
        onGameOver: () => {
          gameOverTriggered = true;
        },
      },
      DEFAULT_FLAPPY_CONFIG,
    );

    assert.strictEqual(next.status, 'game-over');
    assert.strictEqual(gameOverTriggered, true);
    assert.ok(next.screenShake > 0, 'Screen shake should be triggered');
  });
});

describe('Flappy Difficulty — Scaling Curve', () => {
  it('increases speed and narrows gap as score increases', () => {
    const diff0 = calculateDifficulty(0, DEFAULT_FLAPPY_CONFIG);
    const diff15 = calculateDifficulty(15, DEFAULT_FLAPPY_CONFIG);
    const diff40 = calculateDifficulty(40, DEFAULT_FLAPPY_CONFIG);

    assert.ok(diff15.speed > diff0.speed, 'Speed at score 15 should be greater than at 0');
    assert.ok(diff40.speed >= diff15.speed, 'Speed at score 40 should be greater than at 15');
    assert.ok(diff15.gapSize < diff0.gapSize, 'Gap at score 15 should be narrower than at 0');
    assert.ok(diff40.gapSize <= diff15.gapSize, 'Gap at score 40 should be narrower than at 15');
  });
});
