import type { ChessBoard, ChessPiece, PieceColor, PieceType } from '../types/chess.types';
import { BOARD_SIZE, FILES, TOTAL_SQUARES, WHITE } from './chess-constants';

/** Row 0 is rank 8 (the top of the board from White's view). */
export function rowOf(square: number): number {
  return square >> 3;
}

/** Column 0 is the a-file. */
export function colOf(square: number): number {
  return square & 7;
}

export function squareOf(row: number, col: number): number {
  return row * BOARD_SIZE + col;
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function isSquareIndex(square: number): boolean {
  return Number.isInteger(square) && square >= 0 && square < TOTAL_SQUARES;
}

/** 0 -> "a8", 63 -> "h1". */
export function toAlgebraic(square: number): string {
  return `${FILES[colOf(square)]}${BOARD_SIZE - rowOf(square)}`;
}

/** "e4" -> 36. Returns null for anything that is not a square name. */
export function fromAlgebraic(name: string): number | null {
  if (name.length !== 2) return null;
  const col = FILES.indexOf(name[0]);
  const rank = Number(name[1]);
  if (col === -1 || !Number.isInteger(rank) || rank < 1 || rank > BOARD_SIZE) return null;
  return squareOf(BOARD_SIZE - rank, col);
}

/** a8 is a light square, and the colours alternate from there. */
export function squareShade(square: number): 'light' | 'dark' {
  return (rowOf(square) + colOf(square)) % 2 === 0 ? 'light' : 'dark';
}

export function createEmptyBoard(): ChessBoard {
  return new Array<ChessPiece | null>(TOTAL_SQUARES).fill(null);
}

export function cloneBoard(board: ChessBoard): ChessBoard {
  return board.slice();
}

export function opponentOf(color: PieceColor): PieceColor {
  return color === WHITE ? 'b' : 'w';
}

/** The row a pawn of this colour promotes on. */
export function promotionRow(color: PieceColor): number {
  return color === WHITE ? 0 : BOARD_SIZE - 1;
}

/** The row a pawn of this colour starts on. */
export function pawnStartRow(color: PieceColor): number {
  return color === WHITE ? BOARD_SIZE - 2 : 1;
}

/** Row delta of a forward pawn step: White marches towards row 0. */
export function pawnDirection(color: PieceColor): number {
  return color === WHITE ? -1 : 1;
}

export function pieceAt(board: ChessBoard, square: number): ChessPiece | null {
  return board[square] ?? null;
}

export function isColorAt(board: ChessBoard, square: number, color: PieceColor): boolean {
  return board[square]?.color === color;
}

/** Finds the square holding a colour's king, or -1 when there is none. */
export function findKing(board: ChessBoard, color: PieceColor): number {
  for (let square = 0; square < TOTAL_SQUARES; square += 1) {
    const piece = board[square];
    if (piece && piece.color === color && piece.type === 'k') return square;
  }
  return -1;
}

export function findPieces(board: ChessBoard, color: PieceColor, type: PieceType): number[] {
  const squares: number[] = [];
  for (let square = 0; square < TOTAL_SQUARES; square += 1) {
    const piece = board[square];
    if (piece && piece.color === color && piece.type === type) squares.push(square);
  }
  return squares;
}
