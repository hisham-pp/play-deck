import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { BallBounceInput, BallBounceState, BallState } from '../types/ball-bounce.types';
import {
  COUNTDOWN_SECONDS,
  MAX_BALLS,
  MAX_LIVES,
  PADDLE_WIDTH,
  STARTING_LIVES,
  WORLD_HEIGHT,
  blockColumnsFor,
  comboMultiplier,
  worldWidthForViewport,
} from './ball-bounce-constants';
import { MAX_FRAME_DT, currentBallSpeed, stepGame } from './ball-bounce-engine';
import { toHud } from './ball-bounce-hud';
import { buildLevelBlocks, maxHpForLevel, rowsForLevel } from './ball-bounce-levels';
import {
  bounceOffPaddle,
  circleRectContact,
  enforceMinVertical,
  speedOf,
} from './ball-bounce-physics';
import { applyPowerUp, pickPowerUpKind } from './ball-bounce-power-ups';
import {
  createInitialState,
  pauseGame,
  resizeWorld,
  resumeGame,
  startGame,
} from './ball-bounce-state';

const idle: BallBounceInput = { left: false, right: false, pointerX: null, launch: false };
const never = () => 0.99;

function freeBall(state: BallBounceState, patch: Partial<BallState>): BallState {
  const ball: BallState = {
    id: state.nextId++,
    x: 300,
    y: 400,
    vx: 0,
    vy: -300,
    radius: 8,
    stuck: false,
    trail: [],
    ...patch,
  };
  state.balls = [ball];
  return ball;
}

function playing(): BallBounceState {
  const state = startGame(createInitialState(0, 600));
  state.status = 'playing';
  state.countdown = 0;
  return state;
}

describe('Ball Bounce — setup', () => {
  it('starts idle with three lives, a stuck ball and a full first level', () => {
    const state = createInitialState(120, 600);
    assert.equal(state.status, 'idle');
    assert.equal(state.player.lives, STARTING_LIVES);
    assert.equal(state.balls.length, 1);
    assert.ok(state.balls[0].stuck);
    assert.equal(state.blocks.length, blockColumnsFor(600) * rowsForLevel(1));
    assert.equal(state.score.highScore, 120);
  });

  it('counts down, then serves the ball automatically', () => {
    const state = startGame(createInitialState(0, 600));
    assert.equal(state.status, 'countdown');
    for (let t = 0; t < COUNTDOWN_SECONDS + 0.1; t += MAX_FRAME_DT)
      stepGame(state, idle, MAX_FRAME_DT);
    assert.equal(state.status, 'playing');
    stepGame(state, idle, MAX_FRAME_DT);
    assert.equal(state.balls[0].stuck, false);
    assert.ok(state.balls[0].vy < 0);
  });

  it('sizes the world to the viewport within bounds', () => {
    assert.equal(worldWidthForViewport(400, 800), 440);
    assert.equal(worldWidthForViewport(1000, 800), 1000);
    assert.equal(worldWidthForViewport(4000, 800), 1280);
  });
});

describe('Ball Bounce — physics', () => {
  it('reflects off walls and the ceiling', () => {
    const state = playing();
    state.blocks = [];
    state.level.totalBlocks = 0;
    const ball = freeBall(state, { x: 10, y: 10, vx: -300, vy: -300 });
    stepGame(state, idle, 1 / 60);
    assert.ok(ball.vx > 0);
    assert.ok(ball.vy > 0);
  });

  it('paddle angle depends on where the ball lands', () => {
    const state = playing();
    const paddle = state.player.paddle;
    const left = freeBall(state, { x: paddle.x - paddle.width / 2, vy: 300 });
    bounceOffPaddle(left, paddle, 400);
    const right = freeBall(state, { x: paddle.x + paddle.width / 2, vy: 300 });
    bounceOffPaddle(right, paddle, 400);
    assert.ok(left.vx < 0 && right.vx > 0);
    assert.ok(left.vy < 0 && right.vy < 0);
    assert.ok(Math.abs(speedOf(left) - 400) < 1e-6);
  });

  it('detects circle/rect contact with a normal pointing at the ball', () => {
    const contact = circleRectContact(50, 5, 8, { x: 0, y: 10, w: 100, h: 20 });
    assert.ok(contact);
    assert.equal(contact.ny, -1);
    assert.equal(circleRectContact(50, -20, 8, { x: 0, y: 10, w: 100, h: 20 }), null);
  });

  it('never leaves the ball travelling nearly horizontally', () => {
    const state = playing();
    const ball = freeBall(state, { vx: 400, vy: 1 });
    const speed = speedOf(ball);
    enforceMinVertical(ball);
    assert.ok(Math.abs(ball.vy) >= speed * 0.28 - 1e-6);
    assert.ok(Math.abs(speedOf(ball) - speed) < 1e-6);
  });

  it('does not tunnel through a block at max frame time', () => {
    const state = playing();
    state.level.baseSpeed = 720;
    const block = state.blocks[state.blocks.length - 1];
    const ball = freeBall(state, { x: block.x + block.w / 2, y: block.y + block.h + 20, vy: -720 });
    stepGame(state, idle, MAX_FRAME_DT, never);
    assert.ok(ball.vy > 0, 'ball should bounce back down');
  });
});

