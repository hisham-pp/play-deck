'use client';

import { useCallback, useMemo } from 'react';
import { GAME_DEFINITIONS } from '@/data/games';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { chessStatsRepository } from '../services/chess-stats-repository';
import type { ChessGameState } from '../types/chess.types';

const CHESS_GAME_ID = 'chess';

/**
 * Ties a finished game into the platform: player stats, chess-specific records
 * and the session history on the shelf.
 *
 * Both players sit at one board, so there is no "did the user win" to record --
 * the local player is whoever is playing. A decisive game counts as a win for
 * the account, a draw as neither.
 */
export function useChessSession() {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const gameDef = useMemo(
    () => GAME_DEFINITIONS.find((game) => game.id === CHESS_GAME_ID) ?? GAME_DEFINITIONS[0],
    [],
  );

  const handleGameOver = useCallback(
    async (state: ChessGameState) => {
      const result = state.result;
      if (!result) return;

      const isDraw = result.winner === null;

      await recordGamePlayed(!isDraw, 'board');
      await chessStatsRepository.recordGameResult({
        winner: result.winner,
        reason: result.reason,
        plies: state.history.length,
      });

      if (!player) return;

      const session = currentSession ?? startSession(gameDef, player);
      const ended = endSession(isDraw ? undefined : player.id, isDraw);

      if (ended) {
        addRecentSession({
          ...session,
          status: 'completed',
          endedAt: new Date().toISOString(),
        });
      }
    },
    [addRecentSession, currentSession, endSession, gameDef, player, recordGamePlayed, startSession],
  );

  return { handleGameOver };
}
