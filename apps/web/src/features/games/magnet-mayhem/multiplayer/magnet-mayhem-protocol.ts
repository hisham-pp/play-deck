import type {
  MagnetAction,
  MagnetPlayer,
  TargetTier,
  Vector2D,
} from '../types/magnet-mayhem.types';

export const MM_MSG = {
  ROSTER: 'MM_ROSTER',
  START_GAME: 'MM_START_GAME',
  PLAYER_INPUT: 'MM_PLAYER_INPUT',
  PLAYER_SYNC: 'MM_PLAYER_SYNC',
  TARGET_COLLECT: 'MM_TARGET_COLLECT',
  HAZARD_ZAP: 'MM_HAZARD_ZAP',
  RESTART: 'MM_RESTART',
} as const;

export type MagnetMessageType = (typeof MM_MSG)[keyof typeof MM_MSG];

export interface MMRosterPayload {
  players: MagnetPlayer[];
  hostId: string;
}

export interface MMStartGamePayload {
  seed: number;
  startTime: number;
  durationSec: number;
}

export interface MMPlayerInputPayload {
  playerId: string;
  aimAngle: number;
  action: MagnetAction;
}

export interface MMPlayerSyncPayload {
  playerId: string;
  position: Vector2D;
  velocity: Vector2D;
  aimAngle: number;
  action: MagnetAction;
  energy: number;
  score: number;
}

export interface MMTargetCollectPayload {
  playerId: string;
  targetId: string;
  tier: TargetTier;
  value: number;
}

export interface MMHazardZapPayload {
  playerId: string;
  hazardId: string;
}

export interface MMWireEnvelope<T = unknown> {
  type: MagnetMessageType;
  payload: T;
  senderId: string;
}

export function encodeMagnetEnvelope<T>(
  type: MagnetMessageType,
  payload: T,
  senderId: string,
): string {
  return JSON.stringify({ type, payload, senderId });
}

export function decodeMagnetEnvelope<T = unknown>(raw: string): MMWireEnvelope<T> | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.type === 'string' && typeof parsed.senderId === 'string') {
      return parsed as MMWireEnvelope<T>;
    }
    return null;
  } catch {
    return null;
  }
}
