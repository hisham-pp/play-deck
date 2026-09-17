import type {
  ChessMove,
  ChessMoveInput,
  ChessPosition,
  PromotionPiece,
} from '../types/chess.types';
import { isKingInCheck } from './chess-attacks';
import { applyMove } from './chess-make-move';
import { generatePseudoLegalMoves } from './chess-movegen';

/**
 * Every legal move for the side to move: pseudo-legal moves minus the ones that
 * would leave, or leave standing, their own king in check. Making the move and
 * testing the resulting board is slower than tracking pins, and correct for
 * every case including en passant discovered checks.
 */
export function generateLegalMoves(position: ChessPosition): ChessMove[] {
  return generatePseudoLegalMoves(position).filter((move) => {
    const next = applyMove(position, move);
    return !isKingInCheck(next.board, move.color);
  });
}

/** True when the side to move stands in check. */
export function isInCheck(position: ChessPosition): boolean {
  return isKingInCheck(position.board, position.turn);
}

/** Legal moves that start on `from`. */
export function legalMovesFrom(moves: readonly ChessMove[], from: number): ChessMove[] {
  return moves.filter((move) => move.from === from);
}

/** Destination squares reachable from `from`, for highlighting. */
export function legalTargetsFrom(moves: readonly ChessMove[], from: number): number[] {
  return legalMovesFrom(moves, from).map((move) => move.to);
}

/**
 * Resolves a from/to (plus promotion choice) into the single legal move it
 * names, or null when no legal move matches.
 */
export function findMove(moves: readonly ChessMove[], input: ChessMoveInput): ChessMove | null {
  const candidates = moves.filter((move) => move.from === input.from && move.to === input.to);
  if (candidates.length === 0) return null;

  // Only promotions produce several moves for one from/to pair.
  if (candidates.length === 1 && !candidates[0].promotion) return candidates[0];

  const promotion: PromotionPiece = input.promotion ?? 'q';
  return candidates.find((move) => move.promotion === promotion) ?? null;
}

/**
 * True when moving from `from` to `to` requires the player to choose a
 * promotion piece, which the UI must ask about before the move can be made.
 */
export function requiresPromotion(moves: readonly ChessMove[], from: number, to: number): boolean {
  return moves.some((move) => move.from === from && move.to === to && move.promotion !== null);
}
