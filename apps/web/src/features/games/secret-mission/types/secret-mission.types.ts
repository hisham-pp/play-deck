export type MissionType = 'social' | 'behavioral' | 'meta';
export type MissionPhase = 'lobby' | 'playing' | 'accusation' | 'reveal' | 'game-over';
export type AccusationResult = 'caught' | 'escaped' | 'wrong-accusation';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  completionCriteria: string;
}

export interface Accusation {
  accuserId: string;
  accuserName: string;
  suspectId: string;
  suspectName: string;
  missionDescription: string;
  result: AccusationResult | null;
  resolvedAt: number | null;
}

export interface SecretMissionPlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  mission: Mission | null;
  isMissionComplete: boolean;
  wasCaught: boolean;
  score: number;
  accusationsMade: number;
  successfulAccusations: number;
}

export interface SecretMissionState {
  phase: MissionPhase;
  players: SecretMissionPlayer[];
  accusations: Accusation[];
  roundTimeRemaining: number;
  accusationTimeRemaining: number;
  roundNumber: number;
  maxRounds: number;
}
