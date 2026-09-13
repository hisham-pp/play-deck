import type {
  AIDifficulty,
  ConnectFourDisc,
  ConnectFourState,
  GameMode,
} from '../types/connect-four.types';
import {
  DIFFICULTY_MEDIUM,
  DISC_RED,
  MODE_LOCAL_2P,
  STATUS_PLAYING,
} from './connect-four-constants';
import { createEmptyBoard } from './connect-four-utils';

export function createInitialConnectFourState(
  mode: GameMode = MODE_LOCAL_2P,
  difficulty: AIDifficulty = DIFFICULTY_MEDIUM,
  startingPlayer: ConnectFourDisc = DISC_RED,
  humanPlayerDisc: ConnectFourDisc = DISC_RED,
): ConnectFourState {
  return {
    board: createEmptyBoard(),
    turn: startingPlayer,
    startingPlayer,
    status: STATUS_PLAYING,
    winner: null,
    winningCells: null,
    mode,
    aiDifficulty: difficulty,
    humanPlayerDisc,
    scores: { R: 0, Y: 0, ties: 0 },
    round: 1,
    moveHistory: [],
    lastMove: null,
    isAiThinking: false,
  };
}
