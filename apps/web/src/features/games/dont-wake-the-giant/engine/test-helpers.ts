import type { GiantSeat, GiantWorld } from '../types/giant.types';
import { HEIST_MS, PHASE_HEIST, SEAT_COLORS } from './giant-constants';
import { createWorld } from './giant-state';

/** Shared fixtures for the engine suites. Not imported by application code. */
export function makeSeats(count: number): GiantSeat[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    displayName: `Thief ${index + 1}`,
    avatar: '🕯️',
    type: 'human' as const,
    seatIndex: index,
    color: SEAT_COLORS[index % SEAT_COLORS.length],
  }));
}

export function makeWorld(count = 3, mapId = 'hearth'): GiantWorld {
  return createWorld({ seats: makeSeats(count), mapId, heistMs: HEIST_MS });
}

/** A world already past the countdown, which is where most rules apply. */
export function makeHeistWorld(count = 3, mapId = 'hearth'): GiantWorld {
  const world = makeWorld(count, mapId);
  world.phase = PHASE_HEIST;
  world.elapsedMs = world.countdownMs;
  return world;
}
