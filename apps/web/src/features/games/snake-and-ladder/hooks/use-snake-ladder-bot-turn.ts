'use client';

import { useEffect, useRef, useState } from 'react';
import { STATUS_PLAYING } from '../engine/snake-ladder-constants';
import type { SnakeLadderEngine } from '../engine/snake-ladder-engine';
import type { SnakeLadderGameState, SnakeLadderPlayer } from '../types/snake-and-ladder.types';

const MIN_THINKING_MS = 450;
const MAX_THINKING_MS = 950;

function randomThinkingDelay(): number {
  return MIN_THINKING_MS + Math.random() * (MAX_THINKING_MS - MIN_THINKING_MS);
}

export interface UseSnakeLadderBotTurnReturn {
  /** Seat the bot pause is currently on, for the roster spinner. */
  thinkingSeatIndex: number | null;
}

/**
 * Takes bot turns outside the engine, through the same roll path a human uses.
 *
 * Snake & Ladder is a game of pure chance — there is no board decision for a
 * bot to get right or wrong — so these opponents deliberately have no
 * difficulty setting. The only thing to tune is the pause before the roll, so
 * the board reads as a turn rather than an instant jump.
 *
 * Bots only take a turn once the previous move has finished replaying
 * (`boardIsBusy`), otherwise the animation would be cut off mid-slide.
 */
export function useSnakeLadderBotTurn(
  engine: SnakeLadderEngine,
  state: SnakeLadderGameState,
  seats: SnakeLadderPlayer[],
  boardIsBusy: boolean,
  rollForPlayer: (playerId: string) => void,
): UseSnakeLadderBotTurnReturn {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [thinkingSeatIndex, setThinkingSeatIndex] = useState<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (state.status !== STATUS_PLAYING || boardIsBusy) {
      setThinkingSeatIndex(null);
      return;
    }

    const seatIndex = state.currentTurnSeatIndex;
    const seat = seats.find((s) => s.seatIndex === seatIndex);
    if (!seat || seat.type !== 'bot' || !engine.canRoll(seatIndex)) {
      setThinkingSeatIndex(null);
      return;
    }

    setThinkingSeatIndex(seatIndex);
    timeoutRef.current = setTimeout(() => {
      setThinkingSeatIndex(null);
      // Re-check against live state: the turn may have moved on while we waited.
      if (engine.canRoll(seatIndex)) {
        rollForPlayer(seat.id);
      }
    }, randomThinkingDelay());

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [engine, state, seats, boardIsBusy, rollForPlayer]);

  return { thinkingSeatIndex };
}
