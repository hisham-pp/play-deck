import { paletteAt } from './biomes';
import { populateFeature, pruneCollectibles, updatePickups } from './collectibles';
import { spawnDust, updateParticles, updatePopups } from './particles';
import { detectCrash, drainFuel, runScore, updateAirState } from './run-rules';
import {
  CAMERA_FOLLOW,
  clamp,
  lerp,
  MAX_STEPS_PER_FRAME,
  MIN_ZOOM,
  PHYSICS_DT,
  TERRAIN_AHEAD,
  TERRAIN_BEHIND,
  toWorld,
} from './summit-constants';
import type {
  ControlInput,
  RunResult,
  SummitProgress,
  UpgradeLevels,
  Vec2,
  World,
  WorldEvent,
} from './summit-types';
import { createTerrain, generateFeature } from './terrain-generator';
import { groundHeightAt } from './terrain-query';
import { buildVehicleSpec } from './upgrades';
import { createVehicle, stepVehicle } from './vehicle-physics';

const START_X = 0;
const PRUNE_BATCH = 64;
const EXHAUST_OFFSET = { x: -1.6, y: 0.62 };
const EXHAUST_COLOR = '#b8bcc6';

export function createWorld(seed: number, upgrades: UpgradeLevels): World {
  const terrain = createTerrain(seed);
  const spec = buildVehicleSpec(upgrades);
  const vehicle = createVehicle(spec, START_X, groundHeightAt(terrain, START_X));
  const world: World = {
    time: 0,
    status: 'running',
    crashReason: null,
    crashTimer: 0,
    vehicle,
    terrain,
    collectibles: [],
    nextCollectibleId: 1,
    particles: [],
    popups: [],
    camera: { x: vehicle.pos.x + 3, y: vehicle.pos.y, zoom: 1, shake: 0 },
    fuel: spec.fuelCapacity,
    startX: START_X,
    stats: { distance: 0, coins: 0, stuntScore: 0, flips: 0, bestAirTime: 0, longestJump: 0 },
    air: { airborne: false, airTime: 0, groundTime: 0, rotation: 0, takeoffX: START_X },
    flipTimer: 0,
    stallTimer: 0,
    lowFuelWarned: false,
    events: [],
    input: { gas: false, brake: false },
    accumulator: 0,
    lastFeature: null,
    lastSpeed: 0,
  };
  ensureTerrain(world, vehicle.pos.x);
  return world;
}

function ensureTerrain(world: World, aheadOfX: number): void {
  const { terrain } = world;
  while (terrain.cursor.x < aheadOfX + TERRAIN_AHEAD) {
    const feature = generateFeature(terrain, world.lastFeature);
    world.lastFeature = feature.kind;
    populateFeature(world, feature);
  }

  const minX = world.camera.x - TERRAIN_BEHIND;
  const pts = terrain.points;
  let cut = 0;
  while (cut < pts.length - 2 && pts[cut + 1].x < minX) cut++;
  if (cut >= PRUNE_BATCH) {
    pts.splice(0, cut);
    terrain.gaps = terrain.gaps.filter((g) => g.endX >= minX);
    pruneCollectibles(world, minX);
  }
}

function physicsStep(world: World, dt: number): void {
  const running = world.status === 'running';
  const input: ControlInput = running ? world.input : { gas: false, brake: false };
  const contact = stepVehicle(
    world.vehicle,
    world.terrain,
    { gas: input.gas, brake: input.brake, hasFuel: world.fuel > 0 },
    dt,
  );
  updateAirState(world, contact, dt);
  if (!running) return;

  drainFuel(world, dt);
  updatePickups(world);
  detectCrash(world, contact, dt);
  world.stats.distance = Math.max(world.stats.distance, world.vehicle.pos.x - world.startX);
}

function emitDust(world: World): void {
  const { vehicle } = world;
  if (world.status === 'running' && world.input.gas && world.fuel > 0) {
    const pipe = toWorld(vehicle.pos, vehicle.angle, EXHAUST_OFFSET);
    spawnDust(world, pipe, 1, 0.35, EXHAUST_COLOR);
  }
  const color = paletteAt(world.stats.distance).dust;
  for (const w of world.vehicle.wheels) {
    if (!w.grounded) continue;
    const speed = Math.abs(w.spin * w.radius);
    const intensity = clamp(Math.abs(w.slip) / 5 + speed / 30, 0, 1);
    if (speed > 1.5) spawnDust(world, w.contactPoint, Math.sign(w.spin), intensity, color);
  }
}

