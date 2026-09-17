import {
  clamp,
  DIFFICULTY_RAMP_DISTANCE,
  PIT_DEPTH,
  START_FLAT_LENGTH,
  TERRAIN_STEP,
} from './summit-constants';
import type { Terrain, TerrainFeatureKind, Vec2 } from './summit-types';

/** Describes a generated stretch so collectibles can be placed to match it. */
export interface TerrainFeature {
  kind: TerrainFeatureKind;
  startX: number;
  endX: number;
  /** Take-off lip for jumps and gaps. */
  lip?: Vec2;
  lipAngle?: number;
  /** Landing x for jumps and gaps. */
  landingX?: number;
}

type Shape = 'cosine' | 'easeOut' | 'quadratic';

interface Span {
  len: number;
  dy: number;
  shape?: Shape;
}

const GAP_UNLOCK_X = 280;
/** The opening stretch stays gentle so new players learn the controls. */
const WARMUP_X = 120;

/** Mulberry32 step; state lives on the terrain so generation is resumable. */
export function nextRandom(terrain: Terrain): number {
  terrain.rngState = (terrain.rngState + 0x6d2b79f5) | 0;
  let t = terrain.rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function range(terrain: Terrain, min: number, max: number): number {
  return min + (max - min) * nextRandom(terrain);
}

export function difficultyAt(x: number): number {
  return clamp(x / DIFFICULTY_RAMP_DISTANCE, 0, 1);
}

export function createTerrain(seed: number): Terrain {
  const terrain: Terrain = {
    points: [],
    seed,
    rngState: seed | 0,
    cursor: { x: -40, y: 0 },
    nextFuelX: 70,
    gaps: [],
  };
  terrain.points.push({ ...terrain.cursor });
  appendSpans(terrain, [{ len: 40 + START_FLAT_LENGTH, dy: 0 }], 0);
  return terrain;
}

function shapeAt(shape: Shape, u: number): number {
  if (shape === 'easeOut') return Math.sin((u * Math.PI) / 2);
  if (shape === 'quadratic') return u * u;
  return (1 - Math.cos(u * Math.PI)) / 2;
}

/** Appends smooth spans at TERRAIN_STEP resolution with optional roughness. */
function appendSpans(terrain: Terrain, spans: Span[], rough: number): void {
  const phaseA = range(terrain, 0, 6.28);
  const phaseB = range(terrain, 0, 6.28);
  for (const span of spans) {
    const x0 = terrain.cursor.x;
    const y0 = terrain.cursor.y;
    const steps = Math.max(1, Math.round(span.len / TERRAIN_STEP));
    for (let s = 1; s <= steps; s++) {
      const u = s / steps;
      const x = x0 + span.len * u;
      const envelope = Math.sin(u * Math.PI);
      const noise = (Math.sin(x * 1.7 + phaseA) * 0.6 + Math.sin(x * 3.1 + phaseB) * 0.4) * rough;
      terrain.points.push({
        x,
        y: y0 + span.dy * shapeAt(span.shape ?? 'cosine', u) + noise * envelope,
      });
    }
    terrain.cursor = { x: x0 + span.len, y: y0 + span.dy };
  }
}

/** Vertical step (used for lip drops and pit walls). */
function appendStep(terrain: Terrain, dy: number, dx = 0.02): void {
  terrain.cursor = { x: terrain.cursor.x + dx, y: terrain.cursor.y + dy };
  terrain.points.push({ ...terrain.cursor });
}

/** Keeps cosine slopes climbable: max slope = π/2 · dy/len. */
function limitRise(dy: number, len: number, d: number): number {
  const maxRatio = 0.3 + 0.15 * d;
  return clamp(dy, -len * (maxRatio + 0.1), len * maxRatio);
}

function pickKind(
  terrain: Terrain,
  d: number,
  previous: TerrainFeatureKind | null,
): TerrainFeatureKind {
  const x = terrain.cursor.x;
  const warm = x < WARMUP_X ? 0 : 1;
  const weights: [TerrainFeatureKind, number][] = [
    ['flat', 1.2 - d],
    ['hills', 3],
    ['steep', (0.5 + 2 * d) * warm],
    ['valley', 1 + d],
    ['downhill', 1],
    ['bumps', 1 + d],
    ['jump', (0.9 + 0.8 * d) * warm],
    ['gap', x > GAP_UNLOCK_X ? 0.35 + 1.3 * d : 0],
  ];
  const usable = weights.filter(
    ([kind]) => !(kind === previous && (kind === 'gap' || kind === 'jump')),
  );
  const total = usable.reduce((sum, [, w]) => sum + w, 0);
  let roll = nextRandom(terrain) * total;
  for (const [kind, w] of usable) {
    roll -= w;
    if (roll <= 0) return kind;
  }
  return 'hills';
}

function hillSpans(terrain: Terrain, d: number): Span[] {
  const count = Math.round(range(terrain, 2, 4));
  const spans: Span[] = [];
  // Bias towards climbing so jumps and downhills don't sink the course forever.
  let sign = nextRandom(terrain) < (terrain.cursor.y < 0 ? 0.75 : 0.4) ? 1 : -1;
  for (let i = 0; i < count; i++) {
    const len = range(terrain, 7, 14);
    spans.push({ len, dy: limitRise(sign * range(terrain, 1.2, 2.5 + 4 * d), len, d) });
    sign = -sign;
  }
  return spans;
}

function steepSpans(terrain: Terrain, d: number): Span[] {
  const upLen = range(terrain, 10, 16);
  const up = limitRise(upLen * range(terrain, 0.35, 0.45 + 0.1 * d), upLen, d);
  const downLen = range(terrain, 10, 18);
  return [
    { len: upLen, dy: up },
    { len: range(terrain, 2, 5), dy: range(terrain, -0.3, 0.3) },
    { len: downLen, dy: limitRise(-up * range(terrain, 0.6, 1.1), downLen, d) },
  ];
}

function valleySpans(terrain: Terrain, d: number): Span[] {
  const depth = range(terrain, 3, 6 + 5 * d);
  const downLen = range(terrain, 10, 16);
  const upLen = range(terrain, 11, 17);
  return [
    { len: downLen, dy: limitRise(-depth, downLen, d) },
    { len: range(terrain, 3, 6), dy: 0 },
    { len: upLen, dy: limitRise(depth * range(terrain, 0.7, 1), upLen, d) },
  ];
}

function bumpSpans(terrain: Terrain, d: number): Span[] {
  const count = Math.round(range(terrain, 5, 9));
  return Array.from({ length: count }, (_, i) => {
    const len = range(terrain, 1.6, 2.6);
    return {
      len,
      dy: (i % 2 === 0 ? 1 : -1) * Math.min(len * 0.3, range(terrain, 0.2, 0.45 + 0.3 * d)),
    };
  });
}

function appendJump(terrain: Terrain, d: number, withGap: boolean): TerrainFeature {
  const startX = terrain.cursor.x;
  appendSpans(terrain, [{ len: range(terrain, 12, 16), dy: -range(terrain, 1.5, 3) }], 0.03);
  const rampLen = range(terrain, 5.5, 7.5);
  // A quadratic ramp ends at slope 2H/L; cap it near 40° so a slow approach can still crest it.
  const rampH = Math.min(range(terrain, 1.6, withGap ? 2.3 : 2.4 + 0.8 * d), rampLen * 0.42);
  appendSpans(terrain, [{ len: rampLen, dy: rampH, shape: 'quadratic' }], 0);
  const lip = { ...terrain.cursor };

  let landingX = lip.x + 4;
  if (withGap) {
    const width = range(terrain, 3, 4.2) + 3.2 * d;
    const farRim = lip.y - range(terrain, 0.8, 2);
    appendStep(terrain, -PIT_DEPTH);
    appendSpans(terrain, [{ len: width, dy: 0 }], 0);
    appendStep(terrain, farRim - terrain.cursor.y);
    terrain.gaps.push({ startX: lip.x, endX: terrain.cursor.x, rimY: Math.min(lip.y, farRim) });
    landingX = terrain.cursor.x + 2;
  } else {
    appendStep(terrain, -range(terrain, 1.2, 2.6 + d));
  }
  appendSpans(
    terrain,
    [{ len: range(terrain, 14, 20), dy: -range(terrain, 3, 5.5), shape: 'easeOut' }],
    0.04,
  );
  appendSpans(terrain, [{ len: range(terrain, 5, 9), dy: 0 }], 0.05);
  return {
    kind: withGap ? 'gap' : 'jump',
    startX,
    endX: terrain.cursor.x,
    lip,
    lipAngle: Math.atan2(2 * rampH, rampLen),
    landingX,
  };
}

/** Generates one terrain feature at the cursor and returns its description. */
export function generateFeature(
  terrain: Terrain,
  previous: TerrainFeatureKind | null,
): TerrainFeature {
  const d = difficultyAt(terrain.cursor.x);
  const kind = pickKind(terrain, d, previous);
  const startX = terrain.cursor.x;
  if (kind === 'jump' || kind === 'gap') return appendJump(terrain, d, kind === 'gap');

  const rough = 0.04 + 0.06 * d;
  switch (kind) {
    case 'flat':
      appendSpans(terrain, [{ len: range(terrain, 10, 18), dy: range(terrain, -0.6, 0.6) }], rough);
      break;
    case 'hills':
      appendSpans(terrain, hillSpans(terrain, d), rough);
      break;
    case 'steep':
      appendSpans(terrain, steepSpans(terrain, d), rough * 0.6);
      break;
    case 'valley':
      appendSpans(terrain, valleySpans(terrain, d), rough);
      break;
    case 'downhill': {
      const len = range(terrain, 14, 22);
      appendSpans(terrain, [{ len, dy: limitRise(-range(terrain, 4, 8 + 4 * d), len, d) }], rough);
      break;
    }
    default:
      appendSpans(terrain, bumpSpans(terrain, d), 0);
  }
  return { kind, startX, endX: terrain.cursor.x };
}
