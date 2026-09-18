'use client';

import { useMemo } from 'react';
import { isAbilityReady } from '../engine/abilities';
import { ABILITIES, STATUS_COMPLETED, STATUS_PLAYING } from '../engine/color-thief-constants';
import { scoreboardOf } from '../engine/territory';
import type {
  ColorThiefGameState,
  ColorThiefSeat,
  ColorThiefScore,
} from '../types/color-thief.types';
import { paintTheme } from '../utils/color-thief-colors';

export interface UseColorThiefTurnOptions {
  state: ColorThiefGameState;
  seats: ColorThiefSeat[];
  isOnline: boolean;
  localPlayerId: string | null;
}

export interface UseColorThiefTurnReturn {
  /** The seat holding the brush, or null before the match opens. */
  currentSeat: ColorThiefSeat | null;
  localSeat: ColorThiefSeat | null;
  /** True when this device may act right now. */
  canAct: boolean;
  abilityReady: boolean;
  scores: ColorThiefScore[];
  /** One line for the screen-reader live region. */
  announcement: string;
}

export function useColorThiefTurn({
  state,
  seats,
  isOnline,
  localPlayerId,
}: UseColorThiefTurnOptions): UseColorThiefTurnReturn {
  const currentSeat = seats.find((s) => s.seatIndex === state.currentTurnSeatIndex) ?? null;
  const localSeat = seats.find((s) => s.id === localPlayerId) ?? null;

  const scores = useMemo(() => scoreboardOf(state), [state]);

  // Offline the device passes between seats, so any human seat may act. Online
  // only the seat this client owns can, and bots are driven by the host.
  const canAct =
    state.status === STATUS_PLAYING &&
    currentSeat !== null &&
    currentSeat.type === 'human' &&
    (!isOnline || currentSeat.id === localPlayerId);

  const currentPlayer = state.players.find((p) => p.seatIndex === state.currentTurnSeatIndex);
  const abilityReady = Boolean(currentPlayer && canAct && isAbilityReady(state, currentPlayer));

  const announcement = useMemo(() => {
    if (state.status === STATUS_COMPLETED) {
      const names = state.winnerIds
        .map((id) => seats.find((s) => s.id === id)?.displayName ?? 'Someone')
        .join(' and ');
      return `Match over. ${names} ${state.winnerIds.length > 1 ? 'share' : 'takes'} the arena with ${scores[0]?.tiles ?? 0} tiles.`;
    }
    if (!currentSeat) return 'Waiting for the arena to open.';

    const theme = paintTheme(currentSeat.color);
    const ability = currentPlayer ? ABILITIES[currentPlayer.ability].name : '';
    const abilityNote = abilityReady ? ` ${ability} is ready.` : '';
    return `Round ${state.round} of ${state.settings.totalRounds}. ${currentSeat.displayName}, ${theme.label}, has ${state.paintRemaining} paint.${abilityNote}`;
  }, [state, seats, scores, currentSeat, currentPlayer, abilityReady]);

  return { currentSeat, localSeat, canAct, abilityReady, scores, announcement };
}
