import type {
  ShadowCast,
  ShadowTagInput,
  ShadowTagRunner,
  ShadowTagWorld,
  Vec2,
} from '../types/shadow-tag.types';
import { distance, normalize, segmentBlocked, sub } from './geometry';
import { nearestLight } from './lights';
import { exposureAt } from './shadow-casting';
import { BOT_DECISION_MS, BOT_WANDER_MS, PHASE_PLAYING } from './shadow-tag-constants';

export interface BotMemory {
  nextDecisionMs: number;
  nextWanderMs: number;
  wanderTarget: Vec2;
  heading: Vec2;
  sneak: boolean;
  usedLightAtMs: number;
}

const IDLE: ShadowTagInput = { moveX: 0, moveY: 0, sneak: false, block: false, redirect: false };
const PANIC_RANGE = 280;
const PROBE_DISTANCE = 130;
const PROBE_DIRECTIONS = 12;
const LIGHT_USE_COOLDOWN_MS = 9000;

export function createBotMemory(): BotMemory {
  return {
    nextDecisionMs: 0,
    nextWanderMs: 0,
    wanderTarget: { x: 0, y: 0 },
    heading: { x: 0, y: 0 },
    sneak: false,
    usedLightAtMs: -LIGHT_USE_COOLDOWN_MS,
  };
}

/**
 * Bots see exactly what a player sees: a rival only registers while they are
 * throwing a readable shadow. Nobody gets x-ray vision for being code.
 */
function perceivedPosition(casts: ShadowCast[], playerId: string): Vec2 | null {
  let best: ShadowCast | null = null;
  for (const cast of casts) {
    if (cast.playerId !== playerId) continue;
    if (!best || cast.opacity > best.opacity) best = cast;
  }
  return best ? { ...best.from } : null;
}

/** Walks a ring of probes and keeps the darkest one the bot can actually reach. */
function darkestDirection(world: ShadowTagWorld, from: Vec2, avoid: Vec2 | null): Vec2 {
  let bestHeading: Vec2 = { x: 0, y: 0 };
  let bestScore = Number.POSITIVE_INFINITY;

  for (let i = 0; i < PROBE_DIRECTIONS; i++) {
    const angle = (i / PROBE_DIRECTIONS) * Math.PI * 2;
    const probe = {
      x: from.x + Math.cos(angle) * PROBE_DISTANCE,
      y: from.y + Math.sin(angle) * PROBE_DISTANCE,
    };
    if (probe.x < 40 || probe.y < 40 || probe.x > world.arena.width - 40) continue;
    if (probe.y > world.arena.height - 40) continue;
    if (segmentBlocked(from, probe, world.arena.obstacles)) continue;

    let score = exposureAt(probe, world.lights, world.arena.obstacles);
    if (avoid) score += Math.max(0, 1 - distance(probe, avoid) / PANIC_RANGE) * 1.6;
    if (score < bestScore) {
      bestScore = score;
      bestHeading = { x: Math.cos(angle), y: Math.sin(angle) };
    }
  }

  return bestHeading;
}

function chaseHeading(world: ShadowTagWorld, bot: ShadowTagRunner, casts: ShadowCast[]): Vec2 {
  let target: Vec2 | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const rival of world.players) {
    if (rival.id === bot.id || !rival.connected) continue;
    const seen = perceivedPosition(casts, rival.id);
    if (!seen) continue;
    const dist = distance(seen, bot.pos);
    if (dist < bestDist) {
      bestDist = dist;
      target = seen;
    }
  }

  // Nothing visible: sweep toward the freshest footprint, else keep hunting the light.
  if (!target) {
    const trail = world.footsteps[world.footsteps.length - 1];
    target = trail ? trail.pos : (world.lights[0]?.pos ?? null);
  }

  return target ? normalize(sub(target, bot.pos)) : { x: 0, y: 0 };
}

function fleeHeading(world: ShadowTagWorld, bot: ShadowTagRunner, casts: ShadowCast[]): Vec2 {
  const hunter = perceivedPosition(casts, world.itId);
  const threatened = hunter !== null && distance(hunter, bot.pos) < PANIC_RANGE;
  return darkestDirection(world, bot.pos, threatened ? hunter : null);
}

/**
 * One bot's intent for this frame. Decisions are re-taken on a slow cadence and
 * held in between, which keeps bots from twitching every time a lamp drifts.
 */
export function botInput(
  world: ShadowTagWorld,
  casts: ShadowCast[],
  bot: ShadowTagRunner,
  memory: BotMemory,
): ShadowTagInput {
  if (world.phase !== PHASE_PLAYING || !bot.connected) return IDLE;

  const isIt = world.itId === bot.id;

  if (world.elapsedMs >= memory.nextDecisionMs) {
    memory.nextDecisionMs = world.elapsedMs + BOT_DECISION_MS;
    memory.heading = isIt ? chaseHeading(world, bot, casts) : fleeHeading(world, bot, casts);
    // A hunter charges; a runner in the open would rather not be heard.
    memory.sneak = !isIt && exposureAt(bot.pos, world.lights, world.arena.obstacles) < 0.2;
  }

  if (world.elapsedMs >= memory.nextWanderMs && memory.heading.x === 0 && memory.heading.y === 0) {
    memory.nextWanderMs = world.elapsedMs + BOT_WANDER_MS;
    const angle = Math.random() * Math.PI * 2;
    memory.heading = { x: Math.cos(angle), y: Math.sin(angle) };
  }

  // A cornered runner standing under a lamp will cover it rather than be seen.
  const lamp = nearestLight(bot.pos, world.lights);
  const wantsBlock =
    !isIt &&
    lamp !== null &&
    lamp.intensity > 0.6 &&
    world.elapsedMs - memory.usedLightAtMs > LIGHT_USE_COOLDOWN_MS;

  if (wantsBlock) memory.usedLightAtMs = world.elapsedMs;

  return {
    moveX: memory.heading.x,
    moveY: memory.heading.y,
    sneak: memory.sneak,
    block: wantsBlock,
    redirect: false,
  };
}
