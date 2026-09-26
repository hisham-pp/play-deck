import { useCallback, useMemo } from 'react';
import { GAME_DEFINITIONS } from '@playdeck/game-data';
import type { GameDefinition, GameResult, GameSession, Player } from '@playdeck/game-types';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { connectFourStatsRepository } from '../services/connect-four-stats-repository';
import type { ConnectFourDisc, ConnectFourState } from '../types/connect-four.types';

function isUserWinner(winner: ConnectFourDisc | null, state: ConnectFourState): boolean {
  return state.mode === 'single' ? winner === state.humanPlayerDisc : winner !== null;
}

function resolveWinnerId(
  isDraw: boolean,
  isHumanWon: boolean,
  playerId: string,
): string | undefined {
  if (isDraw) return undefined;
  return isHumanWon ? playerId : 'connect-four-ai';
}

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

export function useConnectFourSession() {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const gameDef = useMemo(
    () => GAME_DEFINITIONS.find((g) => g.id === 'connect-four') ?? GAME_DEFINITIONS[0],
    [],
  );

  const handleGameOver = useCallback(
    async (winner: ConnectFourDisc | null, isDraw: boolean, gameState: ConnectFourState) => {
      const isHumanWon = isUserWinner(winner, gameState);

      await recordGamePlayed(isHumanWon, 'strategy');

      await connectFourStatsRepository.recordGameResult({
        won: isHumanWon,
        isDraw,
        difficulty: gameState.mode === 'single' ? gameState.aiDifficulty : undefined,
        mode: gameState.mode,
      });

      const winnerId = player ? resolveWinnerId(isDraw, isHumanWon, player.id) : undefined;

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
