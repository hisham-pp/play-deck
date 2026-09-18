import { useEffect } from 'react';
import { decideBotAction } from '../engine/push-your-luck-bot';
import { BOT_DRAW_DELAY_MS, PHASE_PLAYING, SEAT_BOT } from '../engine/push-your-luck-constants';
import type { PushYourLuckEngine } from '../engine/push-your-luck-engine';
import type { PushYourLuckState } from '../types/push-your-luck.types';

/**
 * Drives bot seats. One decision per tick so the table reads like a real
 * opponent thinking, rather than a whole turn resolving in a single frame.
 */
export function usePushYourLuckBots(engine: PushYourLuckEngine, state: PushYourLuckState): void {
  const seat = state.seats[state.activeSeat];
  const isBotTurn =
    state.phase === PHASE_PLAYING && seat?.kind === SEAT_BOT && state.turn.resolved === null;

  useEffect(() => {
    if (!isBotTurn) return;

    const timer = setTimeout(() => {
      if (!engine.canAct()) return;

      const live = engine.getState();
      // Banking an empty pot is a no-op, so a bot with nothing yet always draws.
      const wantsBank = decideBotAction(live) === 'bank' && live.turn.pot > 0;
      if (wantsBank) {
        engine.bank();
        return;
      }
      engine.push();
    }, BOT_DRAW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [engine, isBotTurn, state.activeSeat, state.turn.draws, state.turn.pot]);
}
