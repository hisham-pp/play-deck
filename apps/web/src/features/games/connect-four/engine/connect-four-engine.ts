import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  AIDifficulty,
  ConnectFourAction,
  ConnectFourDisc,
  ConnectFourState,
  GameMode,
} from '../types/connect-four.types';
import { computeAIMove } from './connect-four-ai';
import {
  COLS,
  DIFFICULTY_MEDIUM,
  DISC_RED,
  MODE_LOCAL_2P,
  STATUS_PLAYING,
} from './connect-four-constants';
import { connectFourReducer } from './connect-four-reducer';
import { createInitialConnectFourState } from './connect-four-state';
import { getOpponentDisc, isColumnFull } from './connect-four-utils';

export class ConnectFourEngine implements BaseGameEngine<ConnectFourState, ConnectFourAction> {
  private state: ConnectFourState;
  private listeners: Set<(state: ConnectFourState) => void> = new Set();

  constructor(
    mode: GameMode = MODE_LOCAL_2P,
    difficulty: AIDifficulty = DIFFICULTY_MEDIUM,
    startingPlayer: ConnectFourDisc = DISC_RED,
    humanPlayerDisc: ConnectFourDisc = DISC_RED,
  ) {
    this.state = createInitialConnectFourState(mode, difficulty, startingPlayer, humanPlayerDisc);
  }

  getState(): ConnectFourState {
    return this.state;
  }

  dispatch(action: ConnectFourAction): void {
    this.state = connectFourReducer(this.state, action);
    this.notify();
  }

  subscribe(listener: (state: ConnectFourState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.resetMatch();
  }

  destroy(): void {
    this.listeners.clear();
  }

  /**
   * Attempts to drop a piece into the specified column (0-6).
   * Returns true if the move was valid and accepted, false otherwise.
   */
  dropPiece(column: number, player?: ConnectFourDisc): boolean {
    if (this.state.status !== STATUS_PLAYING) return false;
    if (column < 0 || column >= COLS) return false;
    if (isColumnFull(this.state.board, column)) return false;
    if (player && player !== this.state.turn) return false;

    this.dispatch({ type: 'DROP_PIECE', column, player });
    return true;
  }

  /**
   * Directly executes an AI move synchronously based on current board state and AI difficulty.
   * In unit tests and headless simulations, this can be called synchronously.
   */
  triggerAIMoveSynchronously(): number {
    if (this.state.status !== STATUS_PLAYING) return -1;

    const aiDisc = getOpponentDisc(this.state.humanPlayerDisc);
    if (this.state.turn !== aiDisc) return -1;

    const chosenColumn = computeAIMove(this.state.board, aiDisc, this.state.aiDifficulty);
    if (chosenColumn >= 0) {
      this.dropPiece(chosenColumn, aiDisc);
    }
    return chosenColumn;
  }

  setMode(mode: GameMode): void {
    this.dispatch({ type: 'SET_MODE', mode });
  }

  setDifficulty(difficulty: AIDifficulty): void {
    this.dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }

  setHumanDisc(disc: ConnectFourDisc): void {
    this.dispatch({ type: 'SET_HUMAN_DISC', disc });
  }

  resetRound(): void {
    this.dispatch({ type: 'RESET_ROUND' });
  }

  resetMatch(): void {
    this.dispatch({ type: 'RESET_MATCH' });
  }

  setAiThinking(thinking: boolean): void {
    this.dispatch({ type: 'SET_AI_THINKING', thinking });
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
