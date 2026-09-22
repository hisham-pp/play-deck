import type {
  Accusation,
  SecretMissionPlayer,
  SecretMissionState,
} from '../types/secret-mission.types';
import { getRandomMissions } from './missions-database';

const ROUND_DURATION = 120;
const ACCUSATION_DURATION = 30;
const CORRECT_CATCH_BONUS = 150;
const CAUGHT_PENALTY = -100;
const WRONG_ACCUSATION_PENALTY = -50;
const MISSION_COMPLETE_POINTS = 300;
const MISSION_COMPLETE_UNDETECTED = 500;

export function createInitialState(
  players: Array<{
    id: string;
    displayName: string;
    avatar: string;
    isHost: boolean;
    isBot: boolean;
  }>,
  maxRounds = 3,
): SecretMissionState {
  const missions = getRandomMissions(players.length);

  const gamePlayers: SecretMissionPlayer[] = players.map((p, idx) => ({
    id: p.id,
    displayName: p.displayName,
    avatar: p.avatar,
    isHost: p.isHost,
    isBot: p.isBot,
    mission: missions[idx % missions.length] ?? null,
    isMissionComplete: false,
    wasCaught: false,
    score: 0,
    accusationsMade: 0,
    successfulAccusations: 0,
  }));

  return {
    phase: 'playing',
    players: gamePlayers,
    accusations: [],
    roundTimeRemaining: ROUND_DURATION,
    accusationTimeRemaining: ACCUSATION_DURATION,
    roundNumber: 1,
    maxRounds,
  };
}

export function declareMissionComplete(
  state: SecretMissionState,
  playerId: string,
): SecretMissionState {
  if (state.phase !== 'playing') return state;

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== playerId || p.isMissionComplete) return p;
    return { ...p, isMissionComplete: true };
  });

  return { ...state, players: updatedPlayers };
}

export function makeAccusation(
  state: SecretMissionState,
  accuserId: string,
  suspectId: string,
  missionDescription: string,
): SecretMissionState {
  if (state.phase !== 'playing' && state.phase !== 'accusation') return state;

  const accuser = state.players.find((p) => p.id === accuserId);
  const suspect = state.players.find((p) => p.id === suspectId);
  if (!accuser || !suspect) return state;

  const accusation: Accusation = {
    accuserId,
    accuserName: accuser.displayName,
    suspectId,
    suspectName: suspect.displayName,
    missionDescription,
    result: null,
    resolvedAt: null,
  };

  const updatedPlayers = state.players.map((p) =>
    p.id === accuserId ? { ...p, accusationsMade: p.accusationsMade + 1 } : p,
  );

  return {
    ...state,
    phase: 'accusation',
    accusations: [...state.accusations, accusation],
    players: updatedPlayers,
    accusationTimeRemaining: ACCUSATION_DURATION,
  };
}

export function resolveAccusation(
  state: SecretMissionState,
  accusationIdx: number,
  isCorrect: boolean,
): SecretMissionState {
  if (accusationIdx < 0 || accusationIdx >= state.accusations.length) return state;

  const accusation = state.accusations[accusationIdx]!;
  const result = isCorrect ? 'caught' : 'wrong-accusation';
  const updatedAccusation: Accusation = {
    ...accusation,
    result,
    resolvedAt: Date.now(),
  };

  const updatedAccusations = state.accusations.map((a, i) =>
    i === accusationIdx ? updatedAccusation : a,
  );

  const updatedPlayers = state.players.map((p) => {
    if (p.id === accusation.accuserId && isCorrect) {
      return {
        ...p,
        score: p.score + CORRECT_CATCH_BONUS,
        successfulAccusations: p.successfulAccusations + 1,
      };
    }
    if (p.id === accusation.accuserId && !isCorrect) {
      return { ...p, score: Math.max(0, p.score + WRONG_ACCUSATION_PENALTY) };
    }
    if (p.id === accusation.suspectId && isCorrect) {
      return { ...p, wasCaught: true, score: Math.max(0, p.score + CAUGHT_PENALTY) };
    }
    return p;
  });

  return {
    ...state,
    phase: 'playing',
    accusations: updatedAccusations,
    players: updatedPlayers,
  };
}

export function endRound(state: SecretMissionState): SecretMissionState {
  if (state.roundNumber >= state.maxRounds) {
    return tallyFinalScores({ ...state, phase: 'reveal' });
  }

  const resetPlayers = state.players.map((p) => ({
    ...p,
    isMissionComplete: false,
    wasCaught: false,
  }));

  return {
    ...state,
    phase: 'playing',
    players: resetPlayers,
    roundNumber: state.roundNumber + 1,
    roundTimeRemaining: ROUND_DURATION,
  };
}

export function tallyFinalScores(state: SecretMissionState): SecretMissionState {
  const updatedPlayers = state.players.map((p) => {
    let bonus = 0;
    if (p.isMissionComplete && !p.wasCaught) {
      bonus = MISSION_COMPLETE_UNDETECTED;
    } else if (p.isMissionComplete) {
      bonus = MISSION_COMPLETE_POINTS;
    }
    return { ...p, score: p.score + bonus };
  });

  return { ...state, phase: 'game-over', players: updatedPlayers };
}
