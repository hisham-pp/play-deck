import type { BaseGameEngine } from '@playdeck/game-types';
import type { Direction, SnakeAction, SnakeDifficulty, SnakeState } from '../types/snake.types';
import { GRID_SIZE, STATUS_GAME_OVER } from './snake-constants';
import { snakeReducer } from './snake-reducer';
import { createInitialSnakeState } from './snake-state';

export class SnakeEngine implements BaseGameEngine<SnakeState, SnakeAction> {
  private state: SnakeState;
  private listeners: Set<(state: SnakeState) => void> = new Set();

  constructor(initialHighScore: number = 0, gridSize: number = GRID_SIZE) {
    this.state = createInitialSnakeState(initialHighScore, gridSize);
  }

  getState(): SnakeState {
    return this.state;
  }

  dispatch(action: SnakeAction): void {
    this.state = snakeReducer(this.state, action);
    this.notify();
  }

  subscribe(listener: (state: SnakeState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.dispatch({ type: 'RESTART' });
  }

  start(): void {
    this.dispatch({ type: 'START' });
  }

  countdownTick(): void {
    this.dispatch({ type: 'COUNTDOWN_TICK' });
  }

  tick(): void {
    this.dispatch({ type: 'TICK' });
  }

  pause(): void {
    this.dispatch({ type: 'PAUSE' });
  }

  resume(): void {
    this.dispatch({ type: 'RESUME' });
  }

  restart(): void {
    this.dispatch({ type: 'RESTART' });
  }

  changeDirection(direction: Direction): void {
    this.dispatch({ type: 'CHANGE_DIRECTION', direction });
  }

  setHighScore(highScore: number): void {
    this.dispatch({ type: 'SET_HIGH_SCORE', highScore });
  }

  configure(gridSize: number, baseSpeedMs: number, difficulty: SnakeDifficulty): void {
    this.dispatch({ type: 'CONFIGURE', gridSize, baseSpeedMs, difficulty });
  }

  isGameOver(): boolean {
    return this.state.status === STATUS_GAME_OVER;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
