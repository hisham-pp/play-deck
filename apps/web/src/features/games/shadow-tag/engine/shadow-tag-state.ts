import type { ShadowTagRunner, ShadowTagSeat, ShadowTagWorld } from '../types/shadow-tag.types';
import { createArena } from './arena-layout';
import {
  COUNTDOWN_MS,
  PHASE_COUNTDOWN,
  ROUND_MS,
  SEAT_COLORS,
  TAG_GRACE_MS,
} from './shadow-tag-constants';

export interface RoundSetup {
  seats: ShadowTagSeat[];
  arenaId: string;
  roundMs: number;
  /** Seat that starts the round holding the mark. */
  itId: string;
}

export function seatColor(seatIndex: number): string {
  return SEAT_COLORS[seatIndex % SEAT_COLORS.length];
}

function spawnRunner(
  seat: ShadowTagSeat,
  spawn: { x: number; y: number },
  isIt: boolean,
): ShadowTagRunner {
  return {
    id: seat.id,
    pos: { ...spawn },
    vel: { x: 0, y: 0 },
    facing: 0,
    sneaking: false,
    strideMs: 0,
    // Nobody can be tagged before the countdown clears.
    immuneUntilMs: COUNTDOWN_MS + (isIt ? TAG_GRACE_MS : 0),
    interactReadyAtMs: 0,
    score: 0,
    tags: 0,
    timesTagged: 0,
    itMs: 0,
    evasionMs: 0,
    bestEvasionMs: 0,
    connected: true,
  };
}

/** Picks the opening "it" at random, so the host is not perpetually the chaser. */
export function chooseStartingIt(seats: ShadowTagSeat[]): string {
  if (seats.length === 0) return '';
  return seats[Math.floor(Math.random() * seats.length)].id;
}

export function createRoundSetup(seats: ShadowTagSeat[], arenaId: string): RoundSetup {
  return { seats, arenaId, roundMs: ROUND_MS, itId: chooseStartingIt(seats) };
}

export function createWorld(setup: RoundSetup): ShadowTagWorld {
  const arena = createArena(setup.arenaId);

  return {
    phase: PHASE_COUNTDOWN,
    arena,
    elapsedMs: 0,
    roundMs: setup.roundMs,
    countdownMs: COUNTDOWN_MS,
    itId: setup.itId,
    players: setup.seats.map((seat, index) =>
      spawnRunner(seat, arena.spawns[index % arena.spawns.length], seat.id === setup.itId),
    ),
    lights: arena.lights,
    props: arena.props,
    footsteps: [],
    lastTag: null,
    nextFootstepId: 1,
  };
}

export function runnerById(world: ShadowTagWorld, id: string): ShadowTagRunner | undefined {
  return world.players.find((runner) => runner.id === id);
}
