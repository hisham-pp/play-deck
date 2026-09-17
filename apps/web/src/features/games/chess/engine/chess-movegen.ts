import type {
  ChessBoard,
  ChessMove,
  ChessPosition,
  PieceColor,
  PieceType,
  PromotionPiece,
} from '../types/chess.types';
import {
  BISHOP_DIRECTIONS,
  isSquareAttacked,
  KING_DELTAS,
  KNIGHT_DELTAS,
  ROOK_DIRECTIONS,
  type Delta,
} from './chess-attacks';
import {
  colOf,
  isInBounds,
  opponentOf,
  pawnDirection,
  pawnStartRow,
  promotionRow,
  rowOf,
  squareOf,
} from './chess-board';
import { CASTLING_SPECS } from './chess-castling';
import { KING, KNIGHT, PAWN, PROMOTION_PIECES, ROOK, TOTAL_SQUARES } from './chess-constants';

interface MoveDraft {
  from: number;
  to: number;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType | null;
  promotion?: PromotionPiece | null;
  castle?: ChessMove['castle'];
  enPassant?: boolean;
  doublePush?: boolean;
}

function buildMove(draft: MoveDraft): ChessMove {
  return {
    from: draft.from,
    to: draft.to,
    piece: draft.piece,
    color: draft.color,
    captured: draft.captured ?? null,
    promotion: draft.promotion ?? null,
    castle: draft.castle ?? null,
    enPassant: draft.enPassant ?? false,
    doublePush: draft.doublePush ?? false,
  };
}

/** A pawn reaching the far rank yields one move per promotion choice. */
function pushPawnMove(moves: ChessMove[], draft: MoveDraft, color: PieceColor): void {
  if (rowOf(draft.to) !== promotionRow(color)) {
    moves.push(buildMove(draft));
    return;
  }
  for (const promotion of PROMOTION_PIECES) {
    moves.push(buildMove({ ...draft, promotion }));
  }
}

function generatePawnMoves(
  board: ChessBoard,
  position: ChessPosition,
  from: number,
  color: PieceColor,
  moves: ChessMove[],
): void {
  const row = rowOf(from);
  const col = colOf(from);
  const step = pawnDirection(color);
  const base = { from, piece: PAWN, color };

  // Pushes need an empty square ahead, and the double push needs both empty.
  if (isInBounds(row + step, col)) {
    const oneAhead = squareOf(row + step, col);
    if (!board[oneAhead]) {
      pushPawnMove(moves, { ...base, to: oneAhead }, color);

      const twoAhead = squareOf(row + step * 2, col);
      if (row === pawnStartRow(color) && !board[twoAhead]) {
        moves.push(buildMove({ ...base, to: twoAhead, doublePush: true }));
      }
    }
  }

  // Diagonal captures, plus en passant onto the empty square behind a pawn.
  for (const dc of [-1, 1]) {
    const r = row + step;
    const c = col + dc;
    if (!isInBounds(r, c)) continue;

    const to = squareOf(r, c);
    const target = board[to];
    if (target && target.color !== color) {
      pushPawnMove(moves, { ...base, to, captured: target.type }, color);
    } else if (!target && to === position.enPassant) {
      moves.push(buildMove({ ...base, to, captured: PAWN, enPassant: true }));
    }
  }
}

function generateStepMoves(
  board: ChessBoard,
  from: number,
  color: PieceColor,
  type: PieceType,
  deltas: readonly Delta[],
  moves: ChessMove[],
): void {
  const row = rowOf(from);
  const col = colOf(from);

  for (const [dr, dc] of deltas) {
    const r = row + dr;
    const c = col + dc;
    if (!isInBounds(r, c)) continue;

    const to = squareOf(r, c);
    const target = board[to];
    if (target?.color === color) continue;
    moves.push(buildMove({ from, to, piece: type, color, captured: target?.type ?? null }));
  }
}

function generateSlidingMoves(
  board: ChessBoard,
  from: number,
  color: PieceColor,
  type: PieceType,
  directions: readonly Delta[],
  moves: ChessMove[],
): void {
  const row = rowOf(from);
  const col = colOf(from);

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (isInBounds(r, c)) {
      const to = squareOf(r, c);
      const target = board[to];
      if (!target) {
        moves.push(buildMove({ from, to, piece: type, color }));
      } else {
        if (target.color !== color) {
          moves.push(buildMove({ from, to, piece: type, color, captured: target.type }));
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
}

/**
 * Castling is generated here rather than filtered afterwards because part of
 * its legality rests on squares the king merely crosses, which a "did this move
 * leave my own king in check" test never looks at.
 */
function generateCastlingMoves(
  position: ChessPosition,
  color: PieceColor,
  moves: ChessMove[],
): void {
  const { board } = position;
  const enemy = opponentOf(color);

  for (const spec of CASTLING_SPECS) {
    if (spec.color !== color || !position.castling[spec.right]) continue;

    const rook = board[spec.rookFrom];
    if (rook?.type !== ROOK || rook.color !== color) continue;
    if (spec.empty.some((square) => board[square])) continue;
    if (spec.kingPath.some((square) => isSquareAttacked(board, square, enemy))) continue;

    moves.push(
      buildMove({ from: spec.kingFrom, to: spec.kingTo, piece: KING, color, castle: spec.side }),
    );
  }
}

const QUEEN_DIRECTIONS: readonly Delta[] = [...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS];

const SLIDING_DIRECTIONS: Partial<Record<PieceType, readonly Delta[]>> = {
  b: BISHOP_DIRECTIONS,
  r: ROOK_DIRECTIONS,
  q: QUEEN_DIRECTIONS,
};

/**
 * Every move the side to move could make under piece-movement rules alone.
 * Moves that would leave their own king in check are still present here;
 * `generateLegalMoves` is what removes them.
 */
export function generatePseudoLegalMoves(position: ChessPosition): ChessMove[] {
  const { board, turn } = position;
  const moves: ChessMove[] = [];

  for (let from = 0; from < TOTAL_SQUARES; from += 1) {
    const piece = board[from];
    if (!piece || piece.color !== turn) continue;

    if (piece.type === PAWN) {
      generatePawnMoves(board, position, from, turn, moves);
    } else if (piece.type === KNIGHT) {
      generateStepMoves(board, from, turn, KNIGHT, KNIGHT_DELTAS, moves);
    } else if (piece.type === KING) {
      generateStepMoves(board, from, turn, KING, KING_DELTAS, moves);
    } else {
      const directions = SLIDING_DIRECTIONS[piece.type];
      if (directions) generateSlidingMoves(board, from, turn, piece.type, directions, moves);
    }
  }

  generateCastlingMoves(position, turn, moves);
  return moves;
}
