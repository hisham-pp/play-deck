import type { ChessMove, ChessMoveInput, PromotionPiece } from '../types/chess.types';
import { colOf, fromAlgebraic, rowOf, toAlgebraic } from './chess-board';
import { BOARD_SIZE, FILES, KING, PAWN, PROMOTION_PIECES } from './chess-constants';

/**
 * Coordinate notation, the compact form a network message carries:
 * "e2e4", or "e7e8q" for a promotion.
 */
export function toUci(move: ChessMove): string {
  return `${toAlgebraic(move.from)}${toAlgebraic(move.to)}${move.promotion ?? ''}`;
}

/** Reads coordinate notation back into a move intent, or null if malformed. */
export function parseUci(uci: string): ChessMoveInput | null {
  if (uci.length !== 4 && uci.length !== 5) return null;

  const from = fromAlgebraic(uci.slice(0, 2));
  const to = fromAlgebraic(uci.slice(2, 4));
  if (from === null || to === null) return null;

  if (uci.length === 4) return { from, to };

  const promotion = uci[4] as PromotionPiece;
  if (!PROMOTION_PIECES.includes(promotion)) return null;
  return { from, to, promotion };
}

/**
 * The file, rank or both that a move needs in order to name one piece
 * unambiguously, given every legal move available in the same position.
 */
function disambiguate(move: ChessMove, legalMoves: readonly ChessMove[]): string {
  const rivals = legalMoves.filter(
    (other) =>
      other.from !== move.from &&
      other.to === move.to &&
      other.piece === move.piece &&
      other.color === move.color,
  );
  if (rivals.length === 0) return '';

  const file = FILES[colOf(move.from)];
  const rank = String(BOARD_SIZE - rowOf(move.from));

  const sharesFile = rivals.some((other) => colOf(other.from) === colOf(move.from));
  if (!sharesFile) return file;

  const sharesRank = rivals.some((other) => rowOf(other.from) === rowOf(move.from));
  if (!sharesRank) return rank;

  return `${file}${rank}`;
}

function pawnSan(move: ChessMove): string {
  const capture = move.captured ? `${FILES[colOf(move.from)]}x` : '';
  const promotion = move.promotion ? `=${move.promotion.toUpperCase()}` : '';
  return `${capture}${toAlgebraic(move.to)}${promotion}`;
}

export interface SanSuffixFlags {
  check: boolean;
  checkmate: boolean;
}

function suffixFor(flags: SanSuffixFlags): string {
  if (flags.checkmate) return '#';
  return flags.check ? '+' : '';
}

/**
 * Standard Algebraic Notation for one move.
 *
 * `legalMoves` must be every legal move in the position the move is played
 * from, because that is what decides whether "Nf3" is ambiguous and needs to
 * become "Ngf3".
 */
export function toSan(
  move: ChessMove,
  legalMoves: readonly ChessMove[],
  flags: SanSuffixFlags,
): string {
  const suffix = suffixFor(flags);

  if (move.castle) {
    return `${move.castle === 'k' ? 'O-O' : 'O-O-O'}${suffix}`;
  }

  if (move.piece === PAWN) {
    return `${pawnSan(move)}${suffix}`;
  }

  // A king is never ambiguous: there is only one of them.
  const marker = move.piece === KING ? '' : disambiguate(move, legalMoves);
  const capture = move.captured ? 'x' : '';
  return `${move.piece.toUpperCase()}${marker}${capture}${toAlgebraic(move.to)}${suffix}`;
}

/** Pairs a move list into numbered full moves for display. */
export interface SanTurn {
  moveNumber: number;
  white: string | null;
  black: string | null;
  whitePly: number | null;
  blackPly: number | null;
}

export function groupSanByTurn(
  entries: readonly { san: string; ply: number; color: string }[],
): SanTurn[] {
  const turns: SanTurn[] = [];

  for (const entry of entries) {
    const isWhite = entry.color === 'w';
    const last = turns[turns.length - 1];

    if (isWhite || !last || last.black !== null) {
      turns.push({
        moveNumber: turns.length + 1,
        white: isWhite ? entry.san : null,
        black: isWhite ? null : entry.san,
        whitePly: isWhite ? entry.ply : null,
        blackPly: isWhite ? null : entry.ply,
      });
      continue;
    }

    last.black = entry.san;
    last.blackPly = entry.ply;
  }

  return turns;
}
