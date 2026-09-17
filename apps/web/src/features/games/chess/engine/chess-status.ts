import type {
  ChessBoard,
  ChessMove,
  ChessPosition,
  ChessResult,
  ChessStatus,
  PieceColor,
  PieceType,
} from '../types/chess.types';
import { colOf, opponentOf, rowOf } from './chess-board';
import {
  BISHOP,
  FIFTY_MOVE_PLIES,
  KING,
  KNIGHT,
  REPETITION_LIMIT,
  STATUS_CHECKMATE,
  STATUS_DRAW,
  STATUS_PLAYING,
  STATUS_STALEMATE,
  TOTAL_SQUARES,
} from './chess-constants';
import { repetitionKey } from './chess-fen';

interface MaterialSurvey {
  /** Square shades (0 or 1) that the surviving bishops travel on. */
  bishopShades: Set<number>;
  knightCount: number;
  minorCount: number;
  hasHeavyOrPawn: boolean;
}

function surveyMaterial(board: ChessBoard): MaterialSurvey {
  const bishopShades = new Set<number>();
  let knightCount = 0;
  let minorCount = 0;
  let hasHeavyOrPawn = false;

  for (let square = 0; square < TOTAL_SQUARES; square += 1) {
    const piece = board[square];
    if (!piece || piece.type === KING) continue;

    if (piece.type === BISHOP) {
      bishopShades.add((rowOf(square) + colOf(square)) % 2);
      minorCount += 1;
    } else if (piece.type === KNIGHT) {
      knightCount += 1;
      minorCount += 1;
    } else {
      hasHeavyOrPawn = true;
    }
  }

  return { bishopShades, knightCount, minorCount, hasHeavyOrPawn };
}

/**
 * True for positions where checkmate is impossible for either side: bare kings,
 * king and one minor piece, and any number of bishops so long as they all
 * travel on one shade of square.
 *
 * Two knights against a bare king is deliberately excluded: mate cannot be
 * forced there, but it can still occur, so the game is not dead.
 */
export function hasInsufficientMaterial(board: ChessBoard): boolean {
  const { bishopShades, knightCount, minorCount, hasHeavyOrPawn } = surveyMaterial(board);

  if (hasHeavyOrPawn) return false;
  if (minorCount <= 1) return true;

  return knightCount === 0 && bishopShades.size === 1;
}

export function isFiftyMoveDraw(position: ChessPosition): boolean {
  return position.halfmoveClock >= FIFTY_MOVE_PLIES;
}

export function isThreefoldRepetition(
  position: ChessPosition,
  repetition: Readonly<Record<string, number>>,
): boolean {
  return (repetition[repetitionKey(position)] ?? 0) >= REPETITION_LIMIT;
}

export interface TerminalOutcome {
  status: ChessStatus;
  result: ChessResult | null;
}

function drawOutcome(reason: ChessResult['reason']): TerminalOutcome {
  return { status: STATUS_DRAW, result: { winner: null, reason } };
}

/**
 * Decides whether a position ends the game, given the legal moves open to the
 * side to move, whether that side is in check, and how often the position has
 * already occurred.
 */
export function evaluateOutcome(
  position: ChessPosition,
  legalMoves: readonly ChessMove[],
  inCheck: boolean,
  repetition: Readonly<Record<string, number>>,
): TerminalOutcome {
  if (legalMoves.length === 0) {
    if (inCheck) {
      return {
        status: STATUS_CHECKMATE,
        result: { winner: opponentOf(position.turn), reason: 'checkmate' },
      };
    }
    return { status: STATUS_STALEMATE, result: { winner: null, reason: 'stalemate' } };
  }

  if (hasInsufficientMaterial(position.board)) return drawOutcome('insufficient-material');
  if (isThreefoldRepetition(position, repetition)) return drawOutcome('threefold-repetition');
  if (isFiftyMoveDraw(position)) return drawOutcome('fifty-move');

  return { status: STATUS_PLAYING, result: null };
}

export interface CapturedMaterial {
  /** Pieces White has captured, which is to say Black's losses. */
  byWhite: PieceType[];
  /** Pieces Black has captured. */
  byBlack: PieceType[];
}

/** Rebuilds the captured piles from the moves played so far. */
export function collectCaptures(moves: readonly ChessMove[]): CapturedMaterial {
  const captured: CapturedMaterial = { byWhite: [], byBlack: [] };

  for (const move of moves) {
    if (!move.captured) continue;
    const pile = move.color === 'w' ? captured.byWhite : captured.byBlack;
    pile.push(move.captured);
  }

  return captured;
}

/** Material balance in pawns, positive when `color` is ahead. */
export function materialAdvantage(
  captured: CapturedMaterial,
  color: PieceColor,
  values: Readonly<Record<PieceType, number>>,
): number {
  const sum = (pieces: PieceType[]) => pieces.reduce((total, type) => total + values[type], 0);
  const whiteLead = sum(captured.byWhite) - sum(captured.byBlack);
  return color === 'w' ? whiteLead : -whiteLead;
}