function updateCamera(world: World, dt: number, focus: Vec2 | null): void {
  const { camera, vehicle } = world;
  const speed = focus ? 10 : Math.hypot(vehicle.vel.x, vehicle.vel.y);
  const targetZoom = lerp(1, MIN_ZOOM, clamp((speed - 6) / 16, 0, 1));
  camera.zoom += (targetZoom - camera.zoom) * Math.min(1, dt * 1.2);
  const target = focus ?? vehicle.pos;
  const lookAhead = focus ? 3 : clamp(vehicle.vel.x * 0.3, -3, 6);
  const rise = focus ? 0 : clamp(vehicle.vel.y * 0.08, -2, 2);
  const follow = Math.min(1, dt * CAMERA_FOLLOW);
  camera.x += (target.x + lookAhead - camera.x) * follow;
  camera.y += (target.y + rise - camera.y) * Math.min(1, dt * 3.5);
  camera.shake *= Math.exp(-dt * 5);
  if (camera.shake < 0.01) camera.shake = 0;
}

/**
 * Advances the world by a frame. Physics runs at a fixed step; everything
 * visual runs once per frame. `focus` points the camera elsewhere (spectating
 * a rival). Returns events emitted during the frame.
 */
export function advanceWorld(
  world: World,
  input: ControlInput,
  frameDt: number,
  focus: Vec2 | null = null,
): WorldEvent[] {
  world.events = [];
  world.input = input;
  const dt = Math.min(frameDt, 0.1);
  // A finished run stays parked (its terrain may be pruned while spectating).
  if (world.status !== 'ended') world.accumulator += dt;
  let steps = 0;
  while (world.accumulator >= PHYSICS_DT && steps < MAX_STEPS_PER_FRAME) {
    physicsStep(world, PHYSICS_DT);
    world.accumulator -= PHYSICS_DT;
    steps++;
  }
  if (steps === MAX_STEPS_PER_FRAME) world.accumulator = 0;

  world.time += dt;
  world.lastSpeed = world.vehicle.vel.x;
  if (world.status === 'crashing') {
    world.crashTimer -= dt;
    if (world.crashTimer <= 0) world.status = 'ended';
  }
  emitDust(world);
  updateParticles(world, dt);
  updatePopups(world, dt);
  updateCamera(world, dt, focus);
  ensureTerrain(world, Math.max(world.vehicle.pos.x, focus?.x ?? -Infinity));
  return world.events;
}

/** Distance (m) from the vehicle to the next uncollected fuel can ahead. */
export function nextFuelDistance(world: World): number | null {
  const x = world.vehicle.pos.x;
  let best: number | null = null;
  for (const c of world.collectibles) {
    if (c.kind !== 'fuel' || c.collected || c.pos.x < x) continue;
    if (best === null || c.pos.x - x < best) best = c.pos.x - x;
  }
  return best;
}

export function buildRunResult(world: World, progress: SummitProgress): RunResult {
  const distance = Math.floor(world.stats.distance);
  return {
    distance,
    coins: world.stats.coins,
    score: runScore(world),
    flips: world.stats.flips,
    bestAirTime: world.stats.bestAirTime,
    longestJump: world.stats.longestJump,
    reason: world.crashReason ?? 'fuel',
    isNewBest: distance > progress.bestDistance,
  };
}

/** Folds a finished run into persistent progress (pure). */
export function applyRunToProgress(progress: SummitProgress, result: RunResult): SummitProgress {
  return {
    ...progress,
    coins: progress.coins + result.coins,
    bestDistance: Math.max(progress.bestDistance, result.distance),
    bestScore: Math.max(progress.bestScore, result.score),
    totalRuns: progress.totalRuns + 1,
    totalDistance: progress.totalDistance + result.distance,
  };
}

export { runScore };
