import type { ElevatorSeat } from '../types/unstable-elevator.types';
import { MAX_SEATS, SEAT_COLORS, SEAT_TYPE_BOT, SEAT_TYPE_HUMAN } from './elevator-constants';

const HUMAN_AVATARS = ['🛗', '🧰', '🔧', '🧱'];

export interface LocalCrewOptions {
  /** Display name for each pass-and-play seat, in seating order. */
  humanNames: string[];
  botCount: number;
}

/** Builds the seat list for an offline run: humans first, then bots. */
export function buildLocalCrew({ humanNames, botCount }: LocalCrewOptions): ElevatorSeat[] {
  const seats: ElevatorSeat[] = [];

  for (const name of humanNames) {
    if (seats.length >= MAX_SEATS) break;
    seats.push({
      id: `local-${seats.length + 1}`,
      displayName: name,
      avatar: HUMAN_AVATARS[seats.length % HUMAN_AVATARS.length],
      type: SEAT_TYPE_HUMAN,
      color: SEAT_COLORS[seats.length % SEAT_COLORS.length],
      seatIndex: seats.length,
      status: 'connected',
    });
  }

  for (let i = 0; i < botCount; i += 1) {
    if (seats.length >= MAX_SEATS) break;
    seats.push({
      id: `bot-${i + 1}`,
      displayName: `Bot ${i + 1}`,
      avatar: '🤖',
      type: SEAT_TYPE_BOT,
      color: SEAT_COLORS[seats.length % SEAT_COLORS.length],
      seatIndex: seats.length,
      status: 'connected',
    });
  }

  return seats;
}

/** Default pass-and-play names, with the signed-in player taking seat one. */
export function defaultCrewNames(playerName: string | undefined, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    index === 0 ? (playerName ?? 'Player 1') : `Player ${index + 1}`,
  );
}
