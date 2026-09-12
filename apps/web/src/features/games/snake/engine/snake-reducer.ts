import type { Coordinate, Direction, SnakeAction, SnakeState } from '../types/snake.types';
import {
  COUNTDOWN_SECONDS,
  DIRECTION_VECTORS,
  MAX_PENDING_DIRECTIONS,
  OPPOSITE_DIRECTIONS,
  POINTS_PER_FOOD,
  STATUS_COUNTDOWN,
  STATUS_GAME_OVER,
  STATUS_IDLE,
  STATUS_PAUSED,
  STATUS_PLAYING,
} from './snake-constants';
import { createInitialSnakeState } from './snake-state';
import {
  calculateSpeed,
  isSelfCollision,
  isValidDirectionChange,
  isWallCollision,
  spawnFood,
} from './snake-utils';

export function handleDirectionChange(state: SnakeState, nextDir: Direction): SnakeState {
  if (
    state.status !== STATUS_PLAYING &&
    state.status !== STATUS_COUNTDOWN &&
    state.status !== STATUS_IDLE
  ) {
    return state;
  }

  const lastDir =
    state.pendingDirections.length > 0
      ? state.pendingDirections[state.pendingDirections.length - 1]
      : state.direction;

  if (!isValidDirectionChange(lastDir, nextDir, OPPOSITE_DIRECTIONS)) {
    return state;
  }

  if (state.pendingDirections.length >= MAX_PENDING_DIRECTIONS) {
    return state;
  }

  return {
    ...state,
    pendingDirections: [...state.pendingDirections, nextDir],
  };
}

export function advanceSnakeTick(state: SnakeState): SnakeState {
  if (state.status !== STATUS_PLAYING) {
    return state;
  }

  const activeDirection = state.pendingDirections[0] ?? state.direction;
  const remainingPending =
    state.pendingDirections.length > 0 ? state.pendingDirections.slice(1) : [];

  const vector = DIRECTION_VECTORS[activeDirection];
  const head = state.snake[0];
  const newHead: Coordinate = { x: head.x + vector.x, y: head.y + vector.y };

  if (isWallCollision(newHead, state.gridSize)) {
    return { ...state, status: STATUS_GAME_OVER };
  }

  const isEating = newHead.x === state.food.x && newHead.y === state.food.y;
  const collisionBody = isEating ? state.snake : state.snake.slice(0, -1);

  if (isSelfCollision(newHead, collisionBody)) {
    return { ...state, status: STATUS_GAME_OVER };
  }

  if (isEating) {
    const newSnake = [newHead, ...state.snake];
    const newScore = state.score + POINTS_PER_FOOD;
    const newHighScore = Math.max(state.highScore, newScore);
    const isNewHighScore = newScore > state.highScore;
    const nextFood = spawnFood(newSnake, state.gridSize);

    return {
      ...state,
      snake: newSnake,
      direction: activeDirection,
      pendingDirections: remainingPending,
      food: nextFood,
      score: newScore,
      highScore: newHighScore,
      isNewHighScore,
      speedMs: calculateSpeed(newScore, state.baseSpeedMs),
      status: nextFood.x === -1 ? STATUS_GAME_OVER : state.status,
    };
  }

  return {
    ...state,
    snake: [newHead, ...state.snake.slice(0, -1)],
    direction: activeDirection,
    pendingDirections: remainingPending,
  };
}

export function snakeReducer(state: SnakeState, action: SnakeAction): SnakeState {
  switch (action.type) {
    case 'START':
      return { ...state, status: STATUS_COUNTDOWN, countdown: COUNTDOWN_SECONDS };

    case 'COUNTDOWN_TICK':
      if (state.countdown <= 1) {
        return { ...state, status: STATUS_PLAYING, countdown: 0 };
      }
      return { ...state, countdown: state.countdown - 1 };

    case 'TICK':
      return advanceSnakeTick(state);

    case 'CHANGE_DIRECTION':
      return handleDirectionChange(state, action.direction);

    case 'PAUSE':
      return state.status === STATUS_PLAYING ? { ...state, status: STATUS_PAUSED } : state;

    case 'RESUME':
      return state.status === STATUS_PAUSED ? { ...state, status: STATUS_PLAYING } : state;

    case 'RESTART':
      return {
        ...createInitialSnakeState(
          state.highScore,
          state.gridSize,
          state.baseSpeedMs,
          state.difficulty,
        ),
        status: STATUS_COUNTDOWN,
      };

    case 'CONFIGURE':
      return {
        ...createInitialSnakeState(
          state.highScore,
          action.gridSize,
          action.baseSpeedMs,
          action.difficulty,
        ),
        status: STATUS_IDLE,
      };

    case 'SET_HIGH_SCORE':
      return { ...state, highScore: Math.max(state.highScore, action.highScore) };

    default:
      return state;
  }
}
