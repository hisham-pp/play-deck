'use client';

import { useCallback, useMemo } from 'react';
import { GAME_DEFINITIONS } from '@/data/games';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { chessStatsRepository } from '../services/chess-stats-repository';
import type { ChessGameState, PieceColor } from '../types/chess.types';

const CHESS_GAME_ID = 'chess';

/**
 * Ties a finished game into the platform: player stats, chess-specific records
 * and the session history on the shelf.
 *
 * At a shared board both players are at this screen, so a decisive game counts
 * as a win for the account. Online, it counts only when this player's colour
 * won. A draw is never a win.
 */
export function useChessSession(
  /** Read when a game ends, since the online seat is only known after mount. */
  localColorRef: { readonly current: PieceColor | null },
) {
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
      const localColor = localColorRef.current;
      // At a shared board someone at this screen always won; online, only if it was us.
      const won = !isDraw && (localColor === null || result.winner === localColor);

      await recordGamePlayed(won, 'board');
      await chessStatsRepository.recordGameResult({
        winner: result.winner,
        reason: result.reason,
        plies: state.history.length,
      });

      if (!player) return;

      const session = currentSession ?? startSession(gameDef, player);
      const ended = endSession(won ? player.id : undefined, isDraw);

      if (ended) {
        addRecentSession({
          ...session,
          status: 'completed',
          endedAt: new Date().toISOString(),
        });
      }
    },
    [
      addRecentSession,
      currentSession,
      endSession,
      gameDef,
      localColorRef,
      player,
      recordGamePlayed,
      startSession,
    ],
  );

  return { handleGameOver };
}
