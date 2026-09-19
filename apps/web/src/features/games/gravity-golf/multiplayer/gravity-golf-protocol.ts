import type { GolfPlayer, GravityObject, HoleScore } from '../types/gravity-golf.types';

export const GOLF_MSG = {
  SEATS: 'GOLF_SEATS',
  SELECT_HOLE: 'GOLF_SELECT_HOLE',
  PLACE_OBJECT: 'GOLF_PLACE_OBJECT',
  REMOVE_OBJECT: 'GOLF_REMOVE_OBJECT',
  CLEAR_OBJECTS: 'GOLF_CLEAR_OBJECTS',
  LAUNCH_BALL: 'GOLF_LAUNCH_BALL',
  BALL_SUNK: 'GOLF_BALL_SUNK',
  HOLE_RESULT: 'GOLF_HOLE_RESULT',
  NEXT_HOLE: 'GOLF_NEXT_HOLE',
  RESTART_COURSE: 'GOLF_RESTART_COURSE',
} as const;

export type GolfMessageType = (typeof GOLF_MSG)[keyof typeof GOLF_MSG];

export interface SeatsPayload {
  seats: (GolfPlayer | null)[];
  hostId: string;
}

export interface SelectHolePayload {
  holeNumber: number;
}

export interface PlaceObjectPayload {
  object: GravityObject;
  senderId: string;
}

export interface RemoveObjectPayload {
  objectId: string;
  senderId: string;
}

export interface ClearObjectsPayload {
  senderId: string;
}

export interface LaunchBallPayload {
  holeNumber: number;
  senderId: string;
  timestamp: number;
}

export interface BallSunkPayload {
  holeNumber: number;
  playerId: string;
  strokes: number;
  flightTicks: number;
}

export interface HoleResultPayload {
  holeNumber: number;
  scores: Record<string, HoleScore>;
}

export interface GolfWireEnvelope<T = unknown> {
  type: GolfMessageType;
  payload: T;
  senderId: string;
  sentAt: number;
}

export function createGolfEnvelope<T>(
  type: GolfMessageType,
  payload: T,
  senderId: string,
): GolfWireEnvelope<T> {
  return {
    type,
    payload,
    senderId,
    sentAt: Date.now(),
  };
}

export function isValidGolfEnvelope(data: unknown): data is GolfWireEnvelope {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Partial<GolfWireEnvelope>;
  return (
    typeof candidate.type === 'string' &&
    candidate.payload !== undefined &&
    typeof candidate.senderId === 'string' &&
    typeof candidate.sentAt === 'number'
  );
}
