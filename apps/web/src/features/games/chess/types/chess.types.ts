/**
 * Domain types for the chess module.
 *
 * Squares are indexed 0..63 with **0 = a8** and **63 = h1**, matching both FEN
 * reading order and the order a board renders from White's point of view.
 */

export type PieceColor = 'w' | 'b';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

/** A pawn may never promote to a king or stay a pawn. */
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export type CastleSide = 'k' | 'q';

export interface ChessPiece {
  color: PieceColor;
  type: PieceType;
}

export type ChessSquareContent = ChessPiece | null;

/** Always 64 entries. */
export type ChessBoard = ChessSquareContent[];

export interface CastlingRights {
  wk: boolean;
  wq: boolean;
  bk: boolean;
  bq: boolean;
}

/**
 * Everything the rules need to know about a game at one instant. This is the
 * unit a FEN string round-trips to, and the unit repetition keys hash.
 */
export interface ChessPosition {
  board: ChessBoard;
  turn: PieceColor;
  castling: CastlingRights;
  /** Square a pawn may be captured on by en passant, or null. */
  enPassant: number | null;
  halfmoveClock: number;
  fullmoveNumber: number;
}

export interface ChessMove {
  from: number;
  to: number;
  piece: PieceType;
  color: PieceColor;
  captured: PieceType | null;
  promotion: PromotionPiece | null;
  castle: CastleSide | null;
  enPassant: boolean;
  doublePush: boolean;
}

/** What the UI hands the engine: the rest of a move is derived from the rules. */
export interface ChessMoveInput {
  from: number;
  to: number;
  promotion?: PromotionPiece;
}

/**
 * A played move plus everything needed to replay, render, narrate or undo it
 * without re-deriving anything. Serializable by design: this is the payload a
 * future network transport moves between peers.
 */
export interface ChessMoveRecord {
  /** 1-based index of this move within the game. */
  ply: number;
  move: ChessMove;
  /** Standard Algebraic Notation, e.g. "Nxe5+", "O-O", "exd8=Q#". */
  san: string;
  /** Long algebraic coordinate notation, e.g. "e2e4", "e7e8q". */
  uci: string;
  fenBefore: string;
  fenAfter: string;
  /** The move gave check. */
  check: boolean;
  /** The move gave checkmate. */
  checkmate: boolean;
  timestamp: number;
}

export type ChessStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';

export type ChessEndReason =
  | 'checkmate'
  | 'stalemate'
  | 'insufficient-material'
  | 'fifty-move'
  | 'threefold-repetition'
  | 'agreement'
  | 'resignation';

export interface ChessResult {
  /** null on any drawn result. */
  winner: PieceColor | null;
  reason: ChessEndReason;
}

/** Online play is not implemented yet; the engine is already agnostic to it. */
export type ChessGameMode = 'local-2p' | 'online';

/**
 * The authoritative, serializable game state. It deliberately holds no UI
 * concerns (selection, board orientation, hover) so that synchronizing a match
 * means synchronizing moves, never React state.
 */
export interface ChessGameState {
  matchId: string;
  mode: ChessGameMode;
  position: ChessPosition;
  status: ChessStatus;
  result: ChessResult | null;
  /** Every legal move for the side to move, recomputed on each position. */
  legalMoves: ChessMove[];
  /** True when the side to move is in check. */
  check: boolean;
  history: ChessMoveRecord[];
  /** Repetition key -> times the position has occurred. */
  repetition: Record<string, number>;
  drawOfferFrom: PieceColor | null;
  startedAt: number;
  updatedAt: number;
}

export type ChessAction =
  | { type: 'MOVE'; input: ChessMoveInput; timestamp?: number }
  | { type: 'UNDO' }
  | { type: 'RESIGN'; color: PieceColor }
  | { type: 'OFFER_DRAW'; color: PieceColor }
  | { type: 'DECLINE_DRAW' }
  | { type: 'ACCEPT_DRAW' }
  | { type: 'NEW_GAME'; matchId?: string; fen?: string }
  | { type: 'LOAD_FEN'; fen: string; matchId?: string };

export interface ChessStats {
  gamesPlayed: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  checkmates: number;
  resignations: number;
  longestGamePlies: number;
  lastPlayedAt: string;
}
