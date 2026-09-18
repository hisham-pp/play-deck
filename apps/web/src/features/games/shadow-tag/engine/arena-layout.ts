import type { ArenaDefinition, LightSource, Obstacle, Prop, Vec2 } from '../types/shadow-tag.types';
import { ARENA_HEIGHT, ARENA_WIDTH } from './shadow-tag-constants';

interface LampSeed {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  speed: number;
  phase: number;
  reach: number;
  hue: number;
}

function lamp(seed: LampSeed): LightSource {
  return {
    id: seed.id,
    orbit: { cx: seed.cx, cy: seed.cy, rx: seed.rx, ry: seed.ry },
    angle: seed.phase,
    speed: seed.speed,
    pos: {
      x: seed.cx + Math.cos(seed.phase) * seed.rx,
      y: seed.cy + Math.sin(seed.phase) * seed.ry,
    },
    intensity: 1,
    blockedUntilMs: 0,
    reach: seed.reach,
    hue: seed.hue,
  };
}

function props(points: Vec2[]): Prop[] {
  return points.map((pos, index) => ({
    id: `prop-${index}`,
    pos,
    radius: 11,
    disturbedUntilMs: 0,
    seed: (index * 97) % 360,
  }));
}

const ATRIUM_OBSTACLES: Obstacle[] = [
  { x: 420, y: 252, w: 120, h: 96 },
  { x: 172, y: 122, w: 76, h: 76 },
  { x: 712, y: 122, w: 76, h: 76 },
  { x: 172, y: 402, w: 76, h: 76 },
  { x: 712, y: 402, w: 76, h: 76 },
  { x: 312, y: 44, w: 26, h: 150 },
  { x: 622, y: 406, w: 26, h: 150 },
];

const ATRIUM_LAMPS: LampSeed[] = [
  { id: 'lamp-a', cx: 300, cy: 182, rx: 154, ry: 92, speed: 0.3, phase: 0, reach: 330, hue: 42 },
  {
    id: 'lamp-b',
    cx: 660,
    cy: 418,
    rx: 154,
    ry: 92,
    speed: -0.26,
    phase: 2.1,
    reach: 330,
    hue: 34,
  },
  {
    id: 'lamp-c',
    cx: 480,
    cy: 300,
    rx: 336,
    ry: 208,
    speed: 0.17,
    phase: 3.9,
    reach: 380,
    hue: 196,
  },
  {
    id: 'lamp-d',
    cx: 480,
    cy: 300,
    rx: 118,
    ry: 226,
    speed: -0.22,
    phase: 1.2,
    reach: 300,
    hue: 268,
  },
];

const CELLAR_OBSTACLES: Obstacle[] = [
  { x: 120, y: 240, w: 210, h: 28 },
  { x: 630, y: 332, w: 210, h: 28 },
  { x: 452, y: 96, w: 28, h: 168 },
  { x: 452, y: 336, w: 28, h: 168 },
  { x: 236, y: 452, w: 96, h: 96 },
  { x: 628, y: 52, w: 96, h: 96 },
];

const CELLAR_LAMPS: LampSeed[] = [
  {
    id: 'lamp-a',
    cx: 232,
    cy: 316,
    rx: 178,
    ry: 214,
    speed: 0.22,
    phase: 0.6,
    reach: 350,
    hue: 30,
  },
  {
    id: 'lamp-b',
    cx: 728,
    cy: 284,
    rx: 178,
    ry: 214,
    speed: -0.2,
    phase: 3.4,
    reach: 350,
    hue: 18,
  },
  {
    id: 'lamp-c',
    cx: 480,
    cy: 300,
    rx: 402,
    ry: 60,
    speed: 0.34,
    phase: 1.9,
    reach: 300,
    hue: 168,
  },
];

const ATRIUM_SPAWNS: Vec2[] = [
  { x: 96, y: 300 },
  { x: 864, y: 300 },
  { x: 480, y: 76 },
  { x: 480, y: 524 },
  { x: 132, y: 528 },
  { x: 828, y: 72 },
];

const CELLAR_SPAWNS: Vec2[] = [
  { x: 92, y: 96 },
  { x: 868, y: 504 },
  { x: 92, y: 504 },
  { x: 868, y: 96 },
  { x: 348, y: 300 },
  { x: 612, y: 300 },
];

/** Arena blueprints. `createArena` hands out a fresh mutable copy of one. */
const ARENAS: Record<
  string,
  Omit<ArenaDefinition, 'lights' | 'props'> & {
    lamps: LampSeed[];
    propPoints: Vec2[];
  }
> = {
  atrium: {
    id: 'atrium',
    name: 'Lantern Atrium',
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    obstacles: ATRIUM_OBSTACLES,
    spawns: ATRIUM_SPAWNS,
    lamps: ATRIUM_LAMPS,
    propPoints: [
      { x: 268, y: 300 },
      { x: 692, y: 300 },
      { x: 480, y: 172 },
      { x: 480, y: 428 },
      { x: 360, y: 492 },
      { x: 600, y: 108 },
      { x: 118, y: 232 },
      { x: 842, y: 368 },
    ],
  },
  cellar: {
    id: 'cellar',
    name: 'Flooded Cellar',
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    obstacles: CELLAR_OBSTACLES,
    spawns: CELLAR_SPAWNS,
    lamps: CELLAR_LAMPS,
    propPoints: [
      { x: 180, y: 380 },
      { x: 780, y: 200 },
      { x: 392, y: 232 },
      { x: 560, y: 380 },
      { x: 300, y: 128 },
      { x: 668, y: 470 },
      { x: 480, y: 552 },
    ],
  },
};

export const ARENA_IDS = Object.keys(ARENAS);

export function arenaName(arenaId: string): string {
  return ARENAS[arenaId]?.name ?? ARENAS.atrium.name;
}

/** Arenas are mutated in place during a round, so every match gets its own copy. */
export function createArena(arenaId: string = 'atrium'): ArenaDefinition {
  const blueprint = ARENAS[arenaId] ?? ARENAS.atrium;
  return {
    id: blueprint.id,
    name: blueprint.name,
    width: blueprint.width,
    height: blueprint.height,
    obstacles: blueprint.obstacles.map((box) => ({ ...box })),
    spawns: blueprint.spawns.map((point) => ({ ...point })),
    lights: blueprint.lamps.map(lamp),
    props: props(blueprint.propPoints),
  };
}
