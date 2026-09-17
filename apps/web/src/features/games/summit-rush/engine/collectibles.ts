import { addPopup, spawnBurst } from './particles';
import {
  COIN_VALUE,
  FUEL_SPACING_END,
  FUEL_SPACING_START,
  GEM_VALUE,
  GRAVITY,
  HEAD_OFFSET,
  lerp,
  PICKUP_RADIUS,
  toWorld,
} from './summit-constants';
import type { CollectibleKind, Vec2, World } from './summit-types';
import { difficultyAt, nextRandom, type TerrainFeature } from './terrain-generator';
import { groundHeightAt } from './terrain-query';

const COIN_HOVER = 1.05;
const COIN_SPACING = 1.3;
const GUESS_LAUNCH_SPEED = 12.5;
const GEM_UNLOCK_X = 400;

function add(world: World, kind: CollectibleKind, pos: Vec2): void {
  const value = kind === 'coin' ? COIN_VALUE : kind === 'gem' ? GEM_VALUE : 0;
  world.collectibles.push({ id: world.nextCollectibleId++, kind, pos, value, collected: false });
}

function groundPoint(world: World, x: number, hover: number): Vec2 {
  return { x, y: groundHeightAt(world.terrain, x) + hover };
}

/** Points along the likely flight path off a lip, stopping at the ground. */
function jumpArc(world: World, feature: TerrainFeature, count: number, stride: number): Vec2[] {
  const lip = feature.lip;
  if (!lip) return [];
  const angle = feature.lipAngle ?? 0.5;
  const vx = GUESS_LAUNCH_SPEED * Math.cos(angle);
  const vy = GUESS_LAUNCH_SPEED * Math.sin(angle);
  const arc: Vec2[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i * stride;
    const p = { x: lip.x + vx * t, y: lip.y + 0.9 + vy * t - 0.5 * GRAVITY * t * t };
    if (p.y < groundHeightAt(world.terrain, p.x) + COIN_HOVER) break;
    arc.push(p);
  }
  return arc;
}

function placeCoins(world: World, feature: TerrainFeature): void {
  const terrain = world.terrain;
  if (feature.lip && nextRandom(terrain) < 0.8) {
    for (const p of jumpArc(world, feature, 12, 0.09)) add(world, 'coin', p);
    return;
  }
  if (nextRandom(terrain) > 0.75) return;
  const span = feature.endX - feature.startX;
  const count = 4 + Math.floor(nextRandom(terrain) * 6);
  const start = feature.startX + nextRandom(terrain) * Math.max(0, span - count * COIN_SPACING);
  for (let i = 0; i < count; i++) {
    add(world, 'coin', groundPoint(world, start + i * COIN_SPACING, COIN_HOVER));
  }
}

function placeGem(world: World, feature: TerrainFeature): void {
  const terrain = world.terrain;
  if (feature.startX < GEM_UNLOCK_X || nextRandom(terrain) > 0.14) return;
  const arc = jumpArc(world, feature, 12, 0.1);
  if (arc.length > 3) {
    const apex = arc.reduce((hi, p) => (p.y > hi.y ? p : hi), arc[0]);
    add(world, 'gem', { x: apex.x, y: apex.y + 0.8 });
    return;
  }
  const x = lerp(feature.startX, feature.endX, 0.5);
  add(world, 'gem', groundPoint(world, x, 2.6 + nextRandom(terrain) * 1.2));
}

/** Highest ground point inside the feature — rewards cresting a climb. */
function crestX(world: World, feature: TerrainFeature): number {
  let bestX = feature.startX;
  let bestY = -Infinity;
  for (let x = feature.startX; x <= feature.endX; x += 1) {
    const y = groundHeightAt(world.terrain, x);
    if (y > bestY) {
      bestY = y;
      bestX = x;
    }
  }
  return bestX;
}

function fuelPosition(world: World, feature: TerrainFeature): Vec2 {
  const terrain = world.terrain;
  if (feature.lip && nextRandom(terrain) < 0.45) {
    const arc = jumpArc(world, feature, 10, 0.1);
    if (arc.length > 4) return arc[Math.floor(arc.length * 0.55)];
  }
  if (feature.landingX !== undefined) return groundPoint(world, feature.landingX + 6, COIN_HOVER);
  if (feature.kind === 'steep') return groundPoint(world, crestX(world, feature), COIN_HOVER);
  const x = Math.min(Math.max(terrain.nextFuelX, feature.startX + 1), feature.endX - 1);
  return groundPoint(world, x, COIN_HOVER);
}

function placeFuel(world: World, feature: TerrainFeature): void {
  const terrain = world.terrain;
  if (terrain.nextFuelX > feature.endX) return;
  add(world, 'fuel', fuelPosition(world, feature));
  const spacing = lerp(FUEL_SPACING_START, FUEL_SPACING_END, difficultyAt(feature.endX));
  terrain.nextFuelX = feature.endX + spacing * (0.85 + nextRandom(terrain) * 0.3);
}

export function populateFeature(world: World, feature: TerrainFeature): void {
  placeCoins(world, feature);
  placeGem(world, feature);
  placeFuel(world, feature);
}

const COLOR: Record<CollectibleKind, string> = {
  coin: '#fcd34d',
  gem: '#a78bfa',
  fuel: '#f87171',
};

/** Collects anything touching the chassis, helmet or wheels. */
export function updatePickups(world: World): void {
  const v = world.vehicle;
  const probes = [v.pos, toWorld(v.pos, v.angle, HEAD_OFFSET), v.wheels[0].pos, v.wheels[1].pos];
  const r2 = PICKUP_RADIUS * PICKUP_RADIUS;
  for (const item of world.collectibles) {
    if (item.collected || Math.abs(item.pos.x - v.pos.x) > 4) continue;
    const reach = item.kind === 'fuel' ? r2 * 1.5 : r2;
    const hit = probes.some((p) => (p.x - item.pos.x) ** 2 + (p.y - item.pos.y) ** 2 < reach);
    if (!hit) continue;
    item.collected = true;
    spawnBurst(world, item.pos, COLOR[item.kind], item.kind === 'coin' ? 8 : 16, 3.5);
    if (item.kind === 'fuel') {
      world.fuel = v.spec.fuelCapacity;
      world.lowFuelWarned = false;
      world.events.push({ type: 'fuel' });
      addPopup(world, 'FUEL REFILLED', '#4ade80');
    } else {
      world.stats.coins += item.value;
      world.events.push({ type: 'coin', value: item.value });
      if (item.kind === 'gem') addPopup(world, `GEM +${item.value}`, COLOR.gem);
    }
  }
}

export function pruneCollectibles(world: World, minX: number): void {
  if (world.collectibles.length === 0 || world.collectibles[0].pos.x >= minX) return;
  world.collectibles = world.collectibles.filter((c) => c.pos.x >= minX);
}
