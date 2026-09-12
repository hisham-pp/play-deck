import type { PlayerMark, TicTacToeAction, TicTacToeState } from '../types/tic-tac-toe.types';
import { MARK_X, STATUS_PLAYING } from './tic-tac-toe-constants';
import { applyMove } from './tic-tac-toe-move';
import { createEmptyBoard } from './tic-tac-toe-state';
import { getOpponentMark } from './tic-tac-toe-utils';

export function ticTacToeReducer(state: TicTacToeState, action: TicTacToeAction): TicTacToeState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      return applyMove(state, action.index, action.player);
    }

    case 'SET_MODE': {
      if (state.mode === action.mode) return state;
      return {
        ...state,
        mode: action.mode,
        board: createEmptyBoard(),
        turn: MARK_X,
        startingPlayer: MARK_X,
        status: STATUS_PLAYING,
        winner: null,
        winningLine: null,
        scores: { X: 0, O: 0, ties: 0 },
        round: 1,
        moveHistory: [],
        isAiThinking: false,
      };
    }

    case 'SET_DIFFICULTY': {
      return {
        ...state,
        aiDifficulty: action.difficulty,
      };
    }

    case 'SET_HUMAN_MARK': {
      if (state.humanPlayerMark === action.mark) return state;
      return {
        ...state,
        humanPlayerMark: action.mark,
        board: createEmptyBoard(),
        turn: MARK_X,
        startingPlayer: MARK_X,
        status: STATUS_PLAYING,
        winner: null,
        winningLine: null,
        moveHistory: [],
        isAiThinking: false,
      };
    }

    case 'RESET_ROUND': {
      const nextStartingPlayer: PlayerMark = getOpponentMark(state.startingPlayer);
      return {
        ...state,
        board: createEmptyBoard(),
        startingPlayer: nextStartingPlayer,
        turn: nextStartingPlayer,
        status: STATUS_PLAYING,
        winner: null,
        winningLine: null,
        round: state.round + 1,
        moveHistory: [],
        isAiThinking: false,
      };
    }

    case 'RESET_MATCH': {
      return {
        ...state,
        board: createEmptyBoard(),
        startingPlayer: MARK_X,
        turn: MARK_X,
        status: STATUS_PLAYING,
        winner: null,
        winningLine: null,
        scores: { X: 0, O: 0, ties: 0 },
        round: 1,
        moveHistory: [],
        isAiThinking: false,
      };
    }

    case 'SET_AI_THINKING': {
      return {
        ...state,
        isAiThinking: action.thinking,
      };
    }

    default:
      return state;
  }
}
