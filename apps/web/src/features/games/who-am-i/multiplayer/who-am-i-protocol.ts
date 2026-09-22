import type { VoteAnswer, WhoAmIPhase, WhoAmIState } from '../types/who-am-i.types';

export const WHO_AM_I_EVENTS = {
  askQuestion: 'wai:ask_question',
  answerQuestion: 'wai:answer_question',
  submitGuess: 'wai:submit_guess',
  passTurn: 'wai:pass_turn',
  updateState: 'wai:update_state',
  phaseChange: 'wai:phase_change',
} as const;

export interface WaiAskQuestionPayload {
  questionerId: string;
  questionText: string;
}

export interface WaiAnswerQuestionPayload {
  respondentId: string;
  answer: VoteAnswer;
}

export interface WaiSubmitGuessPayload {
  playerId: string;
  guessText: string;
}

export interface WaiPassTurnPayload {
  playerId: string;
}

export interface WaiUpdateStatePayload {
  state: WhoAmIState;
}

export interface WaiPhaseChangePayload {
  phase: WhoAmIPhase;
}
