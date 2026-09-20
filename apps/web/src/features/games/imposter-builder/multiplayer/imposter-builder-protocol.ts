import type { ImposterBuilderPhase, ImposterBuilderState } from '../types/imposter-builder.types';

export const IB_EVENTS = {
  startGame: 'ib:start_game',
  toggleCell: 'ib:toggle_cell',
  revealBuilds: 'ib:reveal_builds',
  startDiscussion: 'ib:start_discussion',
  startVoting: 'ib:start_voting',
  castVote: 'ib:cast_vote',
  updateState: 'ib:update_state',
  phaseChange: 'ib:phase_change',
} as const;

export interface IbToggleCellPayload {
  playerId: string;
  row: number;
  col: number;
  color: string;
}

export interface IbCastVotePayload {
  voterId: string;
  suspectId: string;
}

export interface IbUpdateStatePayload {
  state: ImposterBuilderState;
}

export interface IbPhaseChangePayload {
  phase: ImposterBuilderPhase;
}
