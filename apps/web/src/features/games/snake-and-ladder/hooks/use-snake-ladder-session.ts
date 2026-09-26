'use client';

import { useEffect, useMemo, useRef } from 'react';
import { GAME_DEFINITIONS } from '@playdeck/game-data';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { STATUS_COMPLETED } from '../engine/snake-ladder-constants';
import { snakeLadderStatsRepository } from '../services/snake-ladder-stats-repository';
import type { SnakeLadderGameState } from '../types/snake-and-ladder.types';

const GAME_ID = 'snake-and-ladder';

/**
 * Records the match once the engine reports `completed`, and tracks the local
 * player's biggest climb and worst slide along the way — the engine keeps no
 * per-match history of its own, only the latest move.
 */
export function useSnakeLadderSession(
  state: SnakeLadderGameState,
  localPlayerId: string | null,
): void {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const reportedRef = useRef(false);
  const extremesRef = useRef({ longestClimb: 0, worstSlide: 0 });
  const seenMoveIdRef = useRef(0);

  const gameDef = useMemo(() => GAME_DEFINITIONS.find((g) => g.id === GAME_ID), []);

  // A fresh match resets the running tallies along with the report guard.
  useEffect(() => {
    if (state.status === STATUS_COMPLETED) return;
    reportedRef.current = false;
    if (state.lastMove === null) {
      extremesRef.current = { longestClimb: 0, worstSlide: 0 };
      seenMoveIdRef.current = 0;
    }
  }, [state.status, state.lastMove]);

  useEffect(() => {
    const move = state.lastMove;
    if (!move || !move.jump) return;
    if (move.moveId <= seenMoveIdRef.current) return;
    seenMoveIdRef.current = move.moveId;
    if (move.playerId !== localPlayerId) return;

    const distance = Math.abs(move.jump.to - move.jump.from);
    const extremes = extremesRef.current;
    if (move.jump.kind === 'ladder') {
      extremes.longestClimb = Math.max(extremes.longestClimb, distance);
    } else {
      extremes.worstSlide = Math.max(extremes.worstSlide, distance);
    }
  }, [state.lastMove, localPlayerId]);

  useEffect(() => {
    if (state.status !== STATUS_COMPLETED || reportedRef.current || !gameDef) return;
    reportedRef.current = true;

    const localSeat = localPlayerId
      ? state.players.find((p) => p.playerId === localPlayerId)
      : undefined;
    const finishRank = localSeat?.finishRank ?? null;
    const won = finishRank === 1;

    void recordGamePlayed(won, 'board');
    void snakeLadderStatsRepository.recordGameResult({
      won,
      finishRank,
      longestClimb: extremesRef.current.longestClimb,
      worstSlide: extremesRef.current.worstSlide,
    });

    if (player) {
      const session = currentSession ?? startSession(gameDef, player);
      const result = endSession(state.winnerOrder[0], false);
      if (result) {
        addRecentSession({ ...session, status: 'completed', endedAt: new Date().toISOString() });
      }
    }
  }, [
    state.status,
    state.players,
    state.winnerOrder,
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
