import type { Gait, GiantMood, GiantPhase, GiantSeat, Vec2 } from '../types/giant.types';

/** Wire message types on the shared room channel. */
export const GN_MSG = {
  SEATS: 'GN_SEATS',
  START: 'GN_START',
  POSE: 'GN_POSE',
  TAKE: 'GN_TAKE',
  SNAPSHOT: 'GN_SNAPSHOT',
  SYNC_REQUEST: 'GN_SYNC_REQUEST',
  REMATCH: 'GN_REMATCH',
} as const;

/** Own position goes out at roughly 14Hz; the authoritative snapshot much slower. */
export const POSE_INTERVAL_MS = 70;
export const SNAPSHOT_INTERVAL_MS = 400;
/** Remote bodies are drawn slightly in the past so there are two samples to blend. */
export const POSE_RENDER_DELAY_MS = 120;
export const MAX_EXTRAPOLATION_MS = 220;
const MAX_BUFFER = 14;

export interface RoundStartPayload {
  roundId: string;
  seats: GiantSeat[];
  mapId: string;
  heistMs: number;
}

export interface PosePayload {
  roundId: string;
  /** x, y, facing. */
  pose: [number, number, number];
  gait: Gait;
  carriedCount: number;
}

export interface TakePayload {
  roundId: string;
  thiefId: string;
  kind: 'treasure' | 'charm';
  id: string;
}

export interface HaulPatch {
  id: string;
  banked: number;
  carried: number;
  carriedCount: number;
  noiseMade: number;
  escaped: boolean;
}

export interface LimbPatch {
  id: string;
  angle: number;
  dir: number;
}

export interface SnapshotPayload {
  roundId: string;
  elapsedMs: number;
  phase: GiantPhase;
  mood: GiantMood;
  noise: number;
  escapeStartedMs: number;
  bankedTotal: number;
  /** `[treasureId, thiefId]` for everything lifted so far. */
  taken: [string, string][];
  /** `[charmId, thiefId]` for every charm spent so far. */
  charms: [string, string][];
  hauls: HaulPatch[];
  limbs: LimbPatch[];
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';

export function isRoundStart(v: unknown): v is RoundStartPayload {
  return (
    isRecord(v) && isStr(v.roundId) && Array.isArray(v.seats) && isStr(v.mapId) && isNum(v.heistMs)
  );
}

export function isPose(v: unknown): v is PosePayload {
  return (
    isRecord(v) &&
    isStr(v.roundId) &&
    Array.isArray(v.pose) &&
    v.pose.length === 3 &&
    v.pose.every(isNum) &&
    isStr(v.gait)
  );
}

export function isTake(v: unknown): v is TakePayload {
  return (
    isRecord(v) &&
    isStr(v.roundId) &&
    isStr(v.thiefId) &&
    isStr(v.id) &&
    (v.kind === 'treasure' || v.kind === 'charm')
  );
}

export function isSnapshot(v: unknown): v is SnapshotPayload {
  return (
    isRecord(v) &&
    isStr(v.roundId) &&
    isNum(v.elapsedMs) &&
    isNum(v.noise) &&
    isStr(v.phase) &&
    Array.isArray(v.taken) &&
    Array.isArray(v.charms) &&
    Array.isArray(v.hauls) &&
    Array.isArray(v.limbs)
  );
}

export function createRoundId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function encodePose(
  roundId: string,
  pos: Vec2,
  facing: number,
  gait: Gait,
  carriedCount: number,
): PosePayload {
  return {
    roundId,
    pose: [round1(pos.x), round1(pos.y), round1(facing)],
    gait,
    carriedCount,
  };
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
