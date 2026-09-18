'use client';

import { useEffect, useRef, useState } from 'react';
import { decideBotMove } from '../engine/color-thief-bot';
import { STATUS_PLAYING } from '../engine/color-thief-constants';
import type { ColorThiefGameState, ColorThiefSeat } from '../types/color-thief.types';

/** Long enough that a bot's paint spreading reads as a move, not a flicker. */
const BOT_THINK_MS = 650;

export interface ColorThiefBotActions {
  claim: (playerId: string, index: number) => void;
  ability: (playerId: string, targets: number[]) => void;
  endTurn: (playerId: string) => void;
}

/**
 * Drives every bot seat, one decision at a time. The bot re-reads the board
 * after each of its own strokes, so a spread it just made informs the next one.
 * Pass an empty `seats` list to stand the bots down — online, only the host
 * plays them, or the table would act twice on every move.
 */
export function useColorThiefBots(
  state: ColorThiefGameState,
  seats: ColorThiefSeat[],
  actions: ColorThiefBotActions,
): { thinkingSeatIndex: number | null } {
  const [thinkingSeatIndex, setThinkingSeatIndex] = useState<number | null>(null);

  const latest = useRef(actions);
  latest.current = actions;

  const seat = seats.find((s) => s.seatIndex === state.currentTurnSeatIndex);
  const isBotTurn = state.status === STATUS_PLAYING && seat?.type === 'bot';

  useEffect(() => {
    if (!isBotTurn || !seat) {
      setThinkingSeatIndex(null);
      return;
    }

    setThinkingSeatIndex(seat.seatIndex);
    const timer = setTimeout(() => {
      const move = decideBotMove(state, seat.seatIndex);
      const act = latest.current;

      if (move.kind === 'claim') act.claim(seat.id, move.index);
      else if (move.kind === 'ability') act.ability(seat.id, move.targets);
      else act.endTurn(seat.id);
    }, BOT_THINK_MS);

    return () => clearTimeout(timer);
    // `actionCount` advances on every applied stroke, which is what re-arms the
    // timer for the bot's next decision within the same turn.
  }, [isBotTurn, seat, state]);

  return { thinkingSeatIndex };
}
