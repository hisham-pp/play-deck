import type { PenFightAction, PenFightState } from '../types/pen-fight.types';
import { MODE_AI, ROUNDS_TO_WIN } from './pen-fight-constants';
import { createInitialPenFightState, getOpponent } from './pen-fight-state';

export function penFightReducer(state: PenFightState, action: PenFightAction): PenFightState {
  switch (action.type) {
    case 'SET_MODE': {
      if (state.mode === action.mode) return state;
      return createInitialPenFightState(action.mode, state.difficulty, state.speedMode);
    }

    case 'SET_SPEED_MODE': {
      return { ...state, speedMode: action.speedMode };
    }

    case 'SET_DIFFICULTY': {
      return { ...state, difficulty: action.difficulty };
    }

    case 'SET_PLAYER_NAME': {
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...state.players[action.playerId],
            displayName: action.name.trim() || state.players[action.playerId].displayName,
          },
        },
      };
    }

    case 'SET_PLAYER_COLOR': {
      const opponentId = getOpponent(action.playerId);
      if (state.players[opponentId].color === action.color) return state;
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: { ...state.players[action.playerId], color: action.color },
        },
      };
    }

    case 'START_MATCH': {
      return createInitialPenFightState(state.mode, state.difficulty, state.speedMode);
    }

    case 'FLICK_TAKEN': {
      if (state.phase !== 'aiming') return state;
      return {
        ...state,
        phase: 'flicking',
        flickCount: state.flickCount + 1,
        totalFlicks: state.totalFlicks + 1,
      };
    }

    case 'BEGIN_SETTLING': {
      return { ...state, phase: 'settling' };
    }

    case 'ROUND_RESOLVED': {
      if (action.winner === null) {
        // Nothing fell yet — hand the turn to the other player and keep aiming.
        return {
          ...state,
          phase: 'aiming',
          activePlayer: getOpponent(state.activePlayer),
        };
      }

      const nextPlayers = { ...state.players };
      if (action.winner !== 'draw') {
        nextPlayers[action.winner] = {
          ...nextPlayers[action.winner],
          roundWins: nextPlayers[action.winner].roundWins + 1,
        };
      }

      const matchWinner =
        action.winner !== 'draw' && nextPlayers[action.winner].roundWins >= ROUNDS_TO_WIN
          ? action.winner
          : null;

      return {
        ...state,
        players: nextPlayers,
        roundWinner: action.winner,
        matchWinner,
        phase: matchWinner ? 'match-over' : 'round-over',
      };
    }

    case 'NEXT_ROUND': {
      const nextStartingPlayer = getOpponent(state.startingPlayer);
      return {
        ...state,
        round: state.round + 1,
        startingPlayer: nextStartingPlayer,
        activePlayer: nextStartingPlayer,
        phase: 'aiming',
        roundWinner: null,
        flickCount: 0,
      };
    }

    case 'REQUEST_REMATCH': {
      const preserved = createInitialPenFightState(state.mode, state.difficulty);
      return {
        ...preserved,
        players: {
          p1: {
            ...preserved.players.p1,
            displayName: state.players.p1.displayName,
            color: state.players.p1.color,
          },
          p2:
            state.mode === MODE_AI
              ? preserved.players.p2
              : {
                  ...preserved.players.p2,
                  displayName: state.players.p2.displayName,
                  color: state.players.p2.color,
                },
        },
      };
    }

    default:
      return state;
  }
}
