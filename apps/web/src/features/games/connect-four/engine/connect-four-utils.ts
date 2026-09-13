import type {
  ConnectFourCell,
  ConnectFourDisc,
  ConnectFourState,
  ConnectFourWinResult,
} from '../types/connect-four.types';
import {
  COLS,
  DISC_RED,
  DISC_YELLOW,
  ROWS,
  STATUS_DRAW,
  STATUS_WON,
  TOTAL_CELLS,
} from './connect-four-constants';

/**
 * Creates an empty 6x7 board (42 cells initialized to null).
 */
export function createEmptyBoard(): ConnectFourCell[] {
  return Array<ConnectFourCell>(TOTAL_CELLS).fill(null);
}

/**
 * Returns the flat index corresponding to (row, col).
 */
export function toIndex(row: number, col: number): number {
  return row * COLS + col;
}

/**
 * Converts a flat index back to { row, col }.
 */
export function fromIndex(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / COLS),
    col: index % COLS,
  };
}

/**
 * Determines the lowest available row index (0 to 5) for a given column due to gravity.
 * Returns -1 if the column is completely full or out of bounds.
 */
export function getDropRow(board: ConnectFourCell[], col: number): number {
  if (col < 0 || col >= COLS) return -1;
  // If the top cell is already filled, column is full
  if (board[toIndex(0, col)] !== null) return -1;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[toIndex(r, col)] === null) {
      return r;
    }
  }
  return -1;
}

/**
 * Returns true if the column can no longer accept any pieces.
 */
export function isColumnFull(board: ConnectFourCell[], col: number): boolean {
  if (col < 0 || col >= COLS) return true;
  return board[toIndex(0, col)] !== null;
}

/**
 * Returns an array of valid column indices [0..6] that are not full.
 */
export function getAvailableColumns(board: ConnectFourCell[]): number[] {
  const available: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (!isColumnFull(board, c)) {
      available.push(c);
    }
  }
  return available;
}

/**
 * Returns true if every cell in the board is occupied.
 */
export function isBoardFull(board: ConnectFourCell[]): boolean {
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (board[i] === null) return false;
  }
  return true;
}

/**
 * Toggles the disc color between 'R' and 'Y'.
 */
export function getOpponentDisc(disc: ConnectFourDisc): ConnectFourDisc {
  return disc === DISC_RED ? DISC_YELLOW : DISC_RED;
}

/**
 * Checks for 4 consecutive pieces horizontally, vertically, or diagonally.
 * Returns the winning result or null if no 4-in-a-row exists.
 */
function checkHorizontalWin(board: ConnectFourCell[]): ConnectFourWinResult | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const idx0 = toIndex(r, c);
      const disc = board[idx0];
      if (
        disc !== null &&
        disc === board[toIndex(r, c + 1)] &&
        disc === board[toIndex(r, c + 2)] &&
        disc === board[toIndex(r, c + 3)]
      ) {
        return {
          winner: disc,
          direction: 'horizontal',
          winningCells: [idx0, toIndex(r, c + 1), toIndex(r, c + 2), toIndex(r, c + 3)],
        };
      }
    }
  }
  return null;
}

function checkVerticalWin(board: ConnectFourCell[]): ConnectFourWinResult | null {
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx0 = toIndex(r, c);
      const disc = board[idx0];
      if (
        disc !== null &&
        disc === board[toIndex(r + 1, c)] &&
        disc === board[toIndex(r + 2, c)] &&
        disc === board[toIndex(r + 3, c)]
      ) {
        return {
          winner: disc,
          direction: 'vertical',
          winningCells: [idx0, toIndex(r + 1, c), toIndex(r + 2, c), toIndex(r + 3, c)],
        };
      }
    }
  }
  return null;
}

function checkDiagonalAscWin(board: ConnectFourCell[]): ConnectFourWinResult | null {
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const idx0 = toIndex(r, c);
      const disc = board[idx0];
      if (
        disc !== null &&
        disc === board[toIndex(r - 1, c + 1)] &&
        disc === board[toIndex(r - 2, c + 2)] &&
        disc === board[toIndex(r - 3, c + 3)]
      ) {
        return {
          winner: disc,
          direction: 'diagonal-asc',
          winningCells: [idx0, toIndex(r - 1, c + 1), toIndex(r - 2, c + 2), toIndex(r - 3, c + 3)],
        };
      }
    }
  }
  return null;
}

function checkDiagonalDescWin(board: ConnectFourCell[]): ConnectFourWinResult | null {
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const idx0 = toIndex(r, c);
      const disc = board[idx0];
      if (
        disc !== null &&
        disc === board[toIndex(r + 1, c + 1)] &&
        disc === board[toIndex(r + 2, c + 2)] &&
        disc === board[toIndex(r + 3, c + 3)]
      ) {
        return {
          winner: disc,
          direction: 'diagonal-desc',
          winningCells: [idx0, toIndex(r + 1, c + 1), toIndex(r + 2, c + 2), toIndex(r + 3, c + 3)],
        };
      }
    }
  }
  return null;
}

/**
 * Checks for 4 consecutive pieces horizontally, vertically, or diagonally.
 * Returns the winning result or null if no 4-in-a-row exists.
 */
export function checkConnectFourWin(board: ConnectFourCell[]): ConnectFourWinResult | null {
  return (
    checkHorizontalWin(board) ??
    checkVerticalWin(board) ??
    checkDiagonalAscWin(board) ??
    checkDiagonalDescWin(board)
  );
}

/**
 * Formats a live status announcement for screen readers.
 */
export function formatStatusAnnouncement(state: ConnectFourState): string {
  if (state.status === STATUS_WON && state.winner) {
    const winnerName = state.winner === DISC_RED ? 'Player 1 (Red)' : 'Player 2 (Yellow)';
    return `Connect Four! ${winnerName} won the game in round ${state.round}.`;
  }
  if (state.status === STATUS_DRAW) {
    return `Game ended in a draw! The board is full.`;
  }
  const currentTurnName = state.turn === DISC_RED ? 'Player 1 (Red)' : 'Player 2 (Yellow)';
  const lastMoveInfo = state.lastMove
    ? `Last piece dropped in column ${state.lastMove.column + 1}. `
    : '';
  return `${lastMoveInfo}Current turn: ${currentTurnName}.`;
}
