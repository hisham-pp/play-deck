import type {
  ChessGameMode,
  ChessGameState,
  ChessMoveRecord,
  ChessPosition,
} from '../types/chess.types';
import { MODE_LOCAL_2P, START_FEN } from './chess-constants';
import { parseFen, repetitionKey } from './chess-fen';
import { generateLegalMoves, isInCheck } from './chess-legal';
import { evaluateOutcome } from './chess-status';

/**
 * Kept local rather than pulled from `@playdeck/shared` so the engine stays
 * free of runtime dependencies and can be loaded by a bare Node process, a
 * worker, or eventually a server.
 */
export function createMatchId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `chess_${crypto.randomUUID()}`;
  }
  return `chess_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
}

/**
 * Recomputes everything that follows from a position -- legal moves, check, and
 * whether the game has ended -- so that no caller has to keep those in step by
 * hand. Every reducer branch that changes the board funnels through here.
 */
export function deriveFromPosition(
  state: ChessGameState,
  position: ChessPosition,
  history: ChessMoveRecord[],
  repetition: Record<string, number>,
  timestamp: number,
): ChessGameState {
  const legalMoves = generateLegalMoves(position);
  const check = isInCheck(position);
  const { status, result } = evaluateOutcome(position, legalMoves, check, repetition);

  return {
    ...state,
    position,
    legalMoves,
    check,
    status,
    result,
    history,
    repetition,
    drawOfferFrom: null,
    updatedAt: timestamp,
  };
}

export interface CreateChessStateOptions {
  matchId?: string;
  mode?: ChessGameMode;
  /** Starting position; defaults to the standard array. */
  fen?: string;
  timestamp?: number;
}

export function createInitialChessState(options: CreateChessStateOptions = {}): ChessGameState {
  const { matchId = createMatchId(), mode = MODE_LOCAL_2P, fen = START_FEN } = options;
  const timestamp = options.timestamp ?? Date.now();
  const position = parseFen(fen);

  const base: ChessGameState = {
    matchId,
    mode,
    position,
    status: 'playing',
    result: null,
    legalMoves: [],
    check: false,
    history: [],
    repetition: {},
    drawOfferFrom: null,
    startedAt: timestamp,
    updatedAt: timestamp,
  };

  // The opening position counts as its first occurrence for repetition.
  return deriveFromPosition(base, position, [], { [repetitionKey(position)]: 1 }, timestamp);
}
