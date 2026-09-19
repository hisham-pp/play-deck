import type { GiantInput, GiantWorld, Obstacle, Thief, Vec2 } from '../types/giant.types';
import { closestOnBox, closestOnSegment, distance, normalize, sub } from './geometry';
import { limbSegment } from './giant-ai';
import {
  BOT_DECISION_MS,
  INTERACT_RANGE,
  MOOD_RESTLESS,
  MOOD_RESTLESS_AT,
  MOOD_STIR_AT,
  PHASE_ESCAPE,
  PHASE_HEIST,
  THIEF_RADIUS,
} from './giant-constants';

export interface BotMemory {
  nextDecisionMs: number;
  heading: Vec2;
  targetId: string | null;
  target: Vec2 | null;
  tiptoe: boolean;
  run: boolean;
  /** Where this bot was when it last re-planned, to notice it is stuck. */
  lastPos: Vec2 | null;
  /** Elapsed-ms stamp until which the bot is sliding round something. */
  detourUntilMs: number;
  /** Which way it chose to slide: +1 or -1. */
  detourTurn: number;
  /** True while the bot is sitting out, waiting for the meter to come down. */
  holding: boolean;
}

const IDLE: GiantInput = { moveX: 0, moveY: 0, run: false, tiptoe: false, interact: false };
const EMPTY_CLAIMS: ReadonlySet<string> = new Set();
/** How far out a sweeping arm starts pushing a bot's path aside. */
const LIMB_CLEARANCE = 62;
/** How far out a wall or pillar starts pushing a bot's path aside. */
const WALL_CLEARANCE = 46;
/** How close a team-mate has to be before a bot gives them room. */
const CROWD_CLEARANCE = 72;
/** A bot heads for the door once it is carrying this much on its own. */
const POCKETS_FULL = 3;
/** Meter level at which a bot stops looting and waits for the room to settle. */
const HOLD_AT = MOOD_STIR_AT + 5;
/** And the level it has to fall back to before the bot moves again. */
const RESUME_AT = MOOD_STIR_AT * 0.7;
/** How far a bot will break off its route to fetch a charm when the room is loud. */
const CHARM_DETOUR_RANGE = 260;
/** Progress below this between two decisions means the bot is grinding on something. */
const STUCK_DISTANCE = 12;
const DETOUR_MS = 900;

export function createBotMemory(): BotMemory {
  return {
    nextDecisionMs: 0,
    heading: { x: 0, y: 0 },
    targetId: null,
    target: null,
    tiptoe: false,
    run: false,
    lastPos: null,
    detourUntilMs: 0,
    detourTurn: 1,
    holding: false,
  };
}

/** The softest ground within reach, which is where a nervous bot waits it out. */
function quietestSpot(world: GiantWorld, bot: Thief): Vec2 {
  let best: Vec2 | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const zone of world.map.quietZones) {
    const dist = distance(zone.pos, bot.pos);
    if (dist < bestDist) {
      bestDist = dist;
      best = zone.pos;
    }
  }
  return best ?? bot.pos;
}

function exitCentre(world: GiantWorld): Vec2 {
  const { exit } = world.map;
  return { x: exit.x + exit.w / 2, y: exit.y + exit.h / 2 };
}

/** The unclaimed charm worth breaking off for, once the room has got away from the crew. */
function rescueCharm(world: GiantWorld, bot: Thief, claimed: ReadonlySet<string>) {
  if (world.noise < MOOD_RESTLESS_AT) return undefined;
  return world.charms.find(
    (candidate) =>
      candidate.usedBy === null &&
      !claimed.has(candidate.id) &&
      distance(candidate.pos, bot.pos) < CHARM_DETOUR_RANGE,
  );
}

/** The best piece of loot still going, or nothing if the crew has cleared the floor. */
function bestLoot(world: GiantWorld, bot: Thief, memory: BotMemory, claimed: ReadonlySet<string>) {
  // Distance always matters; the noise a lift costs only matters once the meter
  // is already high enough for it to be the thing that wakes him.
  const noiseWeight = world.noise >= MOOD_STIR_AT ? 26 : 4;
  let best: { id: string; pos: Vec2; score: number } | null = null;

  for (const treasure of world.treasures) {
    if (treasure.takenBy !== null) continue;
    // Somebody else is already walking to this one. Two bots converging on one
    // goblet means a collision, and a collision is louder than either pickup.
    if (treasure.id !== memory.targetId && claimed.has(treasure.id)) continue;

    const score = distance(treasure.pos, bot.pos) + treasure.noise * noiseWeight;
    if (!best || score < best.score) best = { id: treasure.id, pos: treasure.pos, score };
  }

  return best;
}

