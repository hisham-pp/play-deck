import type {
  ShadowTagRunner,
  ShadowTagSeat,
  ShadowTagStanding,
  ShadowTagWorld,
} from '../types/shadow-tag.types';
import { SURVIVAL_POINTS_PER_SEC } from './shadow-tag-constants';

/**
 * Points accrue for every second you are not "it". The mark itself earns
 * nothing, so the fastest way back into contention is to pass it on.
 */
export function awardSurvival(world: ShadowTagWorld, dtSec: number): void {
  for (const runner of world.players) {
    if (!runner.connected) continue;

    if (runner.id === world.itId) {
      runner.itMs += dtSec * 1000;
      runner.evasionMs = 0;
      continue;
    }

    runner.score += SURVIVAL_POINTS_PER_SEC * dtSec;
    runner.evasionMs += dtSec * 1000;
    runner.bestEvasionMs = Math.max(runner.bestEvasionMs, runner.evasionMs);
  }
}

/** Highest score wins; fewer times tagged breaks a tie, then seat order. */
export function standings(seats: ShadowTagSeat[], players: ShadowTagRunner[]): ShadowTagStanding[] {
  const rows = seats
    .map((seat) => ({ seat, runner: players.find((p) => p.id === seat.id) }))
    .filter((row): row is { seat: ShadowTagSeat; runner: ShadowTagRunner } => Boolean(row.runner));

  rows.sort((a, b) => {
    if (Math.round(b.runner.score) !== Math.round(a.runner.score)) {
      return Math.round(b.runner.score) - Math.round(a.runner.score);
    }
    if (a.runner.timesTagged !== b.runner.timesTagged) {
      return a.runner.timesTagged - b.runner.timesTagged;
    }
    return a.seat.seatIndex - b.seat.seatIndex;
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function winnerOf(seats: ShadowTagSeat[], players: ShadowTagRunner[]): ShadowTagSeat | null {
  return standings(seats, players)[0]?.seat ?? null;
}

/** Whole seconds left on the round clock, never negative. */
export function secondsRemaining(world: ShadowTagWorld): number {
  const playedMs = Math.max(0, world.elapsedMs - world.countdownMs);
  return Math.max(0, Math.ceil((world.roundMs - playedMs) / 1000));
}

/** Whole seconds left on the pre-round countdown, or 0 once play has begun. */
export function countdownRemaining(world: ShadowTagWorld): number {
  return Math.max(0, Math.ceil((world.countdownMs - world.elapsedMs) / 1000));
}
