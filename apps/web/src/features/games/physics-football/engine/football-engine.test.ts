import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createInitialFootballState,
  getFootballBotAction,
  resetKickoffPositions,
  resolveCircleCollision,
  stepFootballGame,
  PITCH_HEIGHT,
  PITCH_PADDING_X,
  PITCH_WIDTH,
} from './football-engine';

describe('Physics Football Engine', () => {
  describe('Match Initialization & Kickoff', () => {
    it('initializes in kickoff state with ball centered and players on their halves', () => {
      const state = createInitialFootballState('Player 1', 'StrikerBot', true, 3, 90);
      assert.equal(state.status, 'kickoff');
      assert.equal(state.blueScore, 0);
      assert.equal(state.redScore, 0);
      assert.equal(state.ball.x, PITCH_WIDTH * 0.5);
      assert.equal(state.ball.y, PITCH_HEIGHT * 0.5);

      // Blue player is on left half (x < center), Red player is on right half (x > center)
      assert.ok(state.players[0].x < PITCH_WIDTH * 0.5);
      assert.ok(state.players[1].x > PITCH_WIDTH * 0.5);
    });

    it('transitions from kickoff into playing after stateTimerSec expires', () => {
      const state = createInitialFootballState();
      state.stateTimerSec = 0.05;

      const nextState = stepFootballGame(state, {}, 0.1);
      assert.equal(nextState.status, 'playing');
    });

    it('resets player and ball positions back to kickoff spots', () => {
      const state = createInitialFootballState();
      state.status = 'playing';
      state.ball.x = 100;
      state.ball.y = 80;
      state.players[0].x = 450;

      const resetState = resetKickoffPositions(state);
      assert.equal(resetState.status, 'kickoff');
      assert.equal(resetState.ball.x, PITCH_WIDTH * 0.5);
      assert.equal(resetState.players[0].x, PITCH_WIDTH * 0.28);
    });
  });

  describe('Physics & Collision Resolution', () => {
    it('resolves elastic collision between two moving bodies', () => {
      const bodyA = { x: 100, y: 100, vx: 50, vy: 0, radius: 20, mass: 2 };
      const bodyB = { x: 130, y: 100, vx: -50, vy: 0, radius: 20, mass: 2 };

      const res = resolveCircleCollision(bodyA, bodyB, 1.0);
      assert.equal(res.collided, true);
      // Bodies should separate and reverse directions along x-axis
      assert.ok(bodyA.vx < 0);
      assert.ok(bodyB.vx > 0);
    });

    it('bounces ball off top pitch wall', () => {
      const state = createInitialFootballState();
      state.status = 'playing';
      state.ball.y = 35;
      state.ball.vy = -100;

      const nextState = stepFootballGame(state, {}, 0.1);
      // vy should have reversed downwards
      assert.ok(nextState.ball.vy > 0);
    });

    it('bounces ball off non-goal side walls', () => {
      const state = createInitialFootballState();
      state.status = 'playing';
      state.ball.x = PITCH_PADDING_X + 5;
      state.ball.y = 80; // above goal mouth (y < 175)
      state.ball.vx = -120;

      const nextState = stepFootballGame(state, {}, 0.1);
      assert.ok(nextState.ball.vx > 0);
    });
  });

  describe('Player Controls & Kick Impulses', () => {
    it('accelerates player in the input direction', () => {
      const state = createInitialFootballState();
      state.status = 'playing';
      const initialVx = state.players[0].vx;

      const nextState = stepFootballGame(
        state,
        {
          p1: { moveX: 1, moveY: 0, kick: false },
        },
        0.05,
      );

      assert.ok(nextState.players[0].vx > initialVx);
    });

    it('delivers direct impulse kick to the ball when in range', () => {
      const state = createInitialFootballState();
      state.status = 'playing';
      // Place ball directly in front of player 1
      state.ball.x = state.players[0].x + state.players[0].radius + 5;
      state.ball.y = state.players[0].y;
      state.ball.vx = 0;

      const nextState = stepFootballGame(
        state,
        {
          p1: { moveX: 0, moveY: 0, kick: true },
        },
        0.05,
      );

      // Ball should launch forward with strong velocity
      assert.ok(nextState.ball.vx > 200);
      assert.equal(nextState.ball.lastTouchedBy, 'p1');
    });
  });

  describe('Goal Detection & Match Outcomes', () => {
    it('detects goal for Blue when ball crosses right goal line', () => {
      const state = createInitialFootballState();
      state.status = 'playing';
      state.ball.x = PITCH_WIDTH - PITCH_PADDING_X + 15;
      state.ball.y = 250; // Inside goal mouth (175 - 325)

      const nextState = stepFootballGame(state, {}, 0.05);
      assert.equal(nextState.blueScore, 1);
      assert.equal(nextState.lastScorer, 'blue');
      assert.equal(nextState.status, 'goal_scored');
    });

    it('detects goal for Red when ball crosses left goal line', () => {
      const state = createInitialFootballState();
      state.status = 'playing';
      state.ball.x = PITCH_PADDING_X - 15;
      state.ball.y = 250;

      const nextState = stepFootballGame(state, {}, 0.05);
      assert.equal(nextState.redScore, 1);
      assert.equal(nextState.lastScorer, 'red');
      assert.equal(nextState.status, 'goal_scored');
    });

    it('declares champion when target score is achieved', () => {
      const state = createInitialFootballState();
      state.status = 'goal_scored';
      state.blueScore = 3;
      state.targetScore = 3;
      state.stateTimerSec = 0.01;

      const nextState = stepFootballGame(state, {}, 0.05);
      assert.equal(nextState.status, 'game_over');
      assert.equal(nextState.winnerTeam, 'blue');
    });
  });

  describe('Bot AI Logic', () => {
    it('generates steering actions toward ball and triggers kick when close', () => {
      const state = createInitialFootballState();
      state.status = 'playing';
      const bot = state.players[1]; // Red bot

      // Put ball directly in front of Red bot
      state.ball.x = bot.x - bot.radius - 8;
      state.ball.y = bot.y;

      const action = getFootballBotAction(bot, state);
      // Bot is moving towards ball (moveX < 0) and kicking
      assert.ok(action.moveX < 0);
      assert.equal(action.kick, true);
    });
  });
});
