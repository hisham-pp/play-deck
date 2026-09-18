import type { ElevatorSnapshot } from '../engine/elevator-snapshot';
import type { ElevatorSeat } from '../types/unstable-elevator.types';

/**
 * Room protocol. The host is the only machine that simulates: guests send what
 * they want to do and render the snapshots that come back. That sidesteps
 * cross-browser float drift entirely — there is only ever one physics world.
 */
export const ROOM_EVENTS = {
  seats: 'SEATS',
  start: 'START',
  restart: 'RESTART',
  snapshot: 'SNAPSHOT',
  aim: 'AIM',
  dropRequest: 'DROP_REQUEST',
  syncRequest: 'SYNC_REQUEST',
} as const;

export interface StartPayload {
  seats: ElevatorSeat[];
  seed: string;
  slips: number;
}

export interface AimPayload {
  seatId: string;
  x: number;
  angle: number;
}

export interface DropRequestPayload {
  seatId: string;
}

export interface SnapshotPayload {
  snapshot: ElevatorSnapshot;
}

/** Milliseconds between host snapshots — about fourteen a second. */
export const SNAPSHOT_INTERVAL_MS = 70;
/** Milliseconds between a guest's claw updates while it drags. */
export const AIM_INTERVAL_MS = 60;

/** True when enough time has passed to send the next message of a kind. */
export function shouldSend(lastSentAt: number, now: number, intervalMs: number): boolean {
  return now - lastSentAt >= intervalMs;
}
