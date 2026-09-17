import type { ChessBoard, PieceColor } from '../types/chess.types';
import { colOf, findKing, isInBounds, rowOf, squareOf } from './chess-board';
import { BISHOP, KING, KNIGHT, PAWN, QUEEN, ROOK, WHITE } from './chess-constants';

export type Delta = readonly [number, number];

export const KNIGHT_DELTAS: readonly Delta[] = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

export const KING_DELTAS: readonly Delta[] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export const BISHOP_DIRECTIONS: readonly Delta[] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

export const ROOK_DIRECTIONS: readonly Delta[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function hasSteppingAttacker(
  board: ChessBoard,
  row: number,
  col: number,
  deltas: readonly Delta[],
  color: PieceColor,
  type: string,
): boolean {
  for (const [dr, dc] of deltas) {
    const r = row + dr;
    const c = col + dc;
    if (!isInBounds(r, c)) continue;
    const piece = board[squareOf(r, c)];
    if (piece && piece.color === color && piece.type === type) return true;
  }
  return false;
}

function hasSlidingAttacker(
  board: ChessBoard,
  row: number,
  col: number,
  directions: readonly Delta[],
  color: PieceColor,
  type: string,
): boolean {
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (isInBounds(r, c)) {
      const piece = board[squareOf(r, c)];
      if (piece) {
        if (piece.color === color && (piece.type === type || piece.type === QUEEN)) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return false;
}

/**
 * A White pawn sits one row below the square it attacks (rows count down from
 * rank 8), so we look for the attacker on the opposite side of the target.
 */
function hasPawnAttacker(board: ChessBoard, row: number, col: number, color: PieceColor): boolean {
  const attackerRow = color === WHITE ? row + 1 : row - 1;
  for (const dc of [-1, 1]) {
    const c = col + dc;
    if (!isInBounds(attackerRow, c)) continue;
    const piece = board[squareOf(attackerRow, c)];
    if (piece && piece.color === color && piece.type === PAWN) return true;
  }
  return false;
}

/** True when `color` attacks `square`, whatever currently stands on it. */
export function isSquareAttacked(board: ChessBoard, square: number, color: PieceColor): boolean {
  const row = rowOf(square);
  const col = colOf(square);

  return (
    hasPawnAttacker(board, row, col, color) ||
    hasSteppingAttacker(board, row, col, KNIGHT_DELTAS, color, KNIGHT) ||
    hasSteppingAttacker(board, row, col, KING_DELTAS, color, KING) ||
    hasSlidingAttacker(board, row, col, ROOK_DIRECTIONS, color, ROOK) ||
    hasSlidingAttacker(board, row, col, BISHOP_DIRECTIONS, color, BISHOP)
  );
}

/** True when `color`'s king stands on an attacked square. */
export function isKingInCheck(board: ChessBoard, color: PieceColor): boolean {
  const kingSquare = findKing(board, color);
  if (kingSquare === -1) return false;
  return isSquareAttacked(board, kingSquare, color === WHITE ? 'b' : 'w');
}
