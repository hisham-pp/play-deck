import type {
  Obstacle,
  RacingPlayer,
  RaceStandings,
  VehicleState,
} from '../types/reverse-racing.types';

export const RR_MSG = {
  SEATS: 'RR_SEATS',
  START_RACE: 'RR_START_RACE',
  VEHICLE_UPDATE: 'RR_VEHICLE_UPDATE',
  OBSTACLE_PLACED: 'RR_OBSTACLE_PLACED',
  COLLISION_EVENT: 'RR_COLLISION_EVENT',
  RACER_FINISHED: 'RR_RACER_FINISHED',
  RACE_OVER: 'RR_RACE_OVER',
  REMATCH: 'RR_REMATCH',
} as const;

export type ReverseRacingMessageType = (typeof RR_MSG)[keyof typeof RR_MSG];

export interface SeatsPayload {
  seats: (RacingPlayer | null)[];
  hostId: string;
}

export interface StartRacePayload {
  seed: number;
  sabotageChain: [string, string][]; // [saboteurId, targetRacerId][]
  startTime: number;
}

export interface VehicleUpdatePayload {
  vehicle: VehicleState;
}

export interface ObstaclePlacedPayload {
  obstacle: Obstacle;
}

export interface CollisionEventPayload {
  playerId: string;
  obstacleId: string;
  type: string;
}

export interface RacerFinishedPayload {
  playerId: string;
  finishTimeMs: number;
  crashes: number;
}

export interface RaceOverPayload {
  standings: RaceStandings[];
}

export interface RRWireEnvelope<T = unknown> {
  type: ReverseRacingMessageType | string;
  payload: T;
  senderId: string;
  timestamp: number;
}

export function createRREnvelope<T>(
  type: ReverseRacingMessageType,
  payload: T,
  senderId: string,
): RRWireEnvelope<T> {
  return {
    type,
    payload,
    senderId,
    timestamp: Date.now(),
  };
}