/**
 * Nerve, with hysteresis: once the room is loud enough to worry about, the bot
 * waits until it has properly settled rather than dithering on the threshold.
 */
function updateNerve(world: GiantWorld, memory: BotMemory): void {
  if (world.noise >= HOLD_AT) memory.holding = true;
  else if (world.noise <= RESUME_AT) memory.holding = false;
}

/**
 * Picks what this bot wants next. A quiet room is worth looting greedily; a
 * loud one is worth waiting out, so the crew's nerve rises and falls with the
 * meter the same way a human crew's would.
 */
function chooseTarget(
  world: GiantWorld,
  bot: Thief,
  memory: BotMemory,
  claimed: ReadonlySet<string>,
): void {
  if (world.phase === PHASE_ESCAPE || bot.carriedCount >= POCKETS_FULL) {
    memory.holding = false;
    memory.targetId = null;
    memory.target = exitCentre(world);
    return;
  }

  updateNerve(world, memory);

  const charm = rescueCharm(world, bot, claimed);
  if (charm) {
    memory.targetId = charm.id;
    memory.target = charm.pos;
    return;
  }

  if (memory.holding) {
    memory.targetId = null;
    memory.target = quietestSpot(world, bot);
    return;
  }

  const best = bestLoot(world, bot, memory, claimed);
  memory.targetId = best?.id ?? null;
  memory.target = best ? best.pos : exitCentre(world);
}

/** Blends one outright repulsion into a heading, weighted by how close it is. */
function pushAway(heading: Vec2, from: Vec2, to: Vec2, gap: number, clearance: number): Vec2 {
  const away = normalize(sub(to, from));
  const urgency = 1 - gap / clearance;
  return normalize({
    x: heading.x + away.x * urgency * 2.2,
    y: heading.y + away.y * urgency * 2.2,
  });
}

/**
 * Deflects a heading *along* an obstacle rather than straight off it. Pushing
 * directly away cancels against the pull towards the target and leaves a bot
 * grinding on the corner — which, in this game, is a bump every 600ms and a
 * woken giant inside half a minute. Sliding picks whichever way round matches
 * where the bot was already going, and only acts when it is heading into the
 * thing at all.
 */
function slideAround(heading: Vec2, from: Vec2, to: Vec2, gap: number, clearance: number): Vec2 {
  const out = normalize(sub(to, from));
  const into = -(heading.x * out.x + heading.y * out.y);
  if (into <= 0) return heading;

  const left = { x: -out.y, y: out.x };
  const right = { x: out.y, y: -out.x };
  const tangent =
    heading.x * left.x + heading.y * left.y >= heading.x * right.x + heading.y * right.y
      ? left
      : right;

  const urgency = (1 - gap / clearance) * into;
  return normalize({
    x: heading.x + (tangent.x * 1.8 + out.x * 0.7) * urgency,
    y: heading.y + (tangent.y * 1.8 + out.y * 0.7) * urgency,
  });
}

/** Steers away from any arm the bot is about to walk into. */
function avoidLimbs(world: GiantWorld, bot: Thief, heading: Vec2): Vec2 {
  if (world.mood !== MOOD_RESTLESS) return heading;

  let steered = heading;
  for (const limb of world.giant.limbs) {
    const { a, b } = limbSegment(limb);
    const near = closestOnSegment(a, b, bot.pos);
    const gap = distance(near, bot.pos);
    if (gap <= LIMB_CLEARANCE) steered = pushAway(steered, near, bot.pos, gap, LIMB_CLEARANCE);
  }
  return steered;
}

/**
 * Steers away from pillars, the giant's body and the room's own edges. Bumping
 * into something is one of the loudest things in the game, so a bot that walks
 * straight at a wall is a bot that loses the round for everybody.
 */
