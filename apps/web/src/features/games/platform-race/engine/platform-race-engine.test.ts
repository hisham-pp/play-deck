import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createDefaultCourse,
  createInitialPlatformRaceState,
  getBotRaceAction,
  stepPlatformRace,
  updateMovingPlatforms,
  COURSE_WIDTH,
  PLAYER_HEIGHT,
} from './platform-race-engine';

describe('Platform Race Engine', () => {
  describe('Course Generation & Setup', () => {
    it('creates standard course with platforms, hazards, springs, and checkpoints', () => {
      const course = createDefaultCourse();
      assert.equal(course.width, COURSE_WIDTH);
      assert.ok(course.platforms.length >= 8);
      assert.ok(course.springs.length >= 3);
      assert.ok(course.boostPads.length >= 2);
      assert.ok(course.checkpoints.length >= 3);
      assert.ok(course.finishLineX > 2800);
    });

    it('initializes racers in countdown state', () => {
      const state = createInitialPlatformRaceState();
      assert.equal(state.status, 'countdown');
      assert.equal(state.players.length, 4);
      assert.equal(state.winners.length, 0);
      assert.equal(state.players[0].isAi, false);
      assert.equal(state.players[1].isAi, true);
    });

    it('updates moving platforms periodically with race time', () => {
      const course = createDefaultCourse();
      const movingH = course.platforms.find((p) => p.type === 'moving_h')!;
      const originalX = movingH.x;

      const updated = updateMovingPlatforms(course.platforms, 1.5);
      const updatedMovingH = updated.find((p) => p.id === movingH.id)!;
      assert.notEqual(updatedMovingH.x, originalX);
    });
  });

  describe('Player Movement & Physics', () => {
    it('transitions from countdown to racing when countdown timer elapses', () => {
      const state = createInitialPlatformRaceState();
      state.countdownSec = 0.05;

      const nextState = stepPlatformRace(state, {}, 0.1);
      assert.equal(nextState.status, 'racing');
    });

    it('accelerates player rightward when moveRight is active', () => {
      const state = createInitialPlatformRaceState();
      state.status = 'racing';

      const initialVx = state.players[0].vx;
      const nextState = stepPlatformRace(
        state,
        {
          racer_1: { moveLeft: false, moveRight: true, jump: false },
        },
        0.05,
      );

      assert.ok(nextState.players[0].vx > initialVx);
      assert.equal(nextState.players[0].facing, 'right');
    });

    it('executes ground jump and mid-air double jump', () => {
      const state = createInitialPlatformRaceState();
      state.status = 'racing';
      state.players[0].isGrounded = true;

      // Jump 1
      const jump1State = stepPlatformRace(
        state,
        {
          racer_1: { moveLeft: false, moveRight: false, jump: true },
        },
        0.02,
      );

      assert.ok(jump1State.players[0].vy < -400);
      assert.equal(jump1State.players[0].isGrounded, false);
      assert.equal(jump1State.players[0].canDoubleJump, true);

      // Jump 2 (Double Jump in mid-air)
      const jump2State = stepPlatformRace(
        jump1State,
        {
          racer_1: { moveLeft: false, moveRight: false, jump: true },
        },
        0.02,
      );

      assert.ok(jump2State.players[0].vy < 0);
      assert.equal(jump2State.players[0].canDoubleJump, false);
    });
  });

  describe('Interactive Course Elements', () => {
    it('launches player into the air on spring pad contact', () => {
      const state = createInitialPlatformRaceState();
      state.status = 'racing';
      const spring = state.course.springs[0];

      // Place player on top of spring
      state.players[0].x = spring.x + 5;
      state.players[0].y = spring.y - PLAYER_HEIGHT + 2;

      const nextState = stepPlatformRace(state, {}, 0.02);
      assert.equal(nextState.players[0].vy, spring.power);
    });

    it('boosts player forward on boost pad contact', () => {
      const state = createInitialPlatformRaceState();
      state.status = 'racing';
      const boost = state.course.boostPads[0];

      state.players[0].x = boost.x + 5;
      state.players[0].y = boost.y - PLAYER_HEIGHT + 2;

      const nextState = stepPlatformRace(state, {}, 0.02);
      assert.ok(nextState.players[0].vx >= boost.boostVelocity);
      assert.ok(nextState.players[0].boostTimer > 0);
    });

    it('respawns player at last checkpoint when falling into hazard pit', () => {
      const state = createInitialPlatformRaceState();
      state.status = 'racing';
      state.players[0].respawnX = 500;
      state.players[0].respawnY = 300;

      // Drop player deep into bottom hazard pit
      state.players[0].y = 590;

      const nextState = stepPlatformRace(state, {}, 0.02);
      assert.equal(nextState.players[0].x, 500);
      assert.equal(nextState.players[0].y, 300);
    });

    it('updates respawn coordinates when crossing a checkpoint', () => {
      const state = createInitialPlatformRaceState();
      state.status = 'racing';
      const cp1 = state.course.checkpoints[1];

      state.players[0].x = cp1.x + 2;
      state.players[0].y = cp1.y + 10;

      const nextState = stepPlatformRace(state, {}, 0.02);
      assert.equal(nextState.players[0].lastCheckpointIndex, 1);
      assert.ok(nextState.players[0].respawnX > cp1.x);
    });
  });

  describe('Finish Line & AI Bot Decision', () => {
    it('records finish time and rank when crossing finish line', () => {
      const state = createInitialPlatformRaceState();
      state.status = 'racing';
      state.players[0].x = state.course.finishLineX + 5;

      const nextState = stepPlatformRace(state, {}, 0.02);
      assert.equal(nextState.players[0].finished, true);
      assert.equal(nextState.players[0].rank, 1);
      assert.equal(nextState.winners[0], 'racer_1');
    });

    it('bot AI triggers jump when approaching gaps or hazards ahead', () => {
      const state = createInitialPlatformRaceState();
      state.status = 'racing';
      const bot = state.players[1];

      // Place bot on island ledge near edge with no ground ahead
      bot.x = 440; // End of start platform is 450
      bot.y = 520 - PLAYER_HEIGHT;
      bot.isGrounded = true;

      const action = getBotRaceAction(bot, state);
      assert.equal(action.moveRight, true);
      assert.equal(action.jump, true);
    });
  });
});
