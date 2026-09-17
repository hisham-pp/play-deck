import type { CrashReason, World } from '../engine/summit-types';

/** Wire message types on the shared room channel. */
export const RACE_MSG = {
  START: 'SR_START',
  STATE: 'SR_STATE',
  FINISH: 'SR_FINISH',
  READY: 'SR_READY',
} as const;

export const SNAPSHOT_INTERVAL_MS = 100;
/** Ghosts are drawn slightly in the past so there are two samples to blend. */
export const GHOST_RENDER_DELAY_MS = 140;
const MAX_EXTRAPOLATION_MS = 250;
const MAX_BUFFER = 12;

export interface RaceStartPayload {
  raceId: string;
  seed: number;
}

export type GhostStatus = 'running' | 'crashing' | 'ended';

export interface GhostSnapshot {
  raceId: string;
  /** x, y, angle of the chassis followed by x, y, angle of each wheel. */
  pose: number[];
  distance: number;
  score: number;
  status: GhostStatus;
}

export interface RaceFinishPayload {
  raceId: string;
  distance: number;
  score: number;
  coins: number;
  reason: CrashReason;
}

export interface GhostPose {
  x: number;
  y: number;
  angle: number;
  wheels: { x: number; y: number; angle: number }[];
}

const POSE_LENGTH = 9;
const round2 = (n: number) => Math.round(n * 100) / 100;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export function isRaceStart(v: unknown): v is RaceStartPayload {
  return isRecord(v) && typeof v.raceId === 'string' && isFiniteNumber(v.seed);
}

export function isGhostSnapshot(v: unknown): v is GhostSnapshot {
  return (
    isRecord(v) &&
    typeof v.raceId === 'string' &&
    Array.isArray(v.pose) &&
    v.pose.length === POSE_LENGTH &&
    v.pose.every(isFiniteNumber) &&
    isFiniteNumber(v.distance) &&
    isFiniteNumber(v.score) &&
    (v.status === 'running' || v.status === 'crashing' || v.status === 'ended')
  );
}

export function isRaceFinish(v: unknown): v is RaceFinishPayload {
  return (
    isRecord(v) &&
    typeof v.raceId === 'string' &&
    isFiniteNumber(v.distance) &&
    isFiniteNumber(v.score) &&
    isFiniteNumber(v.coins) &&
    typeof v.reason === 'string'
  );
}

export function encodeSnapshot(world: World, raceId: string, score: number): GhostSnapshot {
  const v = world.vehicle;
  const [rear, front] = v.wheels;
  return {
    raceId,
    pose: [
      v.pos.x,
      v.pos.y,
      v.angle,
      rear.pos.x,
      rear.pos.y,
      rear.angle,
      front.pos.x,
      front.pos.y,
      front.angle,
    ].map(round2),
    distance: Math.floor(world.stats.distance),
    score,
    status: world.status,
  };
}

export function decodePose(pose: number[]): GhostPose {
  return {
    x: pose[0],
    y: pose[1],
    angle: pose[2],
    wheels: [
      { x: pose[3], y: pose[4], angle: pose[5] },
      { x: pose[6], y: pose[7], angle: pose[8] },
    ],
  };
}

function blend(a: number[], b: number[], t: number): number[] {
  return a.map((value, i) => value + (b[i] - value) * t);
}

/** Buffers timestamped snapshots and samples a smooth pose in the past. */
export class GhostTrack {
  private samples: { at: number; pose: number[] }[] = [];

  push(pose: number[], receivedAt: number): void {
    this.samples.push({ at: receivedAt, pose });
    if (this.samples.length > MAX_BUFFER) this.samples.shift();
  }

  clear(): void {
    this.samples = [];
  }

  sample(now: number): GhostPose | null {
    const list = this.samples;
    if (list.length === 0) return null;
    const target = now - GHOST_RENDER_DELAY_MS;
    if (list.length === 1 || target <= list[0].at) return decodePose(list[0].pose);

    for (let i = list.length - 1; i > 0; i--) {
      const a = list[i - 1];
      const b = list[i];
      if (target >= a.at && target <= b.at) {
        return decodePose(blend(a.pose, b.pose, (target - a.at) / Math.max(1, b.at - a.at)));
      }
    }
    // Past the newest sample: extrapolate briefly, then hold.
    const a = list[list.length - 2];
    const b = list[list.length - 1];
    const ahead = Math.min(target - b.at, MAX_EXTRAPOLATION_MS);
    return decodePose(blend(a.pose, b.pose, 1 + ahead / Math.max(1, b.at - a.at)));
  }
}

export type RaceOutcome = 'win' | 'lose' | 'draw';

export interface RaceTally {
  distance: number;
  score: number;
}

/** Furthest distance wins; score breaks ties. */
export function decideRaceOutcome(me: RaceTally, rival: RaceTally): RaceOutcome {
  if (me.distance !== rival.distance) return me.distance > rival.distance ? 'win' : 'lose';
  if (me.score !== rival.score) return me.score > rival.score ? 'win' : 'lose';
  return 'draw';
}

export function createRaceId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function createRaceSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