function avoidWalls(world: GiantWorld, bot: Thief, heading: Vec2): Vec2 {
  const solids: Obstacle[] = [...world.map.obstacles, world.map.giant.torso];
  let steered = heading;

  for (const box of solids) {
    const near = closestOnBox(box, bot.pos);
    const gap = distance(near, bot.pos);
    if (gap <= WALL_CLEARANCE) steered = slideAround(steered, near, bot.pos, gap, WALL_CLEARANCE);
  }

  const { head } = world.map.giant;
  const headGap = distance(head.pos, bot.pos) - head.radius;
  if (headGap <= WALL_CLEARANCE) {
    steered = slideAround(steered, head.pos, bot.pos, Math.max(0, headGap), WALL_CLEARANCE);
  }

  const edge = THIEF_RADIUS + WALL_CLEARANCE;
  if (bot.pos.x < edge) steered = normalize({ x: steered.x + 1, y: steered.y });
  if (bot.pos.x > world.map.width - edge) steered = normalize({ x: steered.x - 1, y: steered.y });
  if (bot.pos.y < edge) steered = normalize({ x: steered.x, y: steered.y + 1 });
  if (bot.pos.y > world.map.height - edge) steered = normalize({ x: steered.x, y: steered.y - 1 });

  return steered;
}

/** Gives team-mates room, because two thieves in one doorway is a loud mistake. */
function avoidCrowd(world: GiantWorld, bot: Thief, heading: Vec2): Vec2 {
  let steered = heading;
  for (const other of world.thieves) {
    if (other.id === bot.id || !other.connected || other.escaped) continue;
    const gap = distance(other.pos, bot.pos);
    if (gap <= CROWD_CLEARANCE) {
      steered = slideAround(steered, other.pos, bot.pos, gap, CROWD_CLEARANCE);
    }
  }
  return steered;
}

/**
 * Notices a bot that has stopped making progress — wedged on a corner the
 * repulsion alone cannot solve — and commits it to sliding sideways for a
 * moment rather than grinding.
 */
function checkStuck(world: GiantWorld, bot: Thief, memory: BotMemory): void {
  const moved = memory.lastPos ? distance(memory.lastPos, bot.pos) : Number.POSITIVE_INFINITY;
  memory.lastPos = { ...bot.pos };
  if (moved >= STUCK_DISTANCE || world.elapsedMs < memory.detourUntilMs) return;

  memory.detourUntilMs = world.elapsedMs + DETOUR_MS;
  memory.detourTurn = -memory.detourTurn;
}

function gaitFlags(world: GiantWorld, bot: Thief, memory: BotMemory): void {
  if (world.phase === PHASE_ESCAPE) {
    // The dash for the door, paced by how much meter is left to spend on it.
    // A crew that sprints out of a nearly-full room wakes him on the doorstep.
    memory.run = world.noise < MOOD_STIR_AT;
    memory.tiptoe = world.noise >= HOLD_AT;
    return;
  }

  // Tiptoe well before the giant actually stirs, and whenever loaded down.
  memory.tiptoe =
    memory.holding || world.noise >= MOOD_STIR_AT * 0.5 || bot.carriedCount >= POCKETS_FULL;
  // Running is never worth it during the heist itself.
  memory.run = false;
}

/** What the rest of the crew is already walking towards, so nobody doubles up. */
export function claimsOf(memories: Iterable<BotMemory>): ReadonlySet<string> {
  const claimed = new Set<string>();
  for (const memory of memories) {
    if (memory.targetId) claimed.add(memory.targetId);
  }
  return claimed;
}

/**
 * One bot's intent for this frame. Decisions are re-taken on a slow cadence and
 * held in between, so bots commit to a route instead of twitching between two
 * equally good pieces of treasure.
 */
export function botInput(
  world: GiantWorld,
  bot: Thief,
  memory: BotMemory,
  claimed: ReadonlySet<string> = EMPTY_CLAIMS,
): GiantInput {
  if (!bot.connected || bot.escaped) return IDLE;
  if (world.phase !== PHASE_HEIST && world.phase !== PHASE_ESCAPE) return IDLE;

  if (world.elapsedMs >= memory.nextDecisionMs) {
    memory.nextDecisionMs = world.elapsedMs + BOT_DECISION_MS;
    checkStuck(world, bot, memory);
    chooseTarget(world, bot, memory, claimed);
    gaitFlags(world, bot, memory);
  }

  const target = memory.target;
  if (!target) return IDLE;

  let heading = normalize(sub(target, bot.pos));
  if (world.elapsedMs < memory.detourUntilMs) {
    // Slide along whatever is in the way instead of pressing into it.
    heading = { x: -heading.y * memory.detourTurn, y: heading.x * memory.detourTurn };
  }
  heading = avoidCrowd(world, bot, avoidWalls(world, bot, avoidLimbs(world, bot, heading)));
  memory.heading = heading;

  const arrived = memory.targetId !== null && distance(target, bot.pos) <= INTERACT_RANGE * 0.7;

  return {
    moveX: heading.x,
    moveY: heading.y,
    run: memory.run,
    tiptoe: memory.tiptoe,
    interact: arrived,
  };
}
