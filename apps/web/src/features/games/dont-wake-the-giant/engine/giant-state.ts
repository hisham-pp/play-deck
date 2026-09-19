import type { GiantSeat, GiantWorld, Thief, Vec2 } from '../types/giant.types';
import {
  COUNTDOWN_MS,
  ESCAPE_MS,
  HEIST_MS,
  MOOD_ASLEEP,
  PHASE_COUNTDOWN,
  SEAT_COLORS,
} from './giant-constants';
import { createMap } from './map-layout';

export interface RoundSetup {
  seats: GiantSeat[];
  mapId: string;
  heistMs: number;
}

export function seatColor(seatIndex: number): string {
  return SEAT_COLORS[seatIndex % SEAT_COLORS.length];
}

function spawnThief(seat: GiantSeat, spawn: Vec2): Thief {
  return {
    id: seat.id,
    pos: { ...spawn },
    vel: { x: 0, y: 0 },
    facing: 0,
    gait: 'walk',
    strideMs: 0,
    carried: 0,
    carriedCount: 0,
    banked: 0,
    noiseMade: 0,
    muffledUntilMs: 0,
    bumpReadyAtMs: 0,
    struckReadyAtMs: 0,
    collectReadyAtMs: 0,
    escaped: false,
    connected: true,
  };
}

export function createRoundSetup(seats: GiantSeat[], mapId: string): RoundSetup {
  return { seats, mapId, heistMs: HEIST_MS };
}

export function createWorld(setup: RoundSetup): GiantWorld {
  const map = createMap(setup.mapId);

  return {
    phase: PHASE_COUNTDOWN,
    mood: MOOD_ASLEEP,
    map,
    elapsedMs: 0,
    countdownMs: COUNTDOWN_MS,
    heistMs: setup.heistMs,
    escapeMs: ESCAPE_MS,
    escapeStartedMs: 0,
    noise: 0,
    peakNoise: 0,
    thieves: setup.seats.map((seat, index) =>
      spawnThief(seat, map.spawns[index % map.spawns.length]),
    ),
    treasures: map.treasures,
    charms: map.charms,
    giant: map.giant,
    ripples: [],
    nextRippleId: 1,
    lastEvent: null,
    bankedTotal: 0,
  };
}

export function thiefById(world: GiantWorld, id: string): Thief | undefined {
  return world.thieves.find((thief) => thief.id === id);
}
