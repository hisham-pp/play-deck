import type { PushYourLuckSeat, PushYourLuckState } from '../types/push-your-luck.types';
import { BUST_CHANCE_MAX, PHASE_GAME_OVER, SEAT_BOT, SEAT_HUMAN } from './push-your-luck-constants';

export function activeSeatOf(state: PushYourLuckState): PushYourLuckSeat {
  return state.seats[state.activeSeat];
}

/** The opponent a steal card should target: whoever has the most to lose. */
export function richestOpponent(
  seats: PushYourLuckSeat[],
  activeIndex: number,
): PushYourLuckSeat | null {
  const targets = seats.filter((seat, index) => index !== activeIndex && seat.banked > 0);
  if (targets.length === 0) return null;
  return targets.reduce((best, seat) => (seat.banked > best.banked ? seat : best));
}

export function canStealFrom(seats: PushYourLuckSeat[], activeIndex: number): boolean {
  return richestOpponent(seats, activeIndex) !== null;
}

export function leaderSeat(seats: PushYourLuckSeat[]): PushYourLuckSeat {
  return seats.reduce((best, seat) => (seat.banked > best.banked ? seat : best), seats[0]);
}

export function progressPercent(banked: number, targetScore: number): number {
  if (targetScore <= 0) return 0;
  return Math.min(100, Math.round((banked / targetScore) * 100));
}

/** 0-1 scale for the risk meter, normalised against the bust ceiling. */
export function riskLevel(bustChance: number): number {
  return Math.min(1, bustChance / BUST_CHANCE_MAX);
}

export function seatsRemainingToTarget(seat: PushYourLuckSeat, targetScore: number): number {
  return Math.max(0, targetScore - seat.banked);
}

export function humanSeatCount(seats: PushYourLuckSeat[]): number {
  return seats.filter((seat) => seat.kind === SEAT_HUMAN).length;
}

export function botSeatCount(seats: PushYourLuckSeat[]): number {
  return seats.filter((seat) => seat.kind === SEAT_BOT).length;
}

export function formatBustChance(bustChance: number): string {
  return `${Math.round(bustChance * 100)}%`;
}

/**
 * Single sentence describing the table right now, read out by the screen
 * reader live region after every action.
 */
export function formatStatusAnnouncement(state: PushYourLuckState): string {
  if (state.phase === PHASE_GAME_OVER) {
    const winner = state.seats.find((seat) => seat.id === state.winnerId);
    return winner ? `${winner.name} wins with ${winner.banked} points.` : 'The match is over.';
  }
  return state.announcement;
}
