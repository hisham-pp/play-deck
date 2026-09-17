import type {
  ChessAction,
  ChessGameState,
  ChessMoveInput,
  ChessMoveRecord,
  PieceColor,
} from '../types/chess.types';
import { opponentOf } from './chess-board';
import { STATUS_CHECKMATE, STATUS_DRAW, STATUS_PLAYING, STATUS_RESIGNED } from './chess-constants';
import { parseFen, repetitionKey, toFen } from './chess-fen';
import { findMove, generateLegalMoves, isInCheck } from './chess-legal';
import { applyMove } from './chess-make-move';
import { toSan, toUci } from './chess-notation';
import { createInitialChessState, deriveFromPosition } from './chess-state';
import { evaluateOutcome } from './chess-status';

/**
 * Plays one legal move, or returns the state untouched when the move is not
 * legal. Rejecting silently rather than throwing keeps a mistimed tap, a stale
 * board or a bad network message from tearing down a game in progress.
 */
function reduceMove(
  state: ChessGameState,
  input: ChessMoveInput,
  timestamp: number,
): ChessGameState {
  if (state.status !== STATUS_PLAYING) return state;

  const move = findMove(state.legalMoves, input);
  if (!move) return state;

  const fenBefore = toFen(state.position);
  const nextPosition = applyMove(state.position, move);

  const key = repetitionKey(nextPosition);
  const repetition = { ...state.repetition, [key]: (state.repetition[key] ?? 0) + 1 };

  // SAN needs the moves available *before* the move, to know whether the piece
  // was ambiguous, and the position *after* it, to know about check and mate.
  const nextLegalMoves = generateLegalMoves(nextPosition);
  const nextCheck = isInCheck(nextPosition);
  const outcome = evaluateOutcome(nextPosition, nextLegalMoves, nextCheck, repetition);
  const checkmate = outcome.status === STATUS_CHECKMATE;

  const record: ChessMoveRecord = {
    ply: state.history.length + 1,
    move,
    san: toSan(move, state.legalMoves, { check: nextCheck, checkmate }),
    uci: toUci(move),
    fenBefore,
    fenAfter: toFen(nextPosition),
    check: nextCheck,
    checkmate,
    timestamp,
  };

  return deriveFromPosition(state, nextPosition, [...state.history, record], repetition, timestamp);
}

/**
 * Takes back the last ply by restoring the position it was played from. Undo is
 * a restore rather than an inverted move, so castling rights, the en passant
 * square and both clocks return exactly as they were -- none of which can be
 * recovered reliably by "unmaking" a move.
 */
function reduceUndo(state: ChessGameState, timestamp: number): ChessGameState {
  const last = state.history[state.history.length - 1];
  if (!last) return state;

  const key = repetitionKey(state.position);
  const repetition = { ...state.repetition };
  const remaining = (repetition[key] ?? 1) - 1;
  if (remaining > 0) repetition[key] = remaining;
  else delete repetition[key];

  // A takeback reopens a finished game, so any decided result is dropped first
  // and then re-derived from the restored position.
  const reopened: ChessGameState = { ...state, status: STATUS_PLAYING, result: null };

  return deriveFromPosition(
    reopened,
    parseFen(last.fenBefore),
    state.history.slice(0, -1),
    repetition,
    timestamp,
  );
}

function reduceResign(state: ChessGameState, color: PieceColor, timestamp: number): ChessGameState {
  if (state.status !== STATUS_PLAYING) return state;
  return {
    ...state,
    status: STATUS_RESIGNED,
    result: { winner: opponentOf(color), reason: 'resignation' },
    drawOfferFrom: null,
    updatedAt: timestamp,
  };
}

function reduceAcceptDraw(state: ChessGameState, timestamp: number): ChessGameState {
  if (state.status !== STATUS_PLAYING || !state.drawOfferFrom) return state;
  return {
    ...state,
    status: STATUS_DRAW,
    result: { winner: null, reason: 'agreement' },
    drawOfferFrom: null,
    updatedAt: timestamp,
  };
}

/**
 * The only place a chess game changes. Every branch returns a fresh state or
 * the identical reference, so subscribers can compare by identity.
 */
export function chessReducer(
  state: ChessGameState,
  action: ChessAction,
  now: () => number = Date.now,
): ChessGameState {
  const timestamp = now();

  switch (action.type) {
    case 'MOVE':
      return reduceMove(state, action.input, action.timestamp ?? timestamp);

    case 'UNDO':
      return reduceUndo(state, timestamp);

    case 'RESIGN':
      return reduceResign(state, action.color, timestamp);

    case 'OFFER_DRAW':
      if (state.status !== STATUS_PLAYING) return state;
      return { ...state, drawOfferFrom: action.color, updatedAt: timestamp };

    case 'DECLINE_DRAW':
      if (!state.drawOfferFrom) return state;
      return { ...state, drawOfferFrom: null, updatedAt: timestamp };

    case 'ACCEPT_DRAW':
      return reduceAcceptDraw(state, timestamp);

    case 'NEW_GAME':
      return createInitialChessState({
        matchId: action.matchId,
        mode: state.mode,
        fen: action.fen,
        timestamp,
      });

    case 'LOAD_FEN':
      return createInitialChessState({
        matchId: action.matchId ?? state.matchId,
        mode: state.mode,
        fen: action.fen,
        timestamp,
      });

    default:
      return state;
  }
}
