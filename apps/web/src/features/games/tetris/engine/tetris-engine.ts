import type { BaseGameEngine } from '@playdeck/game-types';
import type { TetrisAction, TetrisState } from '../types/tetris.types';
import { STATUS_GAME_OVER } from './tetris-constants';
import { tetrisReducer } from './tetris-reducer';
import { createInitialTetrisState } from './tetris-state';

export class TetrisEngine implements BaseGameEngine<TetrisState, TetrisAction> {
  private state: TetrisState;
  private listeners: Set<(state: TetrisState) => void> = new Set();
  private readonly random: () => number;

  constructor(initialHighScore: number = 0, random: () => number = Math.random) {
    this.random = random;
    this.state = createInitialTetrisState(initialHighScore, random);
  }

  getState(): TetrisState {
    return this.state;
  }

  dispatch(action: TetrisAction): void {
    this.state = tetrisReducer(this.state, action, this.random);
    this.notify();
  }

  subscribe(listener: (state: TetrisState) => void): () => void {
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

  moveLeft(): void {
    this.dispatch({ type: 'MOVE_LEFT' });
  }

  moveRight(): void {
    this.dispatch({ type: 'MOVE_RIGHT' });
  }

  softDrop(): void {
    this.dispatch({ type: 'SOFT_DROP' });
  }

  hardDrop(): void {
    this.dispatch({ type: 'HARD_DROP' });
  }

  rotateClockwise(): void {
    this.dispatch({ type: 'ROTATE_CW' });
  }

  rotateCounterClockwise(): void {
    this.dispatch({ type: 'ROTATE_CCW' });
  }

  hold(): void {
    this.dispatch({ type: 'HOLD' });
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

  setHighScore(highScore: number): void {
    this.dispatch({ type: 'SET_HIGH_SCORE', highScore });
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
