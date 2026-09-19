import type {
  GravityDirection,
  GravityShiftPlayer,
  PhysicsCharacter,
} from '../types/gravity-shift.types';

export const GS_MSG = {
  ROSTER: 'GS_ROSTER',
  START_RACE: 'GS_START_RACE',
  POSITION_SYNC: 'GS_POSITION_SYNC',
  GRAVITY_SHIFT: 'GS_GRAVITY_SHIFT',
  CHECKPOINT: 'GS_CHECKPOINT',
  FINISH: 'GS_FINISH',
  RESTART: 'GS_RESTART',
} as const;

export type GravityShiftMessageType = (typeof GS_MSG)[keyof typeof GS_MSG];

export interface GSRosterPayload {
  players: GravityShiftPlayer[];
  courseId: string;
  hostId: string;
}

export interface GSStartRacePayload {
  courseId: string;
  startTime: number;
}

export interface GSPositionSyncPayload {
  playerId: string;
  character: PhysicsCharacter;
}

export interface GSGravityShiftPayload {
  newGravity: GravityDirection;
  shiftedBy: string;
  timestamp: number;
}

export interface GSCheckpointPayload {
  playerId: string;
  checkpointId: string;
  checkpointsPassed: number;
}

export interface GSFinishPayload {
  playerId: string;
  finishTimeMs: number;
  rank: number;
}

export interface GSRestartPayload {
  courseId: string;
}

export interface GSWireEnvelope<T = unknown> {
  type: GravityShiftMessageType;
  payload: T;
  senderId: string;
}
