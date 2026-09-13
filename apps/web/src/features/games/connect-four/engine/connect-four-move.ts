import type { ConnectFourDisc, ConnectFourState } from '../types/connect-four.types';
import { COLS, STATUS_DRAW, STATUS_PLAYING, STATUS_WON } from './connect-four-constants';
import {
  checkConnectFourWin,
  getDropRow,
  getOpponentDisc,
  isBoardFull,
  toIndex,
} from './connect-four-utils';

/**
 * Validates and executes a piece drop in the specified column,
 * applying gravity to determine the landing row, checking for win or draw,
 * and updating the game state accordingly.
 */
export function applyDrop(
  state: ConnectFourState,
  column: number,
  player?: ConnectFourDisc,
): ConnectFourState {
  // Reject if match is not currently in progress
  if (state.status !== STATUS_PLAYING) {
    return state;
  }

  // Reject out-of-bounds column indices
  if (column < 0 || column >= COLS) {
    return state;
  }

  // Reject if action specifies a player disc that doesn't match current turn
  if (player && player !== state.turn) {
    return state;
  }

  // Compute gravity drop row
  const row = getDropRow(state.board, column);
  if (row === -1) {
    // Column is full
    return state;
  }

  const activePlayer = state.turn;
  const targetIndex = toIndex(row, column);
  const nextBoard = [...state.board];
  nextBoard[targetIndex] = activePlayer;

  const nextHistory = [
    ...state.moveHistory,
    {
      column,
      row,
      player: activePlayer,
      timestamp: Date.now(),
    },
  ];

  // 1. Check for win
  const winResult = checkConnectFourWin(nextBoard);
  if (winResult) {
    return {
      ...state,
      board: nextBoard,
      status: STATUS_WON,
      winner: winResult.winner,
      winningCells: winResult.winningCells,
      scores: {
        ...state.scores,
        [winResult.winner]: state.scores[winResult.winner] + 1,
      },
      lastMove: { column, row },
      moveHistory: nextHistory,
      isAiThinking: false,
    };
  }

  // 2. Check for draw
  if (isBoardFull(nextBoard)) {
    return {
      ...state,
      board: nextBoard,
      status: STATUS_DRAW,
      winner: null,
      winningCells: null,
      scores: {
        ...state.scores,
        ties: state.scores.ties + 1,
      },
      lastMove: { column, row },
      moveHistory: nextHistory,
      isAiThinking: false,
    };
  }

  // 3. Next turn
  const nextTurn = getOpponentDisc(activePlayer);
  return {
    ...state,
    board: nextBoard,
    turn: nextTurn,
    lastMove: { column, row },
    moveHistory: nextHistory,
    isAiThinking: false,
  };
}
