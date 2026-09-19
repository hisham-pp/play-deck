import {
  MOOD_ASLEEP,
  NOISE_MAX,
  PHASE_COUNTDOWN,
  PHASE_ESCAPED,
  PHASE_WOKEN,
} from '../engine/giant-constants';
import type { GiantEngine } from '../engine/giant-engine';
import { quietFactorAt } from '../engine/noise';
import { countdownRemaining, secondsRemaining, standings } from '../engine/scoring';
import { promptFor, treasuresLeft } from '../engine/treasure';
import type { GiantHud, GiantMood, GiantSeat } from '../types/giant.types';

export const EMPTY_HUD: GiantHud = {
  phase: PHASE_COUNTDOWN,
  mood: MOOD_ASLEEP,
  countdown: 0,
  secondsLeft: 0,
  noisePercent: 0,
  bankedTotal: 0,
  treasuresLeft: 0,
  carried: 0,
  carriedCount: 0,
  standings: [],
  gait: 'walk',
  quiet: false,
  muffled: false,
  prompt: '',
  announcement: '',
};

/**
 * Flattens the live world into the handful of values the interface renders.
 * Called on a slow cadence rather than every frame, so React is never asked to
 * keep up with the simulation.
 */
export function projectHud(
  engine: GiantEngine,
  seats: GiantSeat[],
  localPlayerId: string | null,
  announcement: string,
): GiantHud {
  const world = engine.getWorld();
  const local = localPlayerId ? engine.thief(localPlayerId) : undefined;

  return {
    phase: world.phase,
    mood: world.mood,
    countdown: countdownRemaining(world),
    secondsLeft: secondsRemaining(world),
    noisePercent: Math.round((world.noise / NOISE_MAX) * 100),
    bankedTotal: world.bankedTotal,
    treasuresLeft: treasuresLeft(world),
    carried: local?.carried ?? 0,
    carriedCount: local?.carriedCount ?? 0,
    standings: standings(seats, world.thieves),
    gait: local?.gait ?? 'walk',
    quiet: local ? quietFactorAt(local.pos, world.map.quietZones) < 1 : false,
    muffled: Boolean(local && local.muffledUntilMs > world.elapsedMs),
    prompt: promptFor(world, local),
    announcement,
  };
}

const MOOD_LINE: Record<GiantMood, string> = {
  asleep: 'The giant has settled. The room is quiet again.',
  stirring: 'The giant is stirring. His arms are shifting — the routes have changed.',
  restless: 'The giant is restless. His arms are sweeping the floor. Keep clear.',
  awake: 'The giant is awake. Everyone is caught.',
};

/** The line read out to assistive tech when the giant changes mood. */
export function moodAnnouncement(mood: GiantMood): string {
  return MOOD_LINE[mood];
}

export function phaseAnnouncement(phase: string, bankedTotal: number): string {
  if (phase === 'escape')
    return 'The door is open. Carry your haul out before the clock runs down.';
  if (phase === PHASE_ESCAPED) return `Clean getaway with ${bankedTotal} in loot.`;
  if (phase === PHASE_WOKEN) return 'The giant woke. The whole crew loses.';
  return '';
}
