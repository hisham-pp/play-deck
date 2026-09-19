import type {
  BrainCharacterState,
  PlayerPair,
  SharedBrainPlayer,
  SharedBrainRole,
} from '../types/shared-brain.types';

export const SB_MSG = {
  ROSTER: 'SB_ROSTER',
  SWAP_ROLE: 'SB_SWAP_ROLE',
  START_RUN: 'SB_START_RUN',
  INPUT_EVENT: 'SB_INPUT_EVENT',
  CHARACTER_SYNC: 'SB_CHARACTER_SYNC',
  COURSE_CLEAR: 'SB_COURSE_CLEAR',
  RESTART: 'SB_RESTART',
} as const;

export type SharedBrainMessageType = (typeof SB_MSG)[keyof typeof SB_MSG];

export interface RosterPayload {
  players: SharedBrainPlayer[];
  pairs: PlayerPair[];
  hostId: string;
}

export interface SwapRolePayload {
  playerId: string;
  newRole: SharedBrainRole;
}

export interface StartRunPayload {
  courseId: string;
  seed: number;
  startTime: number;
}

export interface InputEventPayload {
  pairId: string;
  senderRole: SharedBrainRole;
  inputs: {
    moveLeft?: boolean;
    moveRight?: boolean;
    jumpPressed?: boolean;
    interactPressed?: boolean;
  };
}

export interface CharacterSyncPayload {
  pairId: string;
  character: BrainCharacterState;
}

export interface CourseClearPayload {
  pairId: string;
  courseId: string;
  finishTimeMs: number;
  tokensCollected: number;
}

export interface SBWireEnvelope<T = unknown> {
  type: SharedBrainMessageType | string;
  payload: T;
  senderId: string;
  timestamp: number;
}

export type SharedBrainActionEnvelope<T = unknown> = SBWireEnvelope<T>;

export function createSBEnvelope<T>(
  type: SharedBrainMessageType,
  payload: T,
  senderId: string,
): SBWireEnvelope<T> {
  return {
    type,
    payload,
    senderId,
    timestamp: Date.now(),
  };
}
