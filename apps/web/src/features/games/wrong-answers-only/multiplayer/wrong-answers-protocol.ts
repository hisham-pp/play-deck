import type { WrongAnswersPhase, WrongAnswersState } from '../types/wrong-answers.types';

export const WA_EVENTS = {
  submitAnswer: 'wa:submit_answer',
  castVote: 'wa:cast_vote',
  updateState: 'wa:update_state',
  phaseChange: 'wa:phase_change',
  restart: 'wa:restart',
} as const;

export interface WaSubmitAnswerPayload {
  authorId: string;
  text: string;
}

export interface WaCastVotePayload {
  voterId: string;
  answerId: string;
}

export interface WaUpdateStatePayload {
  state: WrongAnswersState;
}

export interface WaPhaseChangePayload {
  phase: WrongAnswersPhase;
  durationSeconds: number;
}
