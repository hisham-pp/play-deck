import type { ElevatorEvent, ElevatorEventKind } from '../types/unstable-elevator.types';

/** How much of the ticker history is kept for the log and the live region. */
const MAX_EVENTS = 8;

let nextEventId = 1;

export function makeEvent(
  kind: ElevatorEventKind,
  message: string,
  floor: number,
  seatId: string | null = null,
): ElevatorEvent {
  nextEventId += 1;
  return { id: nextEventId, kind, message, floor, seatId };
}

export function pushEvent(events: ElevatorEvent[], event: ElevatorEvent): ElevatorEvent[] {
  return [...events, event].slice(-MAX_EVENTS);
}

/** Reset between matches so a fresh run starts its ids from the bottom again. */
export function resetEventIds(): void {
  nextEventId = 1;
}
