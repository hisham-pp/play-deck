import type {
  BotNerve,
  PushYourLuckSeat,
  PushYourLuckState,
  PushYourLuckTurn,
} from '../types/push-your-luck.types';
import {
  BOT_NAMES,
  DEFAULT_AVATARS,
  DEFAULT_TARGET_SCORE,
  MAX_SEATS,
  MIN_SEATS,
  NERVE_BALANCED,
  PHASE_PLAYING,
  SEAT_BOT,
  SEAT_HUMAN,
} from './push-your-luck-constants';
import { bustChanceForDraw } from './push-your-luck-deck';
import { createSeed } from './push-your-luck-rng';

export function createEmptyTurn(): PushYourLuckTurn {
  return { pot: 0, draws: 0, events: [], savedByInsurance: false, resolved: null };
}

export interface SeatConfig {
  humanSeats: number;
  botSeats: number;
  nerve: BotNerve;
  playerName?: string;
  playerAvatar?: string;
}

function humanSeatName(index: number, playerName?: string): string {
  if (index === 0 && playerName) return playerName;
  return `Player ${index + 1}`;
}

/**
 * Builds the seat roster for a local match: the signed-in player takes seat 1,
 * any extra human seats are pass-and-play, and bots fill the rest.
 */
export function createSeats({
  humanSeats,
  botSeats,
  nerve,
  playerName,
  playerAvatar,
}: SeatConfig): PushYourLuckSeat[] {
  const humans = Math.max(1, humanSeats);
  const bots = Math.max(0, Math.min(botSeats, MAX_SEATS - humans));
  const seats: PushYourLuckSeat[] = [];

  for (let index = 0; index < humans; index += 1) {
    seats.push({
      id: `seat-${index + 1}`,
      name: humanSeatName(index, playerName),
      avatar: (index === 0 && playerAvatar) || DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
      kind: SEAT_HUMAN,
      nerve,
      banked: 0,
      insurance: 0,
      busts: 0,
      bestRound: 0,
    });
  }

  for (let index = 0; index < bots; index += 1) {
    const seatIndex = humans + index;
    seats.push({
      id: `seat-${seatIndex + 1}`,
      name: BOT_NAMES[index % BOT_NAMES.length],
      avatar: DEFAULT_AVATARS[seatIndex % DEFAULT_AVATARS.length],
      kind: SEAT_BOT,
      nerve,
      banked: 0,
      insurance: 0,
      busts: 0,
      bestRound: 0,
    });
  }

  // A one-seat table has no tension: pad with a bot rather than refuse to start.
  if (seats.length < MIN_SEATS) {
    seats.push({
      id: `seat-${seats.length + 1}`,
      name: BOT_NAMES[0],
      avatar: DEFAULT_AVATARS[seats.length % DEFAULT_AVATARS.length],
      kind: SEAT_BOT,
      nerve,
      banked: 0,
      insurance: 0,
      busts: 0,
      bestRound: 0,
    });
  }

  return seats;
}

export function createInitialPushYourLuckState(
  seats: PushYourLuckSeat[] = createSeats({
    humanSeats: 1,
    botSeats: 2,
    nerve: NERVE_BALANCED,
  }),
  targetScore: number = DEFAULT_TARGET_SCORE,
  seed: number = createSeed(),
): PushYourLuckState {
  return {
    phase: PHASE_PLAYING,
    seats,
    activeSeat: 0,
    targetScore,
    round: 1,
    turn: createEmptyTurn(),
    bustChance: bustChanceForDraw(1),
    lastOutcome: null,
    lastCard: null,
    stolenFrom: null,
    winnerId: null,
    seed,
    announcement: `${seats[0].name} is up. First draw is free — race to ${targetScore}.`,
  };
}

/** Clears scores and turn state but keeps the roster and target intact. */
export function resetMatchState(state: PushYourLuckState): PushYourLuckState {
  const seats = state.seats.map((seat) => ({
    ...seat,
    banked: 0,
    insurance: 0,
    busts: 0,
    bestRound: 0,
  }));
  return createInitialPushYourLuckState(seats, state.targetScore, state.seed);
}
