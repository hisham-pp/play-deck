import type { BoardCell, PlayerMark, WinningLine } from '../types/tic-tac-toe.types';
import { MARK_O, MARK_X, WINNING_COMBINATIONS } from './tic-tac-toe-constants';

export interface WinResult {
  winner: PlayerMark;
  line: WinningLine;
}

/**
 * Checks whether the current board state contains a 3-in-a-row winning combination.
 */
export function checkWin(board: BoardCell[]): WinResult | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    const mark = board[a];
    if (mark !== null && mark === board[b] && mark === board[c]) {
      return {
        winner: mark,
        line: combo,
      };
    }
  }
  return null;
}

/**
 * Returns true if all cells on the board have been filled.
 */
export function isBoardFull(board: BoardCell[]): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Returns an array of empty cell indices (0..8) available for a move.
 */
export function getAvailableMoves(board: BoardCell[]): number[] {
  const available: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      available.push(i);
    }
  }
  return available;
}

/**
 * Returns the opponent mark ('X' -> 'O', 'O' -> 'X').
 */
export function getOpponentMark(mark: PlayerMark): PlayerMark {
  return mark === MARK_X ? MARK_O : MARK_X;
}

/**
 * Converts a 0..8 index into 1-based human row and column numbers (for ARIA and UI).
 */
export function indexToGridPos(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / 3) + 1,
    col: (index % 3) + 1,
  };
}
