import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  AIDifficulty,
  GameMode,
  PlayerMark,
  TicTacToeAction,
  TicTacToeState,
} from '../types/tic-tac-toe.types';
import { computeAIMove } from './tic-tac-toe-ai';
import { DIFFICULTY_MEDIUM, MARK_X, MODE_SINGLE, STATUS_PLAYING } from './tic-tac-toe-constants';
import { ticTacToeReducer } from './tic-tac-toe-reducer';
import { createInitialTicTacToeState } from './tic-tac-toe-state';
import { getOpponentMark } from './tic-tac-toe-utils';

export class TicTacToeEngine implements BaseGameEngine<TicTacToeState, TicTacToeAction> {
  private state: TicTacToeState;
  private listeners: Set<(state: TicTacToeState) => void> = new Set();

  constructor(
    mode: GameMode = MODE_SINGLE,
    difficulty: AIDifficulty = DIFFICULTY_MEDIUM,
    startingPlayer: PlayerMark = MARK_X,
    humanPlayerMark: PlayerMark = MARK_X,
  ) {
    this.state = createInitialTicTacToeState(mode, difficulty, startingPlayer, humanPlayerMark);
  }

  getState(): TicTacToeState {
    return this.state;
  }

  dispatch(action: TicTacToeAction): void {
    this.state = ticTacToeReducer(this.state, action);
    this.notify();
  }

  subscribe(listener: (state: TicTacToeState) => void): () => void {
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
   * Attempts to play a move at the specified index.
   * Returns true if the move was accepted and applied, false otherwise.
   */
  makeMove(index: number, player?: PlayerMark): boolean {
    if (this.state.status !== STATUS_PLAYING) return false;
    if (index < 0 || index >= this.state.board.length) return false;
    if (this.state.board[index] !== null) return false;
    if (player && player !== this.state.turn) return false;

    this.dispatch({ type: 'MAKE_MOVE', index, player });
    return true;
  }

  /**
   * Directly executes an AI move based on the current board state and AI difficulty.
   * In unit tests and headless simulations, this can be called synchronously.
   */
  triggerAIMoveSynchronously(): number {
    if (this.state.status !== STATUS_PLAYING) return -1;

    const aiMark = getOpponentMark(this.state.humanPlayerMark);
    if (this.state.turn !== aiMark) return -1;

    const chosenMove = computeAIMove(this.state.board, aiMark, this.state.aiDifficulty);
    if (chosenMove >= 0) {
      this.makeMove(chosenMove, aiMark);
    }
    return chosenMove;
  }

  setMode(mode: GameMode): void {
    this.dispatch({ type: 'SET_MODE', mode });
  }

  setDifficulty(difficulty: AIDifficulty): void {
    this.dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }

  setHumanMark(mark: PlayerMark): void {
    this.dispatch({ type: 'SET_HUMAN_MARK', mark });
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
