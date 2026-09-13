import type { AIDifficulty, ConnectFourCell, ConnectFourDisc } from '../types/connect-four.types';
import {
  COLS,
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  ROWS,
} from './connect-four-constants';
import {
  checkConnectFourWin,
  getAvailableColumns,
  getDropRow,
  getOpponentDisc,
  toIndex,
} from './connect-four-utils';

// Center-first column search order gives better alpha-beta cutoffs
const COLUMN_ORDER = [3, 2, 4, 1, 5, 0, 6];

/**
 * Returns a random available column for Easy difficulty.
 */
export function getEasyMove(board: ConnectFourCell[]): number {
  const available = getAvailableColumns(board);
  if (available.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Checks if dropping in column creates an immediate win for the specified disc.
 */
function isWinningColumn(board: ConnectFourCell[], col: number, disc: ConnectFourDisc): boolean {
  const row = getDropRow(board, col);
  if (row === -1) return false;

  const idx = toIndex(row, col);
  board[idx] = disc;
  const win = checkConnectFourWin(board);
  board[idx] = null;

  return win !== null && win.winner === disc;
}

/**
 * Evaluates a 4-cell window for positional scoring.
 */
function evaluateWindow(window: ConnectFourCell[], aiDisc: ConnectFourDisc): number {
  const oppDisc = getOpponentDisc(aiDisc);
  let aiCount = 0;
  let oppCount = 0;
  let emptyCount = 0;

  for (let i = 0; i < 4; i++) {
    const c = window[i];
    if (c === aiDisc) aiCount++;
    else if (c === oppDisc) oppCount++;
    else emptyCount++;
  }

  if (aiCount === 4) return 1000;
  if (aiCount === 3 && emptyCount === 1) return 10;
  if (aiCount === 2 && emptyCount === 2) return 4;

  if (oppCount === 3 && emptyCount === 1) return -80;
  if (oppCount === 2 && emptyCount === 2) return -3;

  return 0;
}

/**
 * Heuristic board evaluation function for minimax.
 */
function scoreBoard(board: ConnectFourCell[], aiDisc: ConnectFourDisc): number {
  let score = 0;

  // Center column bonus
  const centerCol = 3;
  let centerCount = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[toIndex(r, centerCol)] === aiDisc) {
      centerCount++;
    }
  }
  score += centerCount * 6;

  // Horizontal windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window: ConnectFourCell[] = [
        board[toIndex(r, c)],
        board[toIndex(r, c + 1)],
        board[toIndex(r, c + 2)],
        board[toIndex(r, c + 3)],
      ];
      score += evaluateWindow(window, aiDisc);
    }
  }

  // Vertical windows
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const window: ConnectFourCell[] = [
        board[toIndex(r, c)],
        board[toIndex(r + 1, c)],
        board[toIndex(r + 2, c)],
        board[toIndex(r + 3, c)],
      ];
      score += evaluateWindow(window, aiDisc);
    }
  }

  // Diagonal ascending windows
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window: ConnectFourCell[] = [
        board[toIndex(r, c)],
        board[toIndex(r - 1, c + 1)],
        board[toIndex(r - 2, c + 2)],
        board[toIndex(r - 3, c + 3)],
      ];
      score += evaluateWindow(window, aiDisc);
    }
  }

  // Diagonal descending windows
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window: ConnectFourCell[] = [
        board[toIndex(r, c)],
        board[toIndex(r + 1, c)],
        board[toIndex(r + 2, c)],
        board[toIndex(r + 3, c)],
      ];
      score += evaluateWindow(window, aiDisc);
    }
  }

  return score;
}

function maximizeMove(
  board: ConnectFourCell[],
  orderedMoves: number[],
  depth: number,
  alpha: number,
  beta: number,
  aiDisc: ConnectFourDisc,
): { score: number; column: number } {
  let maxEval = -Infinity;
  let bestCol = orderedMoves[0];
  let curAlpha = alpha;

  for (const col of orderedMoves) {
    const row = getDropRow(board, col);
    const idx = toIndex(row, col);
    board[idx] = aiDisc;
    const evaluation = minimax(board, depth - 1, curAlpha, beta, false, aiDisc).score;
    board[idx] = null;

    if (evaluation > maxEval) {
      maxEval = evaluation;
      bestCol = col;
    }
    curAlpha = Math.max(curAlpha, evaluation);
    if (beta <= curAlpha) break;
  }
  return { score: maxEval, column: bestCol };
}

