'use client';

import { useEffect, useMemo, useRef } from 'react';
import { GAME_DEFINITIONS } from '@/data/games';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { STATUS_COMPLETED } from '../engine/color-thief-constants';
import { scoreboardOf } from '../engine/territory';
import { colorThiefStatsRepository } from '../services/color-thief-stats-repository';
import type { ColorThiefGameState } from '../types/color-thief.types';

const GAME_ID = 'color-thief';

/**
 * Records the match once the engine reports `completed`, counting the local
 * player's ability uses as they happen — the engine keeps a rolling log, not a
 * per-match tally.
 */
export function useColorThiefSession(
  state: ColorThiefGameState,
  localPlayerId: string | null,
): void {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const reportedRef = useRef(false);
  const abilitiesUsedRef = useRef(0);
  const seenLogIdRef = useRef(0);

  const gameDef = useMemo(() => GAME_DEFINITIONS.find((g) => g.id === GAME_ID), []);

  const localSeatIndex = state.players.find((p) => p.playerId === localPlayerId)?.seatIndex ?? null;

  // A fresh match resets the running tallies along with the report guard.
  useEffect(() => {
    if (state.status === STATUS_COMPLETED) return;
    reportedRef.current = false;
    if (state.actionCount === 0) {
      abilitiesUsedRef.current = 0;
      seenLogIdRef.current = 0;
    }
  }, [state.status, state.actionCount]);

  useEffect(() => {
    if (localSeatIndex === null) return;
    for (const entry of state.log) {
      if (entry.id <= seenLogIdRef.current) continue;
      seenLogIdRef.current = entry.id;
      if (entry.kind === 'ability' && entry.seatIndex === localSeatIndex) {
        abilitiesUsedRef.current += 1;
      }
    }
  }, [state.log, localSeatIndex]);

  useEffect(() => {
    if (state.status !== STATUS_COMPLETED || reportedRef.current || !gameDef) return;
    reportedRef.current = true;

    const won = localPlayerId !== null && state.winnerIds.includes(localPlayerId);
    const tilesHeld =
      scoreboardOf(state).find((entry) => entry.playerId === localPlayerId)?.tiles ?? 0;

    void recordGamePlayed(won, 'strategy');
    void colorThiefStatsRepository.recordGameResult({
      won,
      tilesHeld,
      abilitiesUsed: abilitiesUsedRef.current,
    });

    if (player) {
      const session = currentSession ?? startSession(gameDef, player);
      const result = endSession(state.winnerIds[0], state.winnerIds.length > 1);
      if (result) {
        addRecentSession({ ...session, status: 'completed', endedAt: new Date().toISOString() });
      }
    }
  }, [
    state,
    gameDef,
    localPlayerId,
    player,
    currentSession,
    startSession,
    endSession,
    addRecentSession,
    recordGamePlayed,
  ]);
}
