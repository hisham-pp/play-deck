import type {
  ArchitectDifficulty,
  ArchitectPhase,
  ArchitectPlayer,
  ArchitectVote,
  Blueprint,
  Grid8x8,
} from '../types/bad-architect.types';

export const ARCHITECT_EVENTS = {
  start: 'ARCHITECT_START_ROUND',
  startRound: 'ARCHITECT_START_ROUND',
  submitBuild: 'ARCHITECT_SUBMIT_BUILD',
  castVote: 'ARCHITECT_CAST_VOTE',
  phaseChange: 'ARCHITECT_PHASE_CHANGE',
  revealBuilds: 'ARCHITECT_REVEAL_BUILDS',
  nextRound: 'ARCHITECT_NEXT_ROUND',
  restart: 'ARCHITECT_RESTART',
} as const;

export interface ArchitectStartRoundPayload {
  round?: number;
  difficulty?: ArchitectDifficulty;
  maxRounds?: number;
  blueprint: Blueprint;
  architectId?: string;
  players: ArchitectPlayer[];
  buildDuration: number;
}

export type ArchitectStartPayload = ArchitectStartRoundPayload;

export interface ArchitectSubmitBuildPayload {
  playerId: string;
  grid: Grid8x8;
}

export interface ArchitectCastVotePayload {
  vote: ArchitectVote;
}

export interface ArchitectPhaseChangePayload {
  phase: ArchitectPhase;
  durationSeconds: number;
}

const T_OBJ = 'object';
const T_STR = 'string';

export function isArchitectStartPayload(data: unknown): data is ArchitectStartPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as ArchitectStartPayload;
  return Boolean(p.blueprint) && Array.isArray(p.players);
}

export function isArchitectSubmitPayload(data: unknown): data is ArchitectSubmitBuildPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as ArchitectSubmitBuildPayload;
  return typeof p.playerId === T_STR && Array.isArray(p.grid);
}

export const isArchitectSubmitBuildPayload = isArchitectSubmitPayload;

export function isArchitectCastVotePayload(data: unknown): data is ArchitectCastVotePayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as ArchitectCastVotePayload;
  return Boolean(p.vote);
}

export function isArchitectPhaseChangePayload(data: unknown): data is ArchitectPhaseChangePayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as ArchitectPhaseChangePayload;
  return typeof p.phase === T_STR;
}
