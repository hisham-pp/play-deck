import type { ChessPosition } from '../types/chess.types';
import { generateLegalMoves } from './chess-legal';
import { applyMove } from './chess-make-move';

/**
 * Counts the leaf nodes of the legal move tree to a given depth.
 *
 * Perft is the standard correctness check for a chess move generator: the
 * counts for well-known positions are published and a single rule mistake --
 * a missed pin, a wrong castling condition, a stray en passant -- changes them.
 */
export function perft(position: ChessPosition, depth: number): number {
  if (depth <= 0) return 1;

  const moves = generateLegalMoves(position);
  if (depth === 1) return moves.length;

  let nodes = 0;
  for (const move of moves) {
    nodes += perft(applyMove(position, move), depth - 1);
  }
  return nodes;
}

/**
 * Perft split by first move, which is how a failing total gets traced back to
 * the move that generates the wrong subtree.
 */
export function perftDivide(position: ChessPosition, depth: number): Record<string, number> {
  const divided: Record<string, number> = {};
  for (const move of generateLegalMoves(position)) {
    const key = `${move.from}-${move.to}${move.promotion ?? ''}`;
    divided[key] = perft(applyMove(position, move), depth - 1);
  }
  return divided;
}
