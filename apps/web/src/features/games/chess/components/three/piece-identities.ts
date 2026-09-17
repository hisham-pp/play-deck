import { colOf, rowOf, squareOf } from '../../engine/chess-board';
import { findCastlingSpec } from '../../engine/chess-castling';
import { TOTAL_SQUARES } from '../../engine/chess-constants';
import type { ChessBoard, ChessMoveRecord } from '../../types/chess.types';

/**
 * Square index -> a stable id for whatever piece stands there.
 *
 * The engine models the board as squares holding pieces, which is the right
 * model for the rules but gives React nothing to key a piece by: a moved piece
 * would unmount on its old square and mount on its new one, so it would pop
 * rather than travel. Following identities across a move restores that.
 */
export type IdentityMap = Record<number, string>;

/** Builds fresh identities for every occupied square. */
export function buildIdentities(board: ChessBoard, seed: number): IdentityMap {
  const identities: IdentityMap = {};
  let counter = seed;

  for (let square = 0; square < TOTAL_SQUARES; square += 1) {
    if (board[square]) {
      identities[square] = `p${counter}`;
      counter += 1;
    }
  }

  return identities;
}

/**
 * Carries identities across one played move, so the piece that moved keeps its
 * id (a promoted pawn included) and a captured piece loses its own.
 */
export function advanceIdentities(previous: IdentityMap, record: ChessMoveRecord): IdentityMap {
  const next: IdentityMap = { ...previous };
  const { move } = record;

  // An en passant capture removes a pawn that is not on the landing square.
  if (move.enPassant) {
    delete next[squareOf(rowOf(move.from), colOf(move.to))];
  }

  const mover = next[move.from];
  delete next[move.from];
  if (mover) next[move.to] = mover;
  else delete next[move.to];

  if (move.castle) {
    const spec = findCastlingSpec(move.color, move.castle);
    const rook = next[spec.rookFrom];
    delete next[spec.rookFrom];
    if (rook) next[spec.rookTo] = rook;
  }

  return next;
}

/** True when the identities cover exactly the occupied squares of the board. */
export function identitiesMatchBoard(identities: IdentityMap, board: ChessBoard): boolean {
  for (let square = 0; square < TOTAL_SQUARES; square += 1) {
    if (Boolean(board[square]) !== Boolean(identities[square])) return false;
  }
  return true;
}

export interface IdentityState {
  identities: IdentityMap;
  /** Plies played when these identities were computed. */
  ply: number;
  /** Next free id number, so rebuilt ids never collide with live ones. */
  seed: number;
}

/**
 * Produces the identities for a new state, reusing the previous ones when the
 * state advanced by exactly one move and starting over otherwise -- which is
 * what an undo, a new game or a loaded position should do.
 */
export function nextIdentityState(
  previous: IdentityState | null,
  board: ChessBoard,
  history: readonly ChessMoveRecord[],
): IdentityState {
  const ply = history.length;

  if (previous && ply === previous.ply + 1) {
    const advanced = advanceIdentities(previous.identities, history[ply - 1]);
    if (identitiesMatchBoard(advanced, board)) {
      return { identities: advanced, ply, seed: previous.seed };
    }
  }

  if (previous && ply === previous.ply && identitiesMatchBoard(previous.identities, board)) {
    return previous;
  }

  const seed = previous ? previous.seed + TOTAL_SQUARES : 0;
  return { identities: buildIdentities(board, seed), ply, seed };
}
