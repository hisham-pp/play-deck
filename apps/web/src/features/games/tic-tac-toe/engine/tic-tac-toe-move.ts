import type { PlayerMark, TicTacToeState } from '../types/tic-tac-toe.types';
import { STATUS_DRAW, STATUS_PLAYING, STATUS_WON } from './tic-tac-toe-constants';
import { checkWin, getOpponentMark, isBoardFull } from './tic-tac-toe-utils';

/**
 * Validates and executes a move on the Tic-Tac-Toe board,
 * transitioning the board state, detecting wins/draws, and updating score tallies.
 */
export function applyMove(
  state: TicTacToeState,
  index: number,
  player?: PlayerMark,
): TicTacToeState {
  // Reject if match is not currently in progress
  if (state.status !== STATUS_PLAYING) {
    return state;
  }

  // Reject out-of-bounds indices
  if (index < 0 || index >= state.board.length) {
    return state;
  }

  // Reject already occupied cells
  if (state.board[index] !== null) {
    return state;
  }

  // Reject if action specifies a player mark that doesn't match current turn
  if (player && player !== state.turn) {
    return state;
  }

  const activePlayer = state.turn;
  const nextBoard = [...state.board];
  nextBoard[index] = activePlayer;

  const nextHistory = [
    ...state.moveHistory,
    {
      index,
      player: activePlayer,
      timestamp: Date.now(),
    },
  ];

  // 1. Check for win
  const winResult = checkWin(nextBoard);
  if (winResult) {
    return {
      ...state,
      board: nextBoard,
      status: STATUS_WON,
      winner: winResult.winner,
      winningLine: winResult.line,
      scores: {
        ...state.scores,
        [winResult.winner]: state.scores[winResult.winner] + 1,
      },
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
      winningLine: null,
      scores: {
        ...state.scores,
        ties: state.scores.ties + 1,
      },
      moveHistory: nextHistory,
      isAiThinking: false,
    };
  }

  // 3. Continue match to next turn
  const nextTurn = getOpponentMark(activePlayer);
  return {
    ...state,
    board: nextBoard,
    turn: nextTurn,
    moveHistory: nextHistory,
    isAiThinking: false,
  };
}
