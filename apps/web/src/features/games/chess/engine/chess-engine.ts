import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  ChessAction,
  ChessGameState,
  ChessMove,
  ChessMoveInput,
  ChessMoveRecord,
  PieceColor,
  PromotionPiece,
} from '../types/chess.types';
import { toFen } from './chess-fen';
import { legalMovesFrom, legalTargetsFrom, requiresPromotion } from './chess-legal';
import { chessReducer } from './chess-reducer';
import { createInitialChessState, type CreateChessStateOptions } from './chess-state';

/**
 * A chess game as a plain observable state machine.
 *
 * It knows nothing about React, the DOM, storage or the network. The UI
 * subscribes and dispatches intent; a transport does exactly the same thing
 * with moves that arrived from a peer. Both go through the same rule checks,
 * which is what lets a future online mode synchronize *moves* instead of
 * synchronizing rendered state.
 */
export class ChessEngine implements BaseGameEngine<ChessGameState, ChessAction> {
  private state: ChessGameState;
  private readonly listeners = new Set<(state: ChessGameState) => void>();
  private readonly now: () => number;

  constructor(options: CreateChessStateOptions = {}, now: () => number = Date.now) {
    this.now = now;
    this.state = createInitialChessState(options);
  }

  getState(): ChessGameState {
    return this.state;
  }

  dispatch(action: ChessAction): void {
    const next = chessReducer(this.state, action, this.now);
    if (next === this.state) return;
    this.state = next;
    this.notify();
  }

  subscribe(listener: (state: ChessGameState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.dispatch({ type: 'NEW_GAME' });
  }

  destroy(): void {
    this.listeners.clear();
  }

  /**
   * Attempts a move. Returns the record that was written, or null when the move
   * was illegal -- callers use that to distinguish "played" from "ignored"
   * without inspecting state themselves.
   */
  move(input: ChessMoveInput): ChessMoveRecord | null {
    const before = this.state.history.length;
    this.dispatch({ type: 'MOVE', input });

    const history = this.state.history;
    return history.length > before ? history[history.length - 1] : null;
  }

  /** Convenience wrapper for the common from/to/promotion call shape. */
  moveTo(from: number, to: number, promotion?: PromotionPiece): ChessMoveRecord | null {
    return this.move({ from, to, promotion });
  }

  /** Takes back the last ply. Returns false when there is nothing to undo. */
  undo(): boolean {
    const before = this.state.history.length;
    this.dispatch({ type: 'UNDO' });
    return this.state.history.length < before;
  }

  resign(color: PieceColor): void {
    this.dispatch({ type: 'RESIGN', color });
  }

  offerDraw(color: PieceColor): void {
    this.dispatch({ type: 'OFFER_DRAW', color });
  }

  acceptDraw(): void {
    this.dispatch({ type: 'ACCEPT_DRAW' });
  }

  declineDraw(): void {
    this.dispatch({ type: 'DECLINE_DRAW' });
  }

  newGame(fen?: string, matchId?: string): void {
    this.dispatch({ type: 'NEW_GAME', fen, matchId });
  }

  loadFen(fen: string, matchId?: string): void {
    this.dispatch({ type: 'LOAD_FEN', fen, matchId });
  }

  /** Every legal move, or just those starting on `from`. */
  getLegalMoves(from?: number): ChessMove[] {
    if (from === undefined) return this.state.legalMoves;
    return legalMovesFrom(this.state.legalMoves, from);
  }

  /** Destination squares reachable from `from`, for highlighting. */
  getLegalTargets(from: number): number[] {
    return legalTargetsFrom(this.state.legalMoves, from);
  }

  /** True when this move needs the player to pick a promotion piece first. */
  needsPromotion(from: number, to: number): boolean {
    return requiresPromotion(this.state.legalMoves, from, to);
  }

  getFen(): string {
    return toFen(this.state.position);
  }

  isGameOver(): boolean {
    return this.state.status !== 'playing';
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