describe('Ball Bounce — scoring and blocks', () => {
  it('breaks blocks, scores with the combo multiplier and grows the combo', () => {
    const state = playing();
    const block = state.blocks[state.blocks.length - 1];
    state.score.combo = 7;
    freeBall(state, { x: block.x + block.w / 2, y: block.y + block.h + 6, vy: -300 });
    const events = stepGame(state, idle, 1 / 60, never);
    const broken = events.find((e) => e.type === 'block-break');
    assert.ok(broken);
    assert.equal(state.score.combo, 8);
    assert.equal(state.score.score, 10 * block.maxHp * comboMultiplier(8));
  });

  it('tough blocks take multiple hits', () => {
    const state = playing();
    const block = state.blocks[state.blocks.length - 1];
    block.hp = 2;
    block.maxHp = 2;
    freeBall(state, { x: block.x + block.w / 2, y: block.y + block.h + 6, vy: -300 });
    const events = stepGame(state, idle, 1 / 60, never);
    assert.ok(events.some((e) => e.type === 'block-hit'));
    assert.equal(block.hp, 1);
  });

  it('later levels have more rows and tougher blocks', () => {
    assert.ok(rowsForLevel(5) > rowsForLevel(1));
    assert.ok(maxHpForLevel(7) > maxHpForLevel(1));
    const { blocks } = buildLevelBlocks(7, 600, 1);
    assert.ok(blocks.some((b) => b.maxHp > 1));
  });

  it('ramps ball speed within a level as blocks clear', () => {
    const state = playing();
    const start = currentBallSpeed(state);
    state.blocks = state.blocks.slice(0, Math.floor(state.blocks.length / 2));
    assert.ok(currentBallSpeed(state) > start);
  });

  it('clears the level, then loads a faster next level', () => {
    const state = playing();
    const speed1 = state.level.baseSpeed;
    state.blocks = [];
    const events = stepGame(state, idle, 1 / 60);
    assert.ok(events.some((e) => e.type === 'level-clear'));
    assert.equal(state.status, 'level-clear');
    for (let i = 0; i < 80; i++) stepGame(state, idle, MAX_FRAME_DT);
    assert.equal(state.status, 'playing');
    assert.equal(state.level.number, 2);
    assert.ok(state.level.baseSpeed > speed1);
    assert.ok(state.blocks.length > 0);
  });
});

describe('Ball Bounce — lives and game over', () => {
  it('loses a life and resets combo when the last ball falls', () => {
    const state = playing();
    state.score.combo = 9;
    freeBall(state, { y: WORLD_HEIGHT + 20, vy: 300 });
    const events = stepGame(state, idle, 1 / 60);
    assert.ok(events.some((e) => e.type === 'life-lost'));
    assert.equal(state.player.lives, STARTING_LIVES - 1);
    assert.equal(state.score.combo, 0);
    assert.ok(state.balls[0].stuck);
  });

  it('ends the game when all lives are gone and records the high score', () => {
    const state = playing();
    state.player.lives = 1;
    state.score.score = 500;
    freeBall(state, { y: WORLD_HEIGHT + 20, vy: 300 });
    const events = stepGame(state, idle, 1 / 60);
    assert.ok(events.some((e) => e.type === 'game-over'));
    assert.equal(state.status, 'over');
    assert.equal(toHud(state).highScore, 500);
    assert.ok(toHud(state).isNewHighScore);
  });

  it('keeps the high score on restart', () => {
    const state = playing();
    state.score.score = 900;
    stepGame(state, idle, 1 / 60);
    const next = startGame(state);
    assert.equal(next.score.score, 0);
    assert.equal(next.score.highScore, 900);
  });
});

describe('Ball Bounce — power-ups', () => {
  it('picks kinds by weight', () => {
    assert.equal(pickPowerUpKind(0), 'wide');
    assert.equal(pickPowerUpKind(0.999), 'life');
  });

  it('widens the paddle smoothly', () => {
    const state = playing();
    applyPowerUp(state, 'wide', () => {});
    for (let i = 0; i < 30; i++) stepGame(state, idle, MAX_FRAME_DT, never);
    assert.ok(state.player.paddle.width > PADDLE_WIDTH * 1.4);
  });

  it('multi-ball splits up to the cap', () => {
    const state = playing();
    freeBall(state, {});
    applyPowerUp(state, 'multi', () => {});
    assert.equal(state.balls.length, 3);
    applyPowerUp(state, 'multi', () => {});
    assert.equal(state.balls.length, MAX_BALLS);
  });

  it('extra life is capped', () => {
    const state = playing();
    state.player.lives = MAX_LIVES;
    applyPowerUp(state, 'life', () => {});
    assert.equal(state.player.lives, MAX_LIVES);
    assert.ok(state.score.score > 0);
  });

  it('slow motion moves the ball less per frame', () => {
    const a = playing();
    const b = playing();
    a.blocks = b.blocks = [];
    a.level.totalBlocks = b.level.totalBlocks = 0;
    const ballA = freeBall(a, { y: 500, vy: -300 });
    const ballB = freeBall(b, { y: 500, vy: -300 });
    applyPowerUp(b, 'slow', () => {});
    stepGame(a, idle, 1 / 60);
    stepGame(b, idle, 1 / 60);
    assert.ok(500 - ballB.y < 500 - ballA.y);
  });
});

describe('Ball Bounce — pause and resize', () => {
  it('freezes while paused and resumes to the prior status', () => {
    const state = startGame(createInitialState(0, 600));
    pauseGame(state);
    assert.equal(state.status, 'paused');
    const before = state.countdown;
    stepGame(state, idle, MAX_FRAME_DT);
    assert.equal(state.countdown, before);
    resumeGame(state);
    assert.equal(state.status, 'countdown');
  });

  it('rescales horizontal positions on resize', () => {
    const state = playing();
    const lastBlock = state.blocks[state.blocks.length - 1];
    const right = lastBlock.x + lastBlock.w;
    resizeWorld(state, 900);
    assert.equal(state.world.width, 900);
    assert.ok(Math.abs(lastBlock.x + lastBlock.w - right * 1.5) < 1e-6);
    assert.ok(state.player.paddle.x <= 900 - state.player.paddle.width / 2);
  });
});
