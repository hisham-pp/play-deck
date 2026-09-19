import type { GiantSeat, GiantStanding, GiantWorld, Thief } from '../types/giant.types';
import { PHASE_COUNTDOWN, PHASE_ESCAPE, PHASE_ESCAPED, PHASE_WOKEN } from './giant-constants';

/** What a thief is worth right now: banked loot plus whatever is still in their arms. */
export function haulOf(thief: Thief): number {
  return thief.banked + thief.carried;
}

/**
 * Ranks the crew by haul, then by who kept quietest doing it. This is a co-op
 * game, so the table is bragging rights rather than a winner — the whole crew
 * shares the one outcome.
 */
export function standings(seats: GiantSeat[], thieves: Thief[]): GiantStanding[] {
  const rows = seats
    .map((seat) => ({ seat, thief: thieves.find((candidate) => candidate.id === seat.id) }))
    .filter((row): row is { seat: GiantSeat; thief: Thief } => Boolean(row.thief));

  rows.sort((a, b) => {
    if (haulOf(b.thief) !== haulOf(a.thief)) return haulOf(b.thief) - haulOf(a.thief);
    if (Math.round(a.thief.noiseMade) !== Math.round(b.thief.noiseMade)) {
      return a.thief.noiseMade - b.thief.noiseMade;
    }
    return a.seat.seatIndex - b.seat.seatIndex;
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

/** The one thief who put the most into the meter — named gently on the results screen. */
export function loudestOf(seats: GiantSeat[], thieves: Thief[]): GiantSeat | null {
  const rows = standings(seats, thieves);
  if (rows.length === 0) return null;
  return rows.reduce((worst, row) => (row.thief.noiseMade > worst.thief.noiseMade ? row : worst))
    .seat;
}

/** Whole seconds left on the pre-round countdown, or 0 once the heist has begun. */
export function countdownRemaining(world: GiantWorld): number {
  return Math.max(0, Math.ceil((world.countdownMs - world.elapsedMs) / 1000));
}

/** Whole seconds left on whichever clock is currently running. */
export function secondsRemaining(world: GiantWorld): number {
  if (world.phase === PHASE_ESCAPE) {
    const spent = world.elapsedMs - world.escapeStartedMs;
    return Math.max(0, Math.ceil((world.escapeMs - spent) / 1000));
  }
  if (world.phase === PHASE_COUNTDOWN || world.phase === PHASE_WOKEN) {
    return Math.max(0, Math.ceil(world.heistMs / 1000));
  }
  const played = Math.max(0, world.elapsedMs - world.countdownMs);
  return Math.max(0, Math.ceil((world.heistMs - played) / 1000));
}

export function isOver(world: GiantWorld): boolean {
  return world.phase === PHASE_ESCAPED || world.phase === PHASE_WOKEN;
}

/** True only when the crew got out with the giant still asleep. */
export function crewSucceeded(world: GiantWorld): boolean {
  return world.phase === PHASE_ESCAPED && world.bankedTotal > 0;
}
