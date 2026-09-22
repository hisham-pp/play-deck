import type { TelephoneState } from '../types/telephone-drawing.types';

export const TELEPHONE_EVENTS = {
  submitDrawing: 'tel:submit_drawing',
  submitDescription: 'tel:submit_description',
  updateState: 'tel:update_state',
  advanceReveal: 'tel:advance_reveal',
  castVote: 'tel:cast_vote',
  restart: 'tel:restart',
} as const;

export interface TelSubmitDrawingPayload {
  playerId: string;
  drawingData: string;
}

export interface TelSubmitDescriptionPayload {
  playerId: string;
  text: string;
}

export interface TelUpdateStatePayload {
  state: TelephoneState;
}

export interface TelCastVotePayload {
  voterId: string;
  stepIndex: number;
}
