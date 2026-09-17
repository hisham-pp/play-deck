import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeAiInput, predictBallY } from './pong-ai';
import {
  BALL_RADIUS,
  PADDLE_HEIGHT,
  PADDLE_OFFSET_X,
  PADDLE_WIDTH,
  PONG_ARENA_HEIGHT,
  PONG_ARENA_WIDTH,
} from './pong-constants';
import {
  createInitialPongState,
  createPaddle,
  pausePongGame,
  restartPongGame,
  startOrResumePong,
  stepPongGame,
} from './pong-engine';
import { clamp, updateBallPhysics, updatePaddlePosition } from './pong-physics';
import type { Ball, Paddle, PongInputs } from './pong-types';

describe('Pong Engine — Math & Utilities', () => {
  it('clamps values correctly within bounds', () => {
    assert.equal(clamp(5, 0, 10), 5);
    assert.equal(clamp(-5, 0, 10), 0);
    assert.equal(clamp(15, 0, 10), 10);
  });
});

describe('Pong Engine — Paddle Movement', () => {
  it('moves paddle up when up input is active', () => {
    const paddle = createPaddle(PADDLE_OFFSET_X);
    const initialY = paddle.y;
    const updated = updatePaddlePosition(paddle, { up: true, down: false }, 500, 0.05);

    assert.equal(updated.y, initialY - 500 * 0.05);
    assert.equal(updated.vy, -500);
  });

  it('moves paddle down when down input is active', () => {
    const paddle = createPaddle(PADDLE_OFFSET_X);
    const initialY = paddle.y;
    const updated = updatePaddlePosition(paddle, { up: false, down: true }, 500, 0.05);

    assert.equal(updated.y, initialY + 500 * 0.05);
    assert.equal(updated.vy, 500);
  });

  it('clamps paddle within arena height', () => {
    const paddle = createPaddle(PADDLE_OFFSET_X);
    // Move up excessively
    const clampedTop = updatePaddlePosition(paddle, { up: true, down: false }, 5000, 1.0);
    assert.equal(clampedTop.y, 0);

    // Move down excessively
    const clampedBottom = updatePaddlePosition(paddle, { up: false, down: true }, 5000, 1.0);
    assert.equal(clampedBottom.y, PONG_ARENA_HEIGHT - PADDLE_HEIGHT);
  });

  it('moves smoothly towards targetY when provided', () => {
    const paddle = createPaddle(PADDLE_OFFSET_X);
    const targetY = 300;
    const updated = updatePaddlePosition(paddle, { up: false, down: false, targetY }, 400, 0.1);

    // Desired Y is targetY - paddle.height / 2
    const desiredY = targetY - paddle.height / 2;
    assert(Math.abs(updated.y - (paddle.y + 400 * 0.1)) < 0.01 || updated.y === desiredY);
  });
});

