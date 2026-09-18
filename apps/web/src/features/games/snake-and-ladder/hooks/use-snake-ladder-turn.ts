'use client';

import { STATUS_PAUSED, STATUS_PLAYING } from '../engine/snake-ladder-constants';
import type { SnakeLadderEngine } from '../engine/snake-ladder-engine';
import type { SnakeLadderGameState, SnakeLadderPlayer } from '../types/snake-and-ladder.types';

export interface TurnGate {
  currentSeat: SnakeLadderPlayer | undefined;
  /** True when the roll button belongs to whoever is sitting at this device. */
  isLocalTurn: boolean;
  canRoll: boolean;
  /** Why the roll button is disabled, phrased for the player. */
  waitingFor: string | null;
}

interface UseSnakeLadderTurnOptions {
  engine: SnakeLadderEngine;
  state: SnakeLadderGameState;
  seats: SnakeLadderPlayer[];
  isOnline: boolean;
  localPlayerId: string | null;
  boardIsBusy: boolean;
}

/**
 * Decides who may press Roll. Offline, the device rolls for every human seat
 * in turn (pass-and-play); online, only for the seat this player occupies.
 * The engine still has the final say — this only gates the button.
 */
export function useSnakeLadderTurn({
  engine,
  state,
  seats,
  isOnline,
  localPlayerId,
  boardIsBusy,
}: UseSnakeLadderTurnOptions): TurnGate {
  const currentSeat = seats.find((seat) => seat.seatIndex === state.currentTurnSeatIndex);

  const isLocalTurn = isOnline
    ? Boolean(currentSeat && localPlayerId && currentSeat.id === localPlayerId)
    : currentSeat?.type === 'human';

  const engineAllows = engine.canRoll(state.currentTurnSeatIndex);
  const canRoll = engineAllows && isLocalTurn && !boardIsBusy;

  let waitingFor: string | null = null;
  if (state.status === STATUS_PAUSED) {
    waitingFor = 'Paused';
  } else if (state.status !== STATUS_PLAYING) {
    waitingFor = null;
  } else if (boardIsBusy) {
    waitingFor = state.lastMoveNote;
  } else if (!isLocalTurn && currentSeat) {
    waitingFor = `Waiting for ${currentSeat.displayName}…`;
  }

  return { currentSeat, isLocalTurn, canRoll, waitingFor };
}
