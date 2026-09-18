import { interactCooldownSec } from '../engine/lights';
import { countdownRemaining, secondsRemaining, standings } from '../engine/scoring';
import { exposureAt } from '../engine/shadow-casting';
import { PHASE_COUNTDOWN } from '../engine/shadow-tag-constants';
import type { ShadowTagEngine } from '../engine/shadow-tag-engine';
import type { ShadowTagHud, ShadowTagSeat } from '../types/shadow-tag.types';

export const EMPTY_HUD: ShadowTagHud = {
  phase: PHASE_COUNTDOWN,
  countdown: 0,
  secondsLeft: 0,
  itId: '',
  itName: '',
  isLocalIt: false,
  standings: [],
  exposure: 0,
  lightCooldown: 0,
  sneaking: false,
  immune: false,
  announcement: '',
};

/**
 * Flattens the live world into the handful of values the interface renders.
 * Called on a slow cadence rather than every frame, so React is never asked to
 * keep up with the simulation.
 */
export function projectHud(
  engine: ShadowTagEngine,
  seats: ShadowTagSeat[],
  localPlayerId: string | null,
  announcement: string,
): ShadowTagHud {
  const world = engine.getWorld();
  const local = localPlayerId ? engine.localRunner(localPlayerId) : undefined;
  const itSeat = seats.find((seat) => seat.id === world.itId);

  return {
    phase: world.phase,
    countdown: countdownRemaining(world),
    secondsLeft: secondsRemaining(world),
    itId: world.itId,
    itName: itSeat?.displayName ?? 'Nobody',
    isLocalIt: Boolean(local && world.itId === local.id),
    standings: standings(seats, world.players),
    exposure: local ? exposureAt(local.pos, world.lights, world.arena.obstacles) : 0,
    lightCooldown: local ? interactCooldownSec(local, world.elapsedMs) : 0,
    sneaking: Boolean(local?.sneaking),
    immune: Boolean(local && local.immuneUntilMs > world.elapsedMs),
    announcement,
  };
}

/** The line read out to assistive tech when the mark changes hands. */
export function tagAnnouncement(
  seats: ShadowTagSeat[],
  taggerId: string,
  victimId: string,
  localPlayerId: string | null,
): string {
  const name = (id: string) => seats.find((seat) => seat.id === id)?.displayName ?? 'A player';
  if (victimId === localPlayerId) return `${name(taggerId)} tagged your shadow. You are it.`;
  if (taggerId === localPlayerId) return `You tagged ${name(victimId)}. You are free.`;
  return `${name(taggerId)} tagged ${name(victimId)}. ${name(victimId)} is it.`;
}
