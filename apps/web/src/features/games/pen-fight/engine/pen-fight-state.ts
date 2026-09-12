import type {
  AIDifficulty,
  PenFightMode,
  PenFightState,
  PenSpeedMode,
} from '../types/pen-fight.types';
import {
  DEFAULT_PLAYER_ONE_COLOR,
  DEFAULT_PLAYER_TWO_COLOR,
  DIFFICULTY_PRO,
  MAX_ROUNDS,
  MODE_AI,
  PLAYER_ONE,
  PLAYER_TWO,
  SPEED_NORMAL,
} from './pen-fight-constants';

export function createInitialPenFightState(
  mode: PenFightMode = MODE_AI,
  difficulty: AIDifficulty = DIFFICULTY_PRO,
  speedMode: PenSpeedMode = SPEED_NORMAL,
): PenFightState {
  return {
    mode,
    speedMode,
    difficulty,
    players: {
      p1: {
        id: PLAYER_ONE,
        displayName: 'Player 1',
        color: DEFAULT_PLAYER_ONE_COLOR,
        isAI: false,
        roundWins: 0,
      },
      p2: {
        id: PLAYER_TWO,
        displayName: mode === MODE_AI ? 'CPU Rival' : 'Player 2',
        color: DEFAULT_PLAYER_TWO_COLOR,
        isAI: mode === MODE_AI,
        roundWins: 0,
      },
    },
    activePlayer: PLAYER_ONE,
    startingPlayer: PLAYER_ONE,
    round: 1,
    maxRounds: MAX_ROUNDS,
    phase: 'aiming',
    roundWinner: null,
    matchWinner: null,
    flickCount: 0,
    totalFlicks: 0,
  };
}

export function getOpponent(playerId: 'p1' | 'p2'): 'p1' | 'p2' {
  return playerId === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}
