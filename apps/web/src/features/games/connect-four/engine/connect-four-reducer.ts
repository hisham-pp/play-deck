import type {
  ConnectFourAction,
  ConnectFourDisc,
  ConnectFourState,
} from '../types/connect-four.types';
import { DISC_RED, STATUS_PLAYING } from './connect-four-constants';
import { applyDrop } from './connect-four-move';
import { createEmptyBoard, getOpponentDisc } from './connect-four-utils';

export function connectFourReducer(
  state: ConnectFourState,
  action: ConnectFourAction,
): ConnectFourState {
  switch (action.type) {
    case 'DROP_PIECE': {
      return applyDrop(state, action.column, action.player);
    }

    case 'SET_MODE': {
      if (state.mode === action.mode) return state;
      return {
        ...state,
        mode: action.mode,
        board: createEmptyBoard(),
        turn: DISC_RED,
        startingPlayer: DISC_RED,
        status: STATUS_PLAYING,
        winner: null,
        winningCells: null,
        scores: { R: 0, Y: 0, ties: 0 },
        round: 1,
        moveHistory: [],
        lastMove: null,
        isAiThinking: false,
      };
    }

    case 'SET_DIFFICULTY': {
      return {
        ...state,
        aiDifficulty: action.difficulty,
      };
    }

    case 'SET_HUMAN_DISC': {
      if (state.humanPlayerDisc === action.disc) return state;
      return {
        ...state,
        humanPlayerDisc: action.disc,
        board: createEmptyBoard(),
        turn: DISC_RED,
        startingPlayer: DISC_RED,
        status: STATUS_PLAYING,
        winner: null,
        winningCells: null,
        moveHistory: [],
        lastMove: null,
        isAiThinking: false,
      };
    }

    case 'RESET_ROUND': {
      const nextStartingPlayer: ConnectFourDisc = getOpponentDisc(state.startingPlayer);
      return {
        ...state,
        board: createEmptyBoard(),
        startingPlayer: nextStartingPlayer,
        turn: nextStartingPlayer,
        status: STATUS_PLAYING,
        winner: null,
        winningCells: null,
        round: state.round + 1,
        moveHistory: [],
        lastMove: null,
        isAiThinking: false,
      };
    }

    case 'RESET_MATCH': {
      return {
        ...state,
        board: createEmptyBoard(),
        startingPlayer: DISC_RED,
        turn: DISC_RED,
        status: STATUS_PLAYING,
        winner: null,
        winningCells: null,
        scores: { R: 0, Y: 0, ties: 0 },
        round: 1,
        moveHistory: [],
        lastMove: null,
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
