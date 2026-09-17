import type { CastlingRights, PieceColor, PieceType, PromotionPiece } from '../types/chess.types';

export const BOARD_SIZE = 8;
export const TOTAL_SQUARES = 64;
export const FILES = 'abcdefgh';

export const WHITE: PieceColor = 'w';
export const BLACK: PieceColor = 'b';

export const PAWN: PieceType = 'p';
export const KNIGHT: PieceType = 'n';
export const BISHOP: PieceType = 'b';
export const ROOK: PieceType = 'r';
export const QUEEN: PieceType = 'q';
export const KING: PieceType = 'k';

export const PROMOTION_PIECES: readonly PromotionPiece[] = ['q', 'r', 'b', 'n'];

export const STATUS_PLAYING = 'playing';
export const STATUS_CHECKMATE = 'checkmate';
export const STATUS_STALEMATE = 'stalemate';
export const STATUS_DRAW = 'draw';
export const STATUS_RESIGNED = 'resigned';

export const MODE_LOCAL_2P = 'local-2p';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const NO_CASTLING: CastlingRights = { wk: false, wq: false, bk: false, bq: false };
export const ALL_CASTLING: CastlingRights = { wk: true, wq: true, bk: true, bq: true };

/** Draw is claimed automatically once each side has played fifty moves. */
export const FIFTY_MOVE_PLIES = 100;
/** A position seen this many times is a drawn game. */
export const REPETITION_LIMIT = 3;

/** Centipawn-style values used only for the captured-material readout. */
export const PIECE_VALUES: Readonly<Record<PieceType, number>> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const PIECE_NAMES: Readonly<Record<PieceType, string>> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

export const COLOR_NAMES: Readonly<Record<PieceColor, string>> = {
  w: 'White',
  b: 'Black',
};

/** Square indices that matter to castling, with 0 = a8 and 63 = h1. */
export const SQUARES = {
  a8: 0,
  c8: 2,
  d8: 3,
  e8: 4,
  f8: 5,
  g8: 6,
  h8: 7,
  a1: 56,
  c1: 58,
  d1: 59,
  e1: 60,
  f1: 61,
  g1: 62,
  h1: 63,
} as const;
