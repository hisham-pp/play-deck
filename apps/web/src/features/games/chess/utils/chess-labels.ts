import { colOf, rowOf, toAlgebraic } from '../engine/chess-board';
import {
  BOARD_SIZE,
  COLOR_NAMES,
  FILES,
  PIECE_NAMES,
  STATUS_CHECKMATE,
  STATUS_DRAW,
  STATUS_RESIGNED,
  STATUS_STALEMATE,
} from '../engine/chess-constants';
import type {
  ChessGameState,
  ChessPiece,
  ChessResult,
  PieceColor,
  PieceType,
} from '../types/chess.types';

export function colorName(color: PieceColor): string {
  return COLOR_NAMES[color];
}

export function pieceName(type: PieceType): string {
  return PIECE_NAMES[type];
}

/** "White knight", for reading a square aloud. */
export function describePiece(piece: ChessPiece): string {
  return `${colorName(piece.color)} ${pieceName(piece.type)}`;
}

/** "e4, White knight" or "e4, empty" -- the accessible name of one square. */
export function describeSquare(square: number, piece: ChessPiece | null): string {
  return `${toAlgebraic(square)}, ${piece ? describePiece(piece) : 'empty'}`;
}

/** Spoken form of a square, since "e4" alone is read as a word by some readers. */
export function spellSquare(square: number): string {
  return `${FILES[colOf(square)]} ${BOARD_SIZE - rowOf(square)}`;
}

const DRAW_REASONS: Record<ChessResult['reason'], string> = {
  checkmate: 'checkmate',
  stalemate: 'stalemate',
  'insufficient-material': 'insufficient material',
  'fifty-move': 'the fifty move rule',
  'threefold-repetition': 'threefold repetition',
  agreement: 'agreement',
  resignation: 'resignation',
};

export function reasonName(reason: ChessResult['reason']): string {
  return DRAW_REASONS[reason];
}

/** A short headline for the result, or null while the game is still running. */
export function describeResult(state: ChessGameState): string | null {
  const { result, status } = state;
  if (!result) return null;

  if (status === STATUS_CHECKMATE) {
    return `Checkmate. ${colorName(result.winner ?? 'w')} wins.`;
  }
  if (status === STATUS_RESIGNED) {
    return `${colorName(result.winner === 'w' ? 'b' : 'w')} resigned. ${colorName(
      result.winner ?? 'w',
    )} wins.`;
  }
  if (status === STATUS_STALEMATE) {
    return 'Stalemate. The game is drawn.';
  }
  if (status === STATUS_DRAW) {
    return `Draw by ${reasonName(result.reason)}.`;
  }
  return null;
}

/**
 * What the live region says. It is rebuilt from state rather than pushed at the
 * moment of a move, so it is also correct after an undo or a reload.
 */
export function announceState(state: ChessGameState): string {
  const outcome = describeResult(state);
  if (outcome) return outcome;

  const last = state.history[state.history.length - 1];
  const played = last ? `${colorName(last.move.color)} played ${last.san}. ` : '';
  const check = state.check ? ' You are in check.' : '';

  return `${played}${colorName(state.position.turn)} to move.${check}`;
}

/** Short status line for the banner. */
export function statusHeadline(state: ChessGameState): string {
  return describeResult(state) ?? `${colorName(state.position.turn)} to move`;
}