describe('Pong Engine — Ball Physics & Collisions', () => {
  const dummyP1: Paddle = {
    x: PADDLE_OFFSET_X,
    y: 200,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    vy: 0,
    score: 0,
  };
  const dummyP2: Paddle = {
    x: PONG_ARENA_WIDTH - PADDLE_OFFSET_X - PADDLE_WIDTH,
    y: 200,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    vy: 0,
    score: 0,
  };

  it('bounces off top wall and inverts vy', () => {
    const ball: Ball = {
      x: 400,
      y: 4,
      radius: BALL_RADIUS,
      vx: 200,
      vy: -300,
      speed: 360,
    };

    const { ball: nextBall, events } = updateBallPhysics(ball, dummyP1, dummyP2, 0, 0.016);
    assert(nextBall.vy > 0);
    assert.equal(events.filter((e) => e.type === 'wall-hit').length, 1);
  });

  it('bounces off bottom wall and inverts vy', () => {
    const ball: Ball = {
      x: 400,
      y: PONG_ARENA_HEIGHT - 4,
      radius: BALL_RADIUS,
      vx: 200,
      vy: 300,
      speed: 360,
    };

    const { ball: nextBall, events } = updateBallPhysics(ball, dummyP1, dummyP2, 0, 0.016);
    assert(nextBall.vy < 0);
    assert.equal(events.filter((e) => e.type === 'wall-hit').length, 1);
  });

  it('detects collision with left paddle (P1), increments rally, and reflects rightward', () => {
    const p1FaceX = dummyP1.x + dummyP1.width;
    const ball: Ball = {
      x: p1FaceX + 5,
      y: dummyP1.y + dummyP1.height / 2, // center hit
      radius: BALL_RADIUS,
      vx: -400,
      vy: 0,
      speed: 400,
    };

    const { ball: nextBall, rally, events } = updateBallPhysics(ball, dummyP1, dummyP2, 0, 0.02);

    assert(nextBall.vx > 0, 'Ball velocity should reflect rightward');
    assert.equal(rally, 1);
    const hitEvent = events.find((e) => e.type === 'paddle-hit');
    assert(hitEvent !== undefined);
    assert.equal(hitEvent.side, 'left');
  });

  it('deflects at an angle when hitting the edge of a paddle', () => {
    const p1FaceX = dummyP1.x + dummyP1.width;
    // Hit near the bottom edge
    const ball: Ball = {
      x: p1FaceX + 3,
      y: dummyP1.y + dummyP1.height - 5,
      radius: BALL_RADIUS,
      vx: -400,
      vy: 0,
      speed: 400,
    };

    const { ball: nextBall } = updateBallPhysics(ball, dummyP1, dummyP2, 0, 0.02);
    assert(nextBall.vy > 0, 'Should deflect downward when hitting lower half');
    assert(nextBall.vx > 0);
  });

  it('detects collision with right paddle (P2), increments rally, and reflects leftward', () => {
    const p2FaceX = dummyP2.x;
    const ball: Ball = {
      x: p2FaceX - 3,
      y: dummyP2.y + dummyP2.height / 2,
      radius: BALL_RADIUS,
      vx: 400,
      vy: 0,
      speed: 400,
    };

    const { ball: nextBall, rally, events } = updateBallPhysics(ball, dummyP1, dummyP2, 3, 0.02);

    assert(nextBall.vx < 0, 'Ball velocity should reflect leftward');
    assert.equal(rally, 4);
    const hitEvent = events.find((e) => e.type === 'paddle-hit');
    assert(hitEvent !== undefined);
    assert.equal(hitEvent.side, 'right');
  });

  it('emits point-scored for right player when ball passes left boundary', () => {
    const ball: Ball = {
      x: 0,
      y: 50, // missed the paddle
      radius: BALL_RADIUS,
      vx: -500,
      vy: 0,
      speed: 500,
    };

    const { events } = updateBallPhysics(ball, dummyP1, dummyP2, 2, 0.05);
    const scoreEvent = events.find((e) => e.type === 'point-scored');
    assert(scoreEvent !== undefined);
    assert.equal(scoreEvent.scorer, 'right');
  });
});

describe('Pong Engine — AI Trajectory Prediction', () => {
  it('predicts straight trajectory without bounces correctly', () => {
    const ball: Ball = {
      x: 200,
      y: 250,
      radius: BALL_RADIUS,
      vx: 500,
      vy: 0,
      speed: 500,
    };
    const targetX = 700;
    const predicted = predictBallY(ball, targetX);
    assert.equal(predicted, 250);
  });

  it('predicts trajectory with ceiling bounce accurately', () => {
    const ball: Ball = {
      x: 400,
      y: 100,
      radius: BALL_RADIUS,
      vx: 400,
      vy: -400, // moving up towards ceiling
      speed: 565,
    };
    const targetX = 600; // time = 0.5s. Unbounded Y = 100 - 200 = -100.
    const predicted = predictBallY(ball, targetX, 500);
    assert(predicted > 0 && predicted < 500);
  });

  it('returns center of court when ball is moving away from AI', () => {
    const ball: Ball = {
      x: 400,
      y: 100,
      radius: BALL_RADIUS,
      vx: -400, // moving left away from AI
      vy: 0,
      speed: 400,
    };
    const predicted = predictBallY(ball, 750, 500);
    assert.equal(predicted, 250);
  });

  it('computes AI inputs based on difficulty presets', () => {
    const paddle = createPaddle(750);
    const ball: Ball = {
      x: 500,
      y: 150,
      radius: BALL_RADIUS,
      vx: 400,
      vy: 0,
      speed: 400,
    };

    // Easy AI with zero jitter
    const easyInput = computeAiInput(paddle, ball, 'easy', 800, 500, 0);
    assert(easyInput.up || easyInput.down || easyInput.targetY !== null);

    // Hard AI
    const hardInput = computeAiInput(paddle, ball, 'hard', 800, 500, 0);
    assert(hardInput.targetY !== null);
  });
});

