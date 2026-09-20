import type { AlibiPhase, AlibiState } from '../types/alibi.types';

export const ALIBI_EVENTS = {
  startGame: 'alibi:start_game',
  startDiscussion: 'alibi:start_discussion',
  startVoting: 'alibi:start_voting',
  castVote: 'alibi:cast_vote',
  updateState: 'alibi:update_state',
  phaseChange: 'alibi:phase_change',
} as const;

export interface AlibiCastVotePayload {
  voterId: string;
  suspectId: string;
}

export interface AlibiUpdateStatePayload {
  state: AlibiState;
}

export interface AlibiPhaseChangePayload {
  phase: AlibiPhase;
}
