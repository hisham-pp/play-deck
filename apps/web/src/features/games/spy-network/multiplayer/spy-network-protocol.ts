import type { SpyNetworkPhase, SpyNetworkState } from '../types/spy-network.types';

export const SN_EVENTS = {
  startGame: 'sn:start_game',
  submitQA: 'sn:submit_qa',
  castVote: 'sn:cast_vote',
  startVoting: 'sn:start_voting',
  spyGuess: 'sn:spy_guess',
  updateState: 'sn:update_state',
  phaseChange: 'sn:phase_change',
} as const;

export interface SnSubmitQAPayload {
  questionerId: string;
  respondentId: string;
  question: string;
  answer: string;
}

export interface SnCastVotePayload {
  voterId: string;
  suspectId: string;
}

export interface SnSpyGuessPayload {
  spyId: string;
  guessedLocation: string;
}

export interface SnUpdateStatePayload {
  state: SpyNetworkState;
}

export interface SnPhaseChangePayload {
  phase: SpyNetworkPhase;
}