describe('Pong Engine — Game Flow, Scoring, and Win Condition', () => {
  const emptyInputs: PongInputs = {
    player1: { up: false, down: false },
    player2: { up: false, down: false },
  };

  it('initializes in ready state with serve pending', () => {
    const state = createInitialPongState({ winningScore: 5 });
    assert.equal(state.status, 'ready');
    assert.equal(state.servePending, true);
    assert.equal(state.player1.score, 0);
    assert.equal(state.player2.score, 0);
  });

  it('starts and transitions to playing state', () => {
    const readyState = createInitialPongState();
    const playingState = startOrResumePong(readyState);
    assert.equal(playingState.status, 'playing');
  });

  it('counts down serve delay then launches ball', () => {
    const state = startOrResumePong(createInitialPongState());
    assert.equal(state.servePending, true);

    // Step by less than serve delay
    const { state: midState } = stepPongGame(state, emptyInputs, 0.3);
    assert.equal(midState.servePending, true);

    // Step enough to finish countdown
    const { state: launchedState, events } = stepPongGame(midState, emptyInputs, 1.0);
    assert.equal(launchedState.servePending, false);
    assert(events.some((e) => e.type === 'serve-launched'));
  });

  it('handles point scored, resets ball for next serve, and keeps score', () => {
    let state = startOrResumePong(createInitialPongState({ winningScore: 7 }));
    state = { ...state, servePending: false }; // force ball active

    // Place ball so it goes out of bounds on left
    state.ball = {
      x: 2,
      y: 10,
      radius: BALL_RADIUS,
      vx: -600,
      vy: 0,
      speed: 600,
    };

    const { state: nextState, events } = stepPongGame(state, emptyInputs, 0.03);
    assert.equal(nextState.player2.score, 1);
    assert.equal(nextState.player1.score, 0);
    assert.equal(nextState.servePending, true);
    assert(events.some((e) => e.type === 'point-scored'));
  });

  it('triggers game-won when winning score is achieved', () => {
    let state = startOrResumePong(createInitialPongState({ winningScore: 3 }));
    state = {
      ...state,
      servePending: false,
      player1: { ...state.player1, score: 2 }, // one point away
    };

    // Ball out of bounds on right side -> P1 scores
    state.ball = {
      x: PONG_ARENA_WIDTH - 2,
      y: 10,
      radius: BALL_RADIUS,
      vx: 600,
      vy: 0,
      speed: 600,
    };

    const { state: finalState, events } = stepPongGame(state, emptyInputs, 0.03);
    assert.equal(finalState.status, 'game-over');
    assert.equal(finalState.player1.score, 3);
    assert.equal(finalState.winner, 'left');
    assert(events.some((e) => e.type === 'game-won' && e.winner === 'left'));
  });

  it('pauses and restarts correctly', () => {
    const state = startOrResumePong(createInitialPongState());
    const paused = pausePongGame(state);
    assert.equal(paused.status, 'paused');

    const resumed = startOrResumePong(paused);
    assert.equal(resumed.status, 'playing');

    const restarted = restartPongGame(resumed, { winningScore: 11 });
    assert.equal(restarted.status, 'playing');
    assert.equal(restarted.config.winningScore, 11);
    assert.equal(restarted.player1.score, 0);
  });
});
