import type {
  Charm,
  CharmKind,
  GiantBody,
  Limb,
  MapDefinition,
  Obstacle,
  QuietZone,
  Treasure,
  TreasureTier,
  Vec2,
} from '../types/giant.types';
import { MAP_HEIGHT, MAP_WIDTH, TREASURE_NOISE, TREASURE_VALUE } from './giant-constants';

/** Named so the blueprint tables below stay readable at a glance. */
const TRINKET: TreasureTier = 'trinket';
const GOBLET: TreasureTier = 'goblet';
const RELIC: TreasureTier = 'relic';
const LULLABY: CharmKind = 'lullaby';
const MUFFLE: CharmKind = 'muffle';

/** `[x, y, tier]` — the terse form the blueprints below are authored in. */
type TreasureSpot = [number, number, TreasureTier];
type CharmSpot = [number, number, CharmKind];
type LimbSeed = {
  id: string;
  pivot: Vec2;
  length: number;
  radius: number;
  angle: number;
  /** Half-width of the arc this arm sweeps once the giant turns restless. */
  swing: number;
};

interface MapBlueprint {
  id: string;
  name: string;
  obstacles: Obstacle[];
  quietZones: QuietZone[];
  spawns: Vec2[];
  exit: Obstacle;
  head: { pos: Vec2; radius: number };
  torso: Obstacle;
  limbs: LimbSeed[];
  treasureSpots: TreasureSpot[];
  charmSpots: CharmSpot[];
}

const HEARTH: MapBlueprint = {
  id: 'hearth',
  name: 'Hearth Hall',
  obstacles: [
    { x: 150, y: 96, w: 122, h: 26 },
    { x: 150, y: 478, w: 122, h: 26 },
    { x: 690, y: 96, w: 26, h: 132 },
    { x: 690, y: 372, w: 26, h: 132 },
    { x: 330, y: 44, w: 26, h: 96 },
    { x: 330, y: 460, w: 26, h: 96 },
    { x: 828, y: 258, w: 92, h: 84 },
  ],
  quietZones: [
    { pos: { x: 232, y: 300 }, radius: 82 },
    { pos: { x: 640, y: 128 }, radius: 68 },
    { pos: { x: 640, y: 472 }, radius: 68 },
    { pos: { x: 860, y: 96 }, radius: 62 },
  ],
  spawns: [
    { x: 96, y: 300 },
    { x: 110, y: 224 },
    { x: 110, y: 376 },
    { x: 152, y: 176 },
    { x: 152, y: 424 },
    { x: 172, y: 300 },
  ],
  exit: { x: 20, y: 250, w: 46, h: 100 },
  head: { pos: { x: 512, y: 158 }, radius: 62 },
  torso: { x: 432, y: 214, w: 162, h: 216 },
  limbs: [
    { id: 'arm-l', pivot: { x: 436, y: 244 }, length: 148, radius: 21, angle: 2.85, swing: 0.62 },
    { id: 'arm-r', pivot: { x: 590, y: 244 }, length: 148, radius: 21, angle: 0.34, swing: 0.62 },
  ],
  treasureSpots: [
    [268, 152, TRINKET],
    [268, 448, TRINKET],
    [420, 92, GOBLET],
    [420, 508, GOBLET],
    [604, 92, TRINKET],
    [604, 508, TRINKET],
    [772, 172, GOBLET],
    [772, 428, GOBLET],
    [886, 196, TRINKET],
    [512, 476, RELIC],
    [372, 372, RELIC],
    [664, 228, RELIC],
  ],
  charmSpots: [
    [196, 56, LULLABY],
    [196, 544, MUFFLE],
    [886, 500, LULLABY],
  ],
};

