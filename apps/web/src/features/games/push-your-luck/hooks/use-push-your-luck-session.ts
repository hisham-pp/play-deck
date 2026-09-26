import { useCallback, useMemo } from 'react';
import { GAME_DEFINITIONS } from '@playdeck/game-data';
import type { GameDefinition, GameResult, GameSession, Player } from '@playdeck/game-types';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { SEAT_HUMAN } from '../engine/push-your-luck-constants';
import { pushYourLuckStatsRepository } from '../services/push-your-luck-stats-repository';
import type { PushYourLuckState } from '../types/push-your-luck.types';

const GAME_ID = 'push-your-luck';

interface SessionHandlers {
  activeSession: GameSession | null;
  player: Player | null;
  gameDef: GameDefinition;
  startSession: (game: GameDefinition, hostPlayer: Player) => GameSession;
  endSession: (winnerId?: string, isDraw?: boolean) => GameResult | null;
  addRecentSession: (session: GameSession) => void;
}

function finalizeMatchSession(handlers: SessionHandlers, winnerId: string | undefined): void {
  const { player, gameDef, startSession, endSession, addRecentSession } = handlers;
  if (!player) return;

  const session = handlers.activeSession ?? startSession(gameDef, player);
  const result = endSession(winnerId);

  if (result) {
    addRecentSession({
      ...session,
      status: 'completed',
      endedAt: new Date().toISOString(),
    });
  }
}

/** The seat the signed-in player controls — always the first human seat. */
function localSeatOf(state: PushYourLuckState) {
  return state.seats.find((seat) => seat.kind === SEAT_HUMAN) ?? state.seats[0];
}

export function usePushYourLuckSession() {
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const gameDef = useMemo(
    () => GAME_DEFINITIONS.find((game) => game.id === GAME_ID) ?? GAME_DEFINITIONS[0],
    [],
  );

  const handleMatchOver = useCallback(
    async (state: PushYourLuckState) => {
      const localSeat = localSeatOf(state);
      const won = state.winnerId === localSeat.id;

      await recordGamePlayed(won, 'casual');

      await pushYourLuckStatsRepository.recordMatchResult({
        won,
        banked: localSeat.banked,
        busts: localSeat.busts,
        longestPushStreak: localSeat.bestRound,
      });

      finalizeMatchSession(
        {
          activeSession: currentSession,
          player,
          gameDef,
          startSession,
          endSession,
          addRecentSession,
        },
        won && player ? player.id : (state.winnerId ?? undefined),
      );
    },
    [currentSession, player, gameDef, recordGamePlayed, startSession, endSession, addRecentSession],
  );

  return { handleMatchOver };
}
