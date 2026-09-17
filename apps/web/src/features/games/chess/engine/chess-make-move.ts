import type {
  CastlingRights,
  ChessBoard,
  ChessMove,
  ChessPosition,
  PieceColor,
} from '../types/chess.types';
import { cloneBoard, colOf, opponentOf, pawnDirection, rowOf, squareOf } from './chess-board';
import { CASTLING_SPECS, findCastlingSpec } from './chess-castling';
import { KING, PAWN, ROOK, WHITE } from './chess-constants';

/**
 * Castling rights survive only while the king and the relevant rook both sit
 * untouched on their home squares, so any move that leaves or lands on one of
 * those squares clears the matching right.
 */
function nextCastlingRights(
  rights: CastlingRights,
  move: ChessMove,
  board: ChessBoard,
): CastlingRights {
  const next = { ...rights };

  if (move.piece === KING) {
    if (move.color === WHITE) {
      next.wk = false;
      next.wq = false;
    } else {
      next.bk = false;
      next.bq = false;
    }
  }

  for (const spec of CASTLING_SPECS) {
    // A rook that leaves home, or is captured at home, forfeits its side.
    const rookLeftHome = move.from === spec.rookFrom && board[spec.rookFrom]?.type === ROOK;
    const rookTakenAtHome = move.to === spec.rookFrom;
    if (rookLeftHome || rookTakenAtHome) {
      next[spec.right] = false;
    }
  }

  return next;
}

function nextEnPassantSquare(move: ChessMove): number | null {
  if (!move.doublePush) return null;
  return squareOf(rowOf(move.from) + pawnDirection(move.color), colOf(move.from));
}

/** The square holding the pawn that an en passant capture removes. */
export function enPassantCaptureSquare(move: ChessMove): number {
  return squareOf(rowOf(move.from), colOf(move.to));
}

function nextFullmoveNumber(current: number, mover: PieceColor): number {
  return mover === WHITE ? current : current + 1;
}

/**
 * Applies a move to a position and returns the position that follows. The input
 * is never mutated, which is what lets history hold real snapshots and lets undo
 * be a restore rather than an inverse move.
 */
export function applyMove(position: ChessPosition, move: ChessMove): ChessPosition {
  const board = cloneBoard(position.board);
  const moving = board[move.from];
  if (!moving) {
    throw new Error(`No piece on square ${move.from} to move`);
  }

  board[move.from] = null;

  if (move.enPassant) {
    board[enPassantCaptureSquare(move)] = null;
  }

  board[move.to] = move.promotion
    ? { color: move.color, type: move.promotion }
    : { color: moving.color, type: moving.type };

  if (move.castle) {
    const spec = findCastlingSpec(move.color, move.castle);
    board[spec.rookTo] = board[spec.rookFrom];
    board[spec.rookFrom] = null;
  }

  const resetsClock = move.piece === PAWN || move.captured !== null;

  return {
    board,
    turn: opponentOf(move.color),
    castling: nextCastlingRights(position.castling, move, position.board),
    enPassant: nextEnPassantSquare(move),
    halfmoveClock: resetsClock ? 0 : position.halfmoveClock + 1,
    fullmoveNumber: nextFullmoveNumber(position.fullmoveNumber, move.color),
  };
}
