import type {
  AIDifficulty,
  BoardCell,
  GameMode,
  PlayerMark,
  TicTacToeState,
} from '../types/tic-tac-toe.types';
import {
  BOARD_SIZE,
  DIFFICULTY_MEDIUM,
  MARK_X,
  MODE_SINGLE,
  STATUS_PLAYING,
} from './tic-tac-toe-constants';

export function createEmptyBoard(): BoardCell[] {
  return Array<BoardCell>(BOARD_SIZE).fill(null);
}

export function createInitialTicTacToeState(
  mode: GameMode = MODE_SINGLE,
  aiDifficulty: AIDifficulty = DIFFICULTY_MEDIUM,
  startingPlayer: PlayerMark = MARK_X,
  humanPlayerMark: PlayerMark = MARK_X,
): TicTacToeState {
  return {
    board: createEmptyBoard(),
    turn: startingPlayer,
    startingPlayer,
    status: STATUS_PLAYING,
    winner: null,
    winningLine: null,
    mode,
    aiDifficulty,
    humanPlayerMark,
    scores: {
      X: 0,
      O: 0,
      ties: 0,
    },
    round: 1,
    moveHistory: [],
    isAiThinking: false,
  };
}
