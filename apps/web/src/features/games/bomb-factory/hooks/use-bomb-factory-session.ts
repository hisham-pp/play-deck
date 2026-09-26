'use client';

import { useEffect, useMemo, useRef } from 'react';
import { GAME_DEFINITIONS } from '@playdeck/game-data';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import {
  GAME_ID,
  PHASE_MACHINE_FAILED,
  PHASE_SHIFT_COMPLETE,
} from '../engine/bomb-factory-constants';
import { bombFactoryStatsRepository } from '../services/bomb-factory-stats-repository';
import type { BombFactoryState } from '../types/bomb-factory.types';

/**
 * Records the shift once it ends, either way. A failed machine still counts as
 * a shift played — the crew turned up, the bomb just went off.
 */
export function useBombFactorySession(state: BombFactoryState): void {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const reportedRef = useRef(false);
  const gameDef = useMemo(() => GAME_DEFINITIONS.find((game) => game.id === GAME_ID), []);

  const isOver = state.phase === PHASE_SHIFT_COMPLETE || state.phase === PHASE_MACHINE_FAILED;

  useEffect(() => {
    if (!isOver) reportedRef.current = false;
  }, [isOver]);

  useEffect(() => {
    if (!isOver || reportedRef.current || !gameDef) return;
    reportedRef.current = true;

    const completed = state.phase === PHASE_SHIFT_COMPLETE;
    void recordGamePlayed(completed, 'puzzle');
    void bombFactoryStatsRepository.recordShift({
      completed,
      machinesCleared: state.machinesCleared,
      faults: state.faults.length,
      score: state.score,
    });

    if (!player) return;
    const session = currentSession ?? startSession(gameDef, player);
    const result = endSession(completed ? player.id : undefined, !completed);
    if (result) {
      addRecentSession({ ...session, status: 'completed', endedAt: new Date().toISOString() });
    }
  }, [
    isOver,
    state.phase,
    state.machinesCleared,
    state.faults.length,
    state.score,
    gameDef,
    player,
    currentSession,
    startSession,
    endSession,
    addRecentSession,
    recordGamePlayed,
  ]);
}