function minimizeMove(
  board: ConnectFourCell[],
  orderedMoves: number[],
  depth: number,
  alpha: number,
  beta: number,
  aiDisc: ConnectFourDisc,
): { score: number; column: number } {
  const oppDisc = getOpponentDisc(aiDisc);
  let minEval = Infinity;
  let bestCol = orderedMoves[0];
  let curBeta = beta;

  for (const col of orderedMoves) {
    const row = getDropRow(board, col);
    const idx = toIndex(row, col);
    board[idx] = oppDisc;
    const evaluation = minimax(board, depth - 1, alpha, curBeta, true, aiDisc).score;
    board[idx] = null;

    if (evaluation < minEval) {
      minEval = evaluation;
      bestCol = col;
    }
    curBeta = Math.min(curBeta, evaluation);
    if (curBeta <= alpha) break;
  }
  return { score: minEval, column: bestCol };
}

/**
 * Minimax algorithm with alpha-beta pruning.
 */
function minimax(
  board: ConnectFourCell[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiDisc: ConnectFourDisc,
): { score: number; column: number } {
  const available = getAvailableColumns(board);

  const win = checkConnectFourWin(board);
  if (win) {
    if (win.winner === aiDisc) return { score: 100000 + depth, column: -1 };
    return { score: -100000 - depth, column: -1 };
  }

  if (available.length === 0) {
    return { score: 0, column: -1 };
  }

  if (depth === 0) {
    return { score: scoreBoard(board, aiDisc), column: -1 };
  }

  const orderedMoves = COLUMN_ORDER.filter((c) => available.includes(c));
  if (isMaximizing) {
    return maximizeMove(board, orderedMoves, depth, alpha, beta, aiDisc);
  }
  return minimizeMove(board, orderedMoves, depth, alpha, beta, aiDisc);
}

/**
 * Medium difficulty: Wins immediately, blocks immediate threats, else picks center-weighted moves.
 */
export function getMediumMove(board: ConnectFourCell[], aiDisc: ConnectFourDisc): number {
  const available = getAvailableColumns(board);
  if (available.length === 0) return -1;

  const oppDisc = getOpponentDisc(aiDisc);

  // 1. Immediate win
  for (const col of available) {
    if (isWinningColumn(board, col, aiDisc)) {
      return col;
    }
  }

  // 2. Immediate block
  for (const col of available) {
    if (isWinningColumn(board, col, oppDisc)) {
      return col;
    }
  }

  // 3. Center-preferred choice with slight randomness
  const ordered = COLUMN_ORDER.filter((c) => available.includes(c));
  if (Math.random() > 0.35 && ordered.length > 0) {
    return ordered[0];
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Hard difficulty: Full alpha-beta minimax search (depth 4).
 */
export function getHardMove(board: ConnectFourCell[], aiDisc: ConnectFourDisc): number {
  const available = getAvailableColumns(board);
  if (available.length === 0) return -1;

  const oppDisc = getOpponentDisc(aiDisc);

  // Immediate win check for max speed
  for (const col of available) {
    if (isWinningColumn(board, col, aiDisc)) {
      return col;
    }
  }

  // Immediate block check
  for (const col of available) {
    if (isWinningColumn(board, col, oppDisc)) {
      return col;
    }
  }

  const result = minimax(board, 4, -Infinity, Infinity, true, aiDisc);
  if (result.column >= 0 && available.includes(result.column)) {
    return result.column;
  }

  return available[0];
}

/**
 * Dispatches AI move according to selected difficulty.
 */
export function computeAIMove(
  board: ConnectFourCell[],
  aiDisc: ConnectFourDisc,
  difficulty: AIDifficulty,
): number {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return getEasyMove(board);
    case DIFFICULTY_HARD:
      return getHardMove(board, aiDisc);
    case DIFFICULTY_MEDIUM:
    default:
      return getMediumMove(board, aiDisc);
  }
}
