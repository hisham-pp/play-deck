import { colorForSeat } from '../engine/board-layout';
import type { LudoPlayer } from '../types/ludo.types';

/**
 * Compacts a sparse seat list (with empty `null` gaps) into a contiguous
 * roster with correct seatIndex/color assignment for the resulting player
 * count. Must be called right before starting a match - seat gaps are only
 * meaningful in the lobby UI, never in engine input.
 */
export function finalizeSeats(seats: (LudoPlayer | null)[]): LudoPlayer[] {
  const occupied = seats.filter((seat): seat is LudoPlayer => seat !== null);
  return occupied.map((seat, index) => ({
    ...seat,
    seatIndex: index,
    color: colorForSeat(index, occupied.length),
  }));
}
