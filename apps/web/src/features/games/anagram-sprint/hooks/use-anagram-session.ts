'use client';

import { useCallback, useMemo } from 'react';
import { GAME_DEFINITIONS } from '@/data/games';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { GAME_ID } from '../engine/anagram-constants';
import type { AnagramState } from '../types/anagram-sprint.types';

const CATEGORY_PUZZLE = 'puzzle';

/**
 * Reports a finished match to the platform: the player's win/loss record, the
 * session history and the library shelf. The engine hook decides *when* a match
 * is over; this only decides what the rest of PlayDeck hears about it.
 */
export function useAnagramSession(localPlayerId: string | null) {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const gameDef = useMemo(() => GAME_DEFINITIONS.find((game) => game.id === GAME_ID), []);

  return useCallback(
    (state: AnagramState) => {
      const seatId = localPlayerId ?? state.players[0]?.id ?? null;
      const won = seatId !== null && state.winnerIds.includes(seatId);

      void recordGamePlayed(won, CATEGORY_PUZZLE);
      if (!player || !gameDef) return;

      const session = currentSession ?? startSession(gameDef, player);
      const result = endSession(state.winnerIds[0], state.winnerIds.length > 1);
      if (result) {
        addRecentSession({ ...session, status: 'completed', endedAt: new Date().toISOString() });
      }
    },
    [
      localPlayerId,
      player,
      gameDef,
      currentSession,
      startSession,
      endSession,
      addRecentSession,
      recordGamePlayed,
    ],
  );
}
