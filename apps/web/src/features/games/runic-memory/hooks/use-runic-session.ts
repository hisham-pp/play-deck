import { useCallback, useMemo } from 'react';
import type { GameDefinition, GameResult, GameSession, Player } from '@playdeck/game-types';
import { GAME_DEFINITIONS } from '@/data/games';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { runicStatsRepository } from '../services/runic-stats-repository';
import type { RunicGameState } from '../types/runic-memory.types';

interface SessionHandlers {
  activeSession: GameSession | null;
  player: Player | null;
  gameDef: GameDefinition;
  startSession: (game: GameDefinition, hostPlayer: Player) => GameSession;
  endSession: (winnerId?: string, isDraw?: boolean) => GameResult | null;
  addRecentSession: (session: GameSession) => void;
}

function finalizeMatchSession(
  handlers: SessionHandlers,
  winnerId: string | undefined,
  isDraw: boolean,
): void {
  const { player, gameDef, startSession, endSession, addRecentSession } = handlers;
  if (!player) return;

  const session = handlers.activeSession ?? startSession(gameDef, player);
  const result = endSession(winnerId, isDraw);

  if (result) {
    addRecentSession({
      ...session,
      status: 'completed',
      endedAt: new Date().toISOString(),
    });
  }
}

export function useRunicSession() {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const gameDef = useMemo(
    () => GAME_DEFINITIONS.find((g) => g.id === 'runic-memory') ?? GAME_DEFINITIONS[0],
    [],
  );

  const handleGameOver = useCallback(
    async (gameState: RunicGameState) => {
      const isWon = gameState.winner === 'P1';
      const isDraw = gameState.winner === 'tie';

      await recordGamePlayed(isWon, 'puzzle');

      await runicStatsRepository.recordGameResult({
        won: isWon,
        difficulty: gameState.difficulty,
        moves: gameState.moves,
        timeSeconds: gameState.elapsedSeconds,
        combo: gameState.maxCombo,
        matches: gameState.matches,
        mode: gameState.mode,
      });

      const winnerId = isDraw ? undefined : isWon ? player?.id : 'runic-opponent';

      finalizeMatchSession(
        {
          activeSession: currentSession,
          player,
          gameDef,
          startSession,
          endSession,
          addRecentSession,
        },
        winnerId,
        isDraw,
      );
    },
    [currentSession, player, gameDef, recordGamePlayed, startSession, endSession, addRecentSession],
  );

  return { handleGameOver };
}
