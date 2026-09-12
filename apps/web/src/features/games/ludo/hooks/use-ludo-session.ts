import { useEffect, useMemo, useRef } from 'react';
import { GAME_DEFINITIONS } from '@/data/games';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { ludoStatsRepository } from '../services/ludo-stats-repository';
import type { LudoGameState, LudoPlayer } from '../types/ludo.types';

/**
 * Records match results once when the engine reports `status === 'completed'`,
 * mirroring tic-tac-toe's session/result recording pattern. Only ever fires
 * once per completed match (guarded by a ref), regardless of re-renders.
 */
export function useLudoSession(
  state: LudoGameState,
  players: LudoPlayer[],
  localPlayerId: string | null,
): void {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();
  const reportedRef = useRef(false);

  const gameDef = useMemo(() => GAME_DEFINITIONS.find((g) => g.id === 'ludo'), []);

  useEffect(() => {
    if (state.status !== 'completed' || reportedRef.current || !gameDef) return;
    reportedRef.current = true;

    const localSeat = localPlayerId
      ? state.players.find((p) => p.playerId === localPlayerId)
      : undefined;
    const finishRank = localSeat?.finishRank ?? null;
    const won = finishRank === 1;

    const hardestBotDifficulty = players
      .filter((p) => p.type === 'bot')
      .reduce<'easy' | 'normal' | 'hard' | undefined>((hardest, p) => {
        const order = { easy: 0, normal: 1, hard: 2 } as const;
        const candidate = p.botConfig?.difficulty;
        if (!candidate) return hardest;
        if (!hardest || order[candidate] > order[hardest]) return candidate;
        return hardest;
      }, undefined);

    void recordGamePlayed(won, 'board');
    void ludoStatsRepository.recordGameResult({
      won,
      finishRank,
      vsBotDifficulty: hardestBotDifficulty,
    });

    if (player) {
      const session = currentSession ?? startSession(gameDef, player);
      const winnerId = state.winnerOrder[0];
      const result = endSession(winnerId, false);
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
    players,
    player,
    currentSession,
    startSession,
    endSession,
    addRecentSession,
    recordGamePlayed,
  ]);
}
