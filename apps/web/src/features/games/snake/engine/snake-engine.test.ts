import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { Coordinate, SnakeState } from '../types/snake.types';
import {
  BASE_SPEED_MS,
  GRID_SIZE,
  MIN_SPEED_MS,
  POINTS_PER_FOOD,
  STATUS_COUNTDOWN,
  STATUS_GAME_OVER,
  STATUS_IDLE,
  STATUS_PAUSED,
  STATUS_PLAYING,
} from './snake-constants';
import { SnakeEngine } from './snake-engine';
import { advanceSnakeTick, handleDirectionChange, snakeReducer } from './snake-reducer';
import { createInitialSnakeState } from './snake-state';
import { calculateSpeed, isCoordInList, spawnFood } from './snake-utils';

describe('Snake Engine Tests', () => {
  describe('1. Initial State', () => {
    it('creates correct default state', () => {
      const state = createInitialSnakeState(150);
      assert.strictEqual(state.status, STATUS_IDLE);
      assert.strictEqual(state.score, 0);
      assert.strictEqual(state.highScore, 150);
      assert.strictEqual(state.direction, 'RIGHT');
      assert.strictEqual(state.snake.length, 3);
      assert.strictEqual(state.speedMs, BASE_SPEED_MS);
      assert.strictEqual(isCoordInList(state.food, state.snake), false);
      assert.ok(state.food.x >= 0 && state.food.x < GRID_SIZE);
      assert.ok(state.food.y >= 0 && state.food.y < GRID_SIZE);
    });
  });

  describe('2. Snake Movement', () => {
    it('moves one cell forward on tick', () => {
      const state = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
        snake: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ],
        direction: 'RIGHT' as const,
        food: { x: 15, y: 15 },
      };

      const nextState = advanceSnakeTick(state);
      assert.deepStrictEqual(nextState.snake[0], { x: 6, y: 5 });
      assert.deepStrictEqual(nextState.snake[1], { x: 5, y: 5 });
      assert.deepStrictEqual(nextState.snake[2], { x: 4, y: 5 });
      assert.strictEqual(nextState.snake.length, 3);
    });
  });

  describe('3. Direction Changes', () => {
    it('accepts valid perpendicular turns', () => {
      const state = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
        direction: 'RIGHT' as const,
      };

      const turnedUp = handleDirectionChange(state, 'UP');
      assert.deepStrictEqual(turnedUp.pendingDirections, ['UP']);

      const turnedDown = handleDirectionChange(state, 'DOWN');
      assert.deepStrictEqual(turnedDown.pendingDirections, ['DOWN']);
    });
  });

  describe('4. Reverse Direction Prevention', () => {
    it('ignores 180-degree immediate reverse direction', () => {
      const state = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
        direction: 'RIGHT' as const,
      };

      const ignored = handleDirectionChange(state, 'LEFT');
      assert.deepStrictEqual(ignored.pendingDirections, []);

      const movingUp = { ...state, direction: 'UP' as const };
      const ignoredDown = handleDirectionChange(movingUp, 'DOWN');
      assert.deepStrictEqual(ignoredDown.pendingDirections, []);
    });
  });

  describe('5. Fast Input Queuing', () => {
    it('buffers rapid turns sequentially across ticks without reversing', () => {
      let state: SnakeState = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
        snake: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ],
        direction: 'RIGHT' as const,
        food: { x: 19, y: 19 },
      };

      // Rapid inputs: Down then Left (valid L-turn from moving Right)
      state = handleDirectionChange(state, 'DOWN');
      state = handleDirectionChange(state, 'LEFT');
      assert.deepStrictEqual(state.pendingDirections, ['DOWN', 'LEFT']);

      // First tick consumes DOWN
      state = advanceSnakeTick(state);
      assert.strictEqual(state.direction, 'DOWN');
      assert.deepStrictEqual(state.snake[0], { x: 5, y: 6 });
      assert.deepStrictEqual(state.pendingDirections, ['LEFT']);

      // Second tick consumes LEFT
      state = advanceSnakeTick(state);
      assert.strictEqual(state.direction, 'LEFT');
      assert.deepStrictEqual(state.snake[0], { x: 4, y: 6 });
      assert.deepStrictEqual(state.pendingDirections, []);
    });
  });

  describe('6. Food Consumption & Snake Growth', () => {
    it('grows snake and increments score when consuming food', () => {
      const state = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
        snake: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ],
        direction: 'RIGHT' as const,
        food: { x: 6, y: 5 }, // Food right in front
        score: 0,
        highScore: 100,
      };

      const nextState = advanceSnakeTick(state);
      assert.strictEqual(nextState.snake.length, 4);
      assert.deepStrictEqual(nextState.snake[0], { x: 6, y: 5 });
      assert.strictEqual(nextState.score, POINTS_PER_FOOD);
      assert.notDeepStrictEqual(nextState.food, { x: 6, y: 5 });
    });
  });

  describe('7. Food Spawning', () => {
    it('never spawns food on the snake body', () => {
      const snake: Coordinate[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];
      for (let i = 0; i < 50; i++) {
        const food = spawnFood(snake, 10);
        assert.strictEqual(isCoordInList(food, snake), false);
        assert.ok(food.x >= 0 && food.x < 10);
        assert.ok(food.y >= 0 && food.y < 10);
      }
    });

    it('returns sentinel { x: -1, y: -1 } when board is completely filled', () => {
      const fullGridSnake: Coordinate[] = [];
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          fullGridSnake.push({ x, y });
        }
      }
      const food = spawnFood(fullGridSnake, 3);
      assert.deepStrictEqual(food, { x: -1, y: -1 });
    });
  });

  describe('8. Wall Collision', () => {
    it('ends game when colliding with right wall', () => {
      const state = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
        snake: [{ x: 19, y: 5 }],
        direction: 'RIGHT' as const,
        food: { x: 0, y: 0 },
      };
      const nextState = advanceSnakeTick(state);
      assert.strictEqual(nextState.status, STATUS_GAME_OVER);
    });

    it('ends game when colliding with top wall', () => {
      const state = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
        snake: [{ x: 5, y: 0 }],
        direction: 'UP' as const,
        food: { x: 0, y: 0 },
      };
      const nextState = advanceSnakeTick(state);
      assert.strictEqual(nextState.status, STATUS_GAME_OVER);
    });
  });

  describe('9. Self Collision', () => {
    it('ends game when head collides with body segment', () => {
      const state = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
        snake: [
          { x: 5, y: 5 },
          { x: 5, y: 6 },
          { x: 4, y: 6 },
          { x: 4, y: 5 },
          { x: 4, y: 4 },
        ],
        direction: 'LEFT' as const, // Head (5,5) moving LEFT hits (4,5)
        food: { x: 18, y: 18 },
      };
      const nextState = advanceSnakeTick(state);
      assert.strictEqual(nextState.status, STATUS_GAME_OVER);
    });
  });

  describe('10. Score & High Score Calculation', () => {
    it('calculates score and identifies new high score', () => {
      const state = {
        ...createInitialSnakeState(20),
        status: STATUS_PLAYING,
        snake: [{ x: 5, y: 5 }],
        direction: 'RIGHT' as const,
        food: { x: 6, y: 5 },
        score: 20,
        highScore: 20,
      };

      const nextState = advanceSnakeTick(state);
      assert.strictEqual(nextState.score, 30);
      assert.strictEqual(nextState.highScore, 30);
      assert.strictEqual(nextState.isNewHighScore, true);
    });
  });

  describe('11. Game Over Invariant', () => {
    it('does not advance tick when status is game-over', () => {
      const state = {
        ...createInitialSnakeState(0),
        status: STATUS_GAME_OVER,
        snake: [{ x: 5, y: 5 }],
      };
      const nextState = advanceSnakeTick(state);
      assert.strictEqual(nextState.status, STATUS_GAME_OVER);
      assert.deepStrictEqual(nextState.snake, state.snake);
    });
  });

  describe('12. Restart', () => {
    it('resets game state while preserving high score', () => {
      const engine = new SnakeEngine(250);
      engine.dispatch({ type: 'START' });
      engine.dispatch({ type: 'COUNTDOWN_TICK' });
      engine.dispatch({ type: 'COUNTDOWN_TICK' });
      engine.dispatch({ type: 'COUNTDOWN_TICK' });
      assert.strictEqual(engine.getState().status, STATUS_PLAYING);

      engine.restart();
      const restarted = engine.getState();
      assert.strictEqual(restarted.status, STATUS_COUNTDOWN);
      assert.strictEqual(restarted.score, 0);
      assert.strictEqual(restarted.highScore, 250);
      assert.strictEqual(restarted.snake.length, 3);
    });
  });

  describe('13. Pause and Resume', () => {
    it('pauses and resumes active game', () => {
      let state: SnakeState = {
        ...createInitialSnakeState(0),
        status: STATUS_PLAYING,
      };

      state = snakeReducer(state, { type: 'PAUSE' });
      assert.strictEqual(state.status, STATUS_PAUSED);

      state = advanceSnakeTick(state);
      assert.strictEqual(state.status, STATUS_PAUSED);

      state = snakeReducer(state, { type: 'RESUME' });
      assert.strictEqual(state.status, STATUS_PLAYING);
    });
  });

  describe('14. Speed Progression', () => {
    it('speeds up as score increases and clamps to minimum speed', () => {
      const speed0 = calculateSpeed(0);
      const speed30 = calculateSpeed(30);
      const speed60 = calculateSpeed(60);
      const speed1000 = calculateSpeed(1000);

      assert.strictEqual(speed0, BASE_SPEED_MS);
      assert.ok(speed30 < speed0);
      assert.ok(speed60 < speed30);
      assert.strictEqual(speed1000, MIN_SPEED_MS);
    });
  });
});
