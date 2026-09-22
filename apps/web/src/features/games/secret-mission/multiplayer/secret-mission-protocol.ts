import type { MissionPhase, SecretMissionState } from '../types/secret-mission.types';

export const SM_EVENTS = {
  startGame: 'sm:start_game',
  declareMissionComplete: 'sm:declare_complete',
  makeAccusation: 'sm:make_accusation',
  resolveAccusation: 'sm:resolve_accusation',
  endRound: 'sm:end_round',
  updateState: 'sm:update_state',
  phaseChange: 'sm:phase_change',
} as const;

export interface SmStartGamePayload {
  hostId: string;
}

export interface SmDeclareMissionCompletePayload {
  playerId: string;
}

export interface SmMakeAccusationPayload {
  accuserId: string;
  suspectId: string;
  missionDescription: string;
}

export interface SmResolveAccusationPayload {
  accusationIdx: number;
  isCorrect: boolean;
}

export interface SmUpdateStatePayload {
  state: SecretMissionState;
}

export interface SmPhaseChangePayload {
  phase: MissionPhase;
}
