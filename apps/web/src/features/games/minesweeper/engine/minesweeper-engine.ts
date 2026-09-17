import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  BoardDimensions,
  MinesweeperAction,
  MinesweeperDifficulty,
  MinesweeperState,
} from '../types/minesweeper.types';
import { DEFAULT_DIFFICULTY, STATUS_LOST, STATUS_WON } from './minesweeper-constants';
import { createInitialMinesweeperState, minesweeperReducer } from './minesweeper-reducer';

export class MinesweeperEngine implements BaseGameEngine<MinesweeperState, MinesweeperAction> {
  private state: MinesweeperState;
  private listeners: Set<(state: MinesweeperState) => void> = new Set();
  private readonly random: () => number;

  constructor(
    difficulty: MinesweeperDifficulty = DEFAULT_DIFFICULTY,
    bestTimeMs: number | null = null,
    customConfig?: BoardDimensions,
    random: () => number = Math.random,
  ) {
    this.random = random;
    this.state = createInitialMinesweeperState(difficulty, bestTimeMs, customConfig);
  }

  getState(): MinesweeperState {
    return this.state;
  }

  dispatch(action: MinesweeperAction): void {
    const next = minesweeperReducer(this.state, action, this.random);
    if (next === this.state) return;
    this.state = next;
    this.notify();
  }

  subscribe(listener: (state: MinesweeperState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.dispatch({ type: 'RESET_GAME' });
  }

  newGame(difficulty?: MinesweeperDifficulty, customConfig?: BoardDimensions): void {
    this.dispatch({ type: 'NEW_GAME', difficulty, customConfig });
  }

  revealCell(index: number): void {
    this.dispatch({ type: 'REVEAL_CELL', index });
  }

  toggleFlag(index: number): void {
    this.dispatch({ type: 'TOGGLE_FLAG', index });
  }

  chordCell(index: number): void {
    this.dispatch({ type: 'CHORD_CELL', index });
  }

  selectCell(index: number): void {
    this.dispatch({ type: 'SELECT_CELL', index });
  }

  moveSelection(rowDelta: number, colDelta: number): void {
    this.dispatch({ type: 'MOVE_SELECTION', rowDelta, colDelta });
  }

  tick(deltaMs: number): void {
    this.dispatch({ type: 'TICK', deltaMs });
  }

  setBestTime(bestTimeMs: number | null): void {
    this.dispatch({ type: 'SET_BEST_TIME', bestTimeMs });
  }

  isWon(): boolean {
    return this.state.status === STATUS_WON;
  }

  isLost(): boolean {
    return this.state.status === STATUS_LOST;
  }

  isGameOver(): boolean {
    return this.state.status === STATUS_WON || this.state.status === STATUS_LOST;
  }

  destroy(): void {
    this.listeners.clear();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
