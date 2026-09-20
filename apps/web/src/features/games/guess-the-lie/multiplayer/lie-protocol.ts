import type {
  GuessTheLiePhase,
  LiePlayer,
  LiePrompt,
  PromptCategory,
} from '../types/guess-the-lie.types';

export const LIE_EVENTS = {
  start: 'LIE_START_ROUND',
  submitAnswer: 'LIE_SUBMIT_ANSWER',
  castVote: 'LIE_CAST_VOTE',
  phaseChange: 'LIE_PHASE_CHANGE',
  nextRound: 'LIE_NEXT_ROUND',
  restart: 'LIE_RESTART',
} as const;

export interface LieStartPayload {
  category: PromptCategory | 'all';
  maxRounds: number;
  answerDuration: number;
  discussionDuration: number;
  players: LiePlayer[];
  prompt: LiePrompt;
}

export interface LieSubmitAnswerPayload {
  playerId: string;
  text: string;
}

export interface LieCastVotePayload {
  voterId: string;
  answerId: string;
}

export interface LiePhaseChangePayload {
  phase: GuessTheLiePhase;
  durationSeconds: number;
}

const T_OBJ = 'object';
const T_STR = 'string';

export function isLieStartPayload(data: unknown): data is LieStartPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as LieStartPayload;
  return Boolean(p.prompt) && Array.isArray(p.players);
}

export function isLieSubmitAnswerPayload(data: unknown): data is LieSubmitAnswerPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as LieSubmitAnswerPayload;
  return typeof p.playerId === T_STR && typeof p.text === T_STR;
}

export function isLieCastVotePayload(data: unknown): data is LieCastVotePayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as LieCastVotePayload;
  return typeof p.voterId === T_STR && typeof p.answerId === T_STR;
}

export function isLiePhaseChangePayload(data: unknown): data is LiePhaseChangePayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as LiePhaseChangePayload;
  return typeof p.phase === T_STR;
}
