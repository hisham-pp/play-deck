import type { ShadowTagSeat, TagEvent } from '../types/shadow-tag.types';

/** Wire message types on the shared room channel. */
export const ST_MSG = {
  SEATS: 'ST_SEATS',
  START: 'ST_START',
  POSE: 'ST_POSE',
  TAG: 'ST_TAG',
  SNAPSHOT: 'ST_SNAPSHOT',
  SYNC_REQUEST: 'ST_SYNC_REQUEST',
  REMATCH: 'ST_REMATCH',
} as const;

/** Own position goes out at roughly 14Hz; the authoritative snapshot much slower. */
export const POSE_INTERVAL_MS = 70;
export const SNAPSHOT_INTERVAL_MS = 420;
/** Remote bodies are drawn slightly in the past so there are two samples to blend. */
export const POSE_RENDER_DELAY_MS = 120;
export const MAX_EXTRAPOLATION_MS = 220;
const MAX_BUFFER = 14;

export interface RoundStartPayload {
  roundId: string;
  seats: ShadowTagSeat[];
  arenaId: string;
  roundMs: number;
  itId: string;
}

export interface PosePayload {
  roundId: string;
  /** x, y, facing. */
  pose: [number, number, number];
  sneaking: boolean;
}

export interface LightPatch {
  id: string;
  angle: number;
  speed: number;
  intensity: number;
  blockedUntilMs: number;
}

export interface ScorePatch {
  id: string;
  score: number;
  tags: number;
  timesTagged: number;
}

export interface SnapshotPayload {
  roundId: string;
  elapsedMs: number;
  itId: string;
  ended: boolean;
  lights: LightPatch[];
  scores: ScorePatch[];
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export function isRoundStart(v: unknown): v is RoundStartPayload {
  return (
    isRecord(v) &&
    typeof v.roundId === 'string' &&
    Array.isArray(v.seats) &&
    typeof v.arenaId === 'string' &&
    isNum(v.roundMs) &&
    typeof v.itId === 'string'
  );
}

export function isPose(v: unknown): v is PosePayload {
  return (
    isRecord(v) &&
    typeof v.roundId === 'string' &&
    Array.isArray(v.pose) &&
    v.pose.length === 3 &&
    v.pose.every(isNum)
  );
}

export function isTagEvent(v: unknown): v is TagEvent {
  return (
    isRecord(v) &&
    typeof v.taggerId === 'string' &&
    typeof v.victimId === 'string' &&
    isNum(v.atMs) &&
    isRecord(v.at) &&
    isNum(v.at.x) &&
    isNum(v.at.y)
  );
}

export function isSnapshot(v: unknown): v is SnapshotPayload {
  return (
    isRecord(v) &&
    typeof v.roundId === 'string' &&
    isNum(v.elapsedMs) &&
    typeof v.itId === 'string' &&
    Array.isArray(v.lights) &&
    Array.isArray(v.scores)
  );
}

export function createRoundId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function encodePose(
  roundId: string,
  pos: { x: number; y: number },
  facing: number,
  sneaking: boolean,
): PosePayload {
  return { roundId, pose: [round1(pos.x), round1(pos.y), round1(facing)], sneaking };
}

function blend(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  // Facing wraps at the half-turn, so it is blended the short way round.
  let turn = b[2] - a[2];
  while (turn > Math.PI) turn -= Math.PI * 2;
  while (turn < -Math.PI) turn += Math.PI * 2;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + turn * t];
}

function toPose(pose: [number, number, number]) {
  return { x: pose[0], y: pose[1], facing: pose[2] };
}

/** Buffers timestamped poses and samples a smooth position slightly in the past. */
export class PoseTrack {
  private samples: { at: number; pose: [number, number, number] }[] = [];

  push(pose: [number, number, number], receivedAt: number): void {
    this.samples.push({ at: receivedAt, pose });
    if (this.samples.length > MAX_BUFFER) this.samples.shift();
  }

  clear(): void {
    this.samples = [];
  }

  sample(now: number): { x: number; y: number; facing: number } | null {
    const list = this.samples;
    if (list.length === 0) return null;

    const target = now - POSE_RENDER_DELAY_MS;
    if (list.length === 1 || target <= list[0].at) return toPose(list[0].pose);

    for (let i = list.length - 1; i > 0; i--) {
      const a = list[i - 1];
      const b = list[i];
      if (target >= a.at && target <= b.at) {
        return toPose(blend(a.pose, b.pose, (target - a.at) / Math.max(1, b.at - a.at)));
      }
    }

    // Past the newest sample: extrapolate briefly, then hold rather than run away.
    const a = list[list.length - 2];
    const b = list[list.length - 1];
    const ahead = Math.min(target - b.at, MAX_EXTRAPOLATION_MS);
    return toPose(blend(a.pose, b.pose, 1 + ahead / Math.max(1, b.at - a.at)));
  }
}
