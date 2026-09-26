import { useCallback, useMemo } from 'react';
import { GAME_DEFINITIONS } from '@playdeck/game-data';
import type { GameDefinition, GameResult, GameSession, Player } from '@playdeck/game-types';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { ticTacToeStatsRepository } from '../services/tic-tac-toe-stats-repository';
import type { PlayerMark, TicTacToeState } from '../types/tic-tac-toe.types';

function isUserWinner(winner: PlayerMark | null, state: TicTacToeState): boolean {
  return state.mode === 'single' ? winner === state.humanPlayerMark : winner !== null;
}

function resolveWinnerId(
  isDraw: boolean,
  isHumanWon: boolean,
  playerId: string,
): string | undefined {
  if (isDraw) return undefined;
  return isHumanWon ? playerId : 'tic-tac-toe-ai';
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

export function useTicTacToeSession() {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const gameDef = useMemo(
    () => GAME_DEFINITIONS.find((g) => g.id === 'tic-tac-toe') ?? GAME_DEFINITIONS[1],
    [],
  );

  const handleGameOver = useCallback(
    async (winner: PlayerMark | null, isDraw: boolean, gameState: TicTacToeState) => {
      const isHumanWon = isUserWinner(winner, gameState);

      await recordGamePlayed(isHumanWon, 'strategy');

      await ticTacToeStatsRepository.recordGameResult({
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
