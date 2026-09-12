import type { AIDifficulty, BoardCell, PlayerMark } from '../types/tic-tac-toe.types';
import {
  CENTER_INDEX,
  CORNER_INDICES,
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
} from './tic-tac-toe-constants';
import { checkWin, getAvailableMoves, getOpponentMark, isBoardFull } from './tic-tac-toe-utils';

/**
 * Minimax algorithm evaluating the board game tree.
 * Terminal scoring:
 * - AI win: +10 - depth (favors faster wins)
 * - Human win: depth - 10 (favors delayed losses / blocks)
 * - Draw: 0
 */
function minimax(
  board: BoardCell[],
  depth: number,
  isMaximizing: boolean,
  aiMark: PlayerMark,
  humanMark: PlayerMark,
): number {
  const win = checkWin(board);
  if (win) {
    return win.winner === aiMark ? 10 - depth : depth - 10;
  }

  if (isBoardFull(board)) {
    return 0;
  }

  const available = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of available) {
      board[move] = aiMark;
      const evaluation = minimax(board, depth + 1, false, aiMark, humanMark);
      board[move] = null;
      maxEval = Math.max(maxEval, evaluation);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of available) {
      board[move] = humanMark;
      const evaluation = minimax(board, depth + 1, true, aiMark, humanMark);
      board[move] = null;
      minEval = Math.min(minEval, evaluation);
    }
    return minEval;
  }
}

/**
 * Easy AI: Selects a completely random available move.
 */
export function getEasyMove(board: BoardCell[]): number {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Medium AI:
 * 1. Takes immediate winning move if available.
 * 2. Blocks opponent's immediate winning threat.
 * 3. 60% of the time plays strategically (center -> corners -> edges),
 *    40% of the time plays a random move to remain beatable and human-like.
 */
export function getMediumMove(board: BoardCell[], aiMark: PlayerMark): number {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  const humanMark = getOpponentMark(aiMark);

  // 1. Check for immediate win
  for (const move of available) {
    board[move] = aiMark;
    const isWin = checkWin(board)?.winner === aiMark;
    board[move] = null;
    if (isWin) return move;
  }

  // 2. Check for immediate block
  for (const move of available) {
    board[move] = humanMark;
    const isLoss = checkWin(board)?.winner === humanMark;
    board[move] = null;
    if (isLoss) return move;
  }

  // 3. 60% probability of strategic choice, 40% random
  if (Math.random() < 0.6) {
    if (board[CENTER_INDEX] === null) {
      return CENTER_INDEX;
    }
    const openCorners = CORNER_INDICES.filter((idx) => board[idx] === null);
    if (openCorners.length > 0) {
      return openCorners[Math.floor(Math.random() * openCorners.length)];
    }
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Hard AI (Minimax):
 * Evaluates all branches of the game tree and returns the mathematically optimal move.
 * Unbeatable on a 3x3 board.
 */
export function getHardMove(board: BoardCell[], aiMark: PlayerMark): number {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // Opening book heuristic: on an empty board, pick center or corner for variety & speed
  if (available.length === 9) {
    const openings = [CENTER_INDEX, 0, 2, 6, 8];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  const humanMark = getOpponentMark(aiMark);
  let bestScore = -Infinity;
  let bestMoves: number[] = [];

  for (const move of available) {
    board[move] = aiMark;
    const score = minimax(board, 0, false, aiMark, humanMark);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  // Pick randomly among moves sharing the best score for variety
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

/**
 * Main AI move dispatcher based on the requested difficulty.
 */
export function computeAIMove(
  board: BoardCell[],
  aiMark: PlayerMark,
  difficulty: AIDifficulty,
): number {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return getEasyMove(board);
    case DIFFICULTY_MEDIUM:
      return getMediumMove(board, aiMark);
    case DIFFICULTY_HARD:
    default:
      return getHardMove(board, aiMark);
  }
}