const VAULT: MapBlueprint = {
  id: 'vault',
  name: 'Cloud Vault',
  obstacles: [
    { x: 96, y: 168, w: 188, h: 26 },
    { x: 96, y: 406, w: 188, h: 26 },
    { x: 356, y: 40, w: 26, h: 128 },
    { x: 356, y: 432, w: 26, h: 128 },
    { x: 560, y: 268, w: 148, h: 26 },
    { x: 118, y: 268, w: 26, h: 64 },
    { x: 760, y: 88, w: 96, h: 84 },
    { x: 760, y: 428, w: 96, h: 84 },
  ],
  quietZones: [
    { pos: { x: 190, y: 300 }, radius: 74 },
    { pos: { x: 470, y: 104 }, radius: 70 },
    { pos: { x: 470, y: 496 }, radius: 70 },
    { pos: { x: 690, y: 300 }, radius: 66 },
  ],
  spawns: [
    { x: 880, y: 300 },
    { x: 894, y: 228 },
    { x: 894, y: 372 },
    { x: 842, y: 210 },
    { x: 842, y: 390 },
    { x: 812, y: 300 },
  ],
  exit: { x: 894, y: 250, w: 46, h: 100 },
  head: { pos: { x: 368, y: 300 }, radius: 66 },
  torso: { x: 424, y: 214, w: 176, h: 176 },
  limbs: [
    { id: 'arm-l', pivot: { x: 470, y: 216 }, length: 152, radius: 22, angle: -1.24, swing: 0.72 },
    { id: 'arm-r', pivot: { x: 470, y: 388 }, length: 152, radius: 22, angle: 1.24, swing: 0.72 },
  ],
  treasureSpots: [
    [96, 96, TRINKET],
    [96, 504, TRINKET],
    [232, 96, GOBLET],
    [232, 504, GOBLET],
    [188, 300, RELIC],
    [420, 40, TRINKET],
    [420, 560, TRINKET],
    [620, 92, GOBLET],
    [620, 508, GOBLET],
    [648, 326, RELIC],
    [326, 190, RELIC],
    [326, 410, GOBLET],
  ],
  charmSpots: [
    [560, 40, MUFFLE],
    [560, 560, LULLABY],
    [96, 300, LULLABY],
  ],
};

const BLUEPRINTS: Record<string, MapBlueprint> = { hearth: HEARTH, vault: VAULT };

export const MAP_IDS = Object.keys(BLUEPRINTS);

export function mapName(mapId: string): string {
  return BLUEPRINTS[mapId]?.name ?? HEARTH.name;
}

function toLimb(seed: LimbSeed): Limb {
  return {
    id: seed.id,
    pivot: { ...seed.pivot },
    length: seed.length,
    radius: seed.radius,
    angle: seed.angle,
    targetAngle: seed.angle,
    sweepFrom: seed.angle - seed.swing,
    sweepTo: seed.angle + seed.swing,
    dir: 1,
  };
}

function toTreasure([x, y, tier]: TreasureSpot, index: number): Treasure {
  return {
    id: `loot-${index}`,
    pos: { x, y },
    tier,
    value: TREASURE_VALUE[tier],
    noise: TREASURE_NOISE[tier],
    takenBy: null,
  };
}

function toCharm([x, y, kind]: CharmSpot, index: number): Charm {
  return { id: `charm-${index}`, pos: { x, y }, kind, usedBy: null };
}

function toBody(blueprint: MapBlueprint): GiantBody {
  return {
    head: { pos: { ...blueprint.head.pos }, radius: blueprint.head.radius },
    torso: { ...blueprint.torso },
    limbs: blueprint.limbs.map(toLimb),
    breathMs: 0,
  };
}

/** Maps are mutated in place during a heist, so every round gets its own copy. */
export function createMap(mapId: string = 'hearth'): MapDefinition {
  const blueprint = BLUEPRINTS[mapId] ?? HEARTH;
  return {
    id: blueprint.id,
    name: blueprint.name,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    obstacles: blueprint.obstacles.map((box) => ({ ...box })),
    quietZones: blueprint.quietZones.map((zone) => ({ pos: { ...zone.pos }, radius: zone.radius })),
    spawns: blueprint.spawns.map((point) => ({ ...point })),
    exit: { ...blueprint.exit },
    giant: toBody(blueprint),
    treasures: blueprint.treasureSpots.map(toTreasure),
    charms: blueprint.charmSpots.map(toCharm),
  };
}

/** Total value on the floor at the start of a heist — the denominator for "how well did we do". */
export function mapTreasureValue(mapId: string): number {
  const blueprint = BLUEPRINTS[mapId] ?? HEARTH;
  return blueprint.treasureSpots.reduce((sum, [, , tier]) => sum + TREASURE_VALUE[tier], 0);
}
