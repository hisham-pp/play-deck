import type { LavaPlayer, PowerUpType, Vector2D } from '../types/floor-is-lava.types';

export const FIL_MSG = {
  ROSTER: 'FIL_ROSTER',
  START_GAME: 'FIL_START_GAME',
  PLAYER_SYNC: 'FIL_PLAYER_SYNC',
  PUSH_ACTION: 'FIL_PUSH_ACTION',
  POWERUP_EVENT: 'FIL_POWERUP_EVENT',
  ELIMINATION: 'FIL_ELIMINATION',
  RESTART: 'FIL_RESTART',
} as const;

export type FloorIsLavaMessageType = (typeof FIL_MSG)[keyof typeof FIL_MSG];

export interface FILRosterPayload {
  players: LavaPlayer[];
  hostId: string;
}

export interface FILStartGamePayload {
  seed: number;
  startTime: number;
}

export interface FILPlayerSyncPayload {
  playerId: string;
  position: Vector2D;
  velocity: Vector2D;
  isAlive: boolean;
}

export interface FILPushActionPayload {
  pusherId: string;
  targetId: string;
  force: number;
}

export interface FILPowerUpEventPayload {
  playerId: string;
  powerUpId: string;
  powerUpType: PowerUpType;
}

export interface FILEliminationPayload {
  playerId: string;
  rank: number;
}

export interface FILWireEnvelope<T = unknown> {
  type: FloorIsLavaMessageType;
  payload: T;
  senderId: string;
}
