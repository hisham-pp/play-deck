import type { CastleSide, CastlingRights, PieceColor } from '../types/chess.types';
import { SQUARES } from './chess-constants';

export interface CastlingSpec {
  color: PieceColor;
  side: CastleSide;
  /** Which flag in CastlingRights this castle consumes. */
  right: keyof CastlingRights;
  kingFrom: number;
  kingTo: number;
  rookFrom: number;
  rookTo: number;
  /** Squares that must be empty, including the b-file square when queenside. */
  empty: readonly number[];
  /** Squares the king stands on or crosses, none of which may be attacked. */
  kingPath: readonly number[];
}

const B1 = SQUARES.a1 + 1;
const B8 = SQUARES.a8 + 1;

export const CASTLING_SPECS: readonly CastlingSpec[] = [
  {
    color: 'w',
    side: 'k',
    right: 'wk',
    kingFrom: SQUARES.e1,
    kingTo: SQUARES.g1,
    rookFrom: SQUARES.h1,
    rookTo: SQUARES.f1,
    empty: [SQUARES.f1, SQUARES.g1],
    kingPath: [SQUARES.e1, SQUARES.f1, SQUARES.g1],
  },
  {
    color: 'w',
    side: 'q',
    right: 'wq',
    kingFrom: SQUARES.e1,
    kingTo: SQUARES.c1,
    rookFrom: SQUARES.a1,
    rookTo: SQUARES.d1,
    empty: [SQUARES.d1, SQUARES.c1, B1],
    kingPath: [SQUARES.e1, SQUARES.d1, SQUARES.c1],
  },
  {
    color: 'b',
    side: 'k',
    right: 'bk',
    kingFrom: SQUARES.e8,
    kingTo: SQUARES.g8,
    rookFrom: SQUARES.h8,
    rookTo: SQUARES.f8,
    empty: [SQUARES.f8, SQUARES.g8],
    kingPath: [SQUARES.e8, SQUARES.f8, SQUARES.g8],
  },
  {
    color: 'b',
    side: 'q',
    right: 'bq',
    kingFrom: SQUARES.e8,
    kingTo: SQUARES.c8,
    rookFrom: SQUARES.a8,
    rookTo: SQUARES.d8,
    empty: [SQUARES.d8, SQUARES.c8, B8],
    kingPath: [SQUARES.e8, SQUARES.d8, SQUARES.c8],
  },
];

export function findCastlingSpec(color: PieceColor, side: CastleSide): CastlingSpec {
  const spec = CASTLING_SPECS.find((item) => item.color === color && item.side === side);
  if (!spec) throw new Error(`No castling specification for ${color}${side}`);
  return spec;
}
