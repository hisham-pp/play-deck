'use client';

import { useEffect, useMemo, useRef } from 'react';
import { GAME_DEFINITIONS } from '@playdeck/game-data';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { GAME_ID } from '../engine/elevator-constants';
import { rankScores } from '../engine/elevator-scoring';
import { elevatorStatsRepository } from '../services/elevator-stats-repository';
import type { ElevatorGameState } from '../types/unstable-elevator.types';

/**
 * Files the run once the engine reports it finished: the shared session
 * history, the player's win tally, and this game's own best-floor record.
 */
export function useElevatorSession(state: ElevatorGameState, localPlayerId: string | null): void {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const reportedRef = useRef(false);
  const gameDef = useMemo(() => GAME_DEFINITIONS.find((game) => game.id === GAME_ID), []);

  useEffect(() => {
    if (!state.finished) reportedRef.current = false;
  }, [state.finished]);

  useEffect(() => {
    if (!state.finished || reportedRef.current || !gameDef) return;
    reportedRef.current = true;

    const ranked = rankScores(state.scores);
    const winnerId = ranked[0]?.seatId;
    const mine = localPlayerId ? ranked.find((score) => score.seatId === localPlayerId) : undefined;
    const won = Boolean(mine && mine.rank === 1);

    void recordGamePlayed(won, 'casual');
    void elevatorStatsRepository.recordRun({
      floorsCleared: Math.max(0, state.floor - 1),
      score: mine?.points ?? 0,
      objectsPlaced: mine?.placed ?? 0,
      objectsLost: mine?.lost ?? 0,
    });

    if (player) {
      const session = currentSession ?? startSession(gameDef, player);
      const result = endSession(winnerId, false);
      if (result) {
        addRecentSession({ ...session, status: 'completed', endedAt: new Date().toISOString() });
      }
    }
  }, [
    state.finished,
    state.scores,
    state.floor,
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
