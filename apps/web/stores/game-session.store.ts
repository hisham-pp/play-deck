import { create } from 'zustand';
import { GameSession, GameDefinition, Player, GameResult } from '@playdeck/game-types';
import { SessionManager } from '@playdeck/game-core';

interface GameSessionState {
  currentSession: GameSession | null;
  activeGame: GameDefinition | null;
  lastResult: GameResult | null;
  isPlaying: boolean;
  isPaused: boolean;

  startSession: (game: GameDefinition, hostPlayer: Player) => GameSession;
  updateState: (newState: unknown) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (winnerId?: string, isDraw?: boolean) => GameResult | null;
  clearSession: () => void;
}

export const useGameSessionStore = create<GameSessionState>((set, get) => ({
  currentSession: null,
  activeGame: null,
  lastResult: null,
  isPlaying: false,
  isPaused: false,

  startSession: (game: GameDefinition, hostPlayer: Player) => {
    const session = SessionManager.createSession(game, hostPlayer);
    set({
      currentSession: session,
      activeGame: game,
      lastResult: null,
      isPlaying: true,
      isPaused: false,
    });
    return session;
  },

  updateState: (newState: unknown) => {
    const session = get().currentSession;
    if (!session) return;
    const updated: GameSession = {
      ...session,
      state: newState,
      updatedAt: new Date().toISOString(),
    };
    set({ currentSession: updated });
  },

  pauseSession: () => {
    const session = get().currentSession;
    if (!session) return;
    set({
      isPaused: true,
      currentSession: { ...session, status: 'paused', updatedAt: new Date().toISOString() },
    });
  },

  resumeSession: () => {
    const session = get().currentSession;
    if (!session) return;
    set({
      isPaused: false,
      currentSession: { ...session, status: 'playing', updatedAt: new Date().toISOString() },
    });
  },

  endSession: (winnerId?: string, isDraw?: boolean) => {
    const session = get().currentSession;
    if (!session) return null;

    const { session: finalizedSession, result } = SessionManager.finalizeSession(
      session,
      winnerId,
      isDraw
    );

    set({
      currentSession: finalizedSession,
      lastResult: result,
      isPlaying: false,
      isPaused: false,
    });

    return result;
  },

  clearSession: () => {
    set({
      currentSession: null,
      activeGame: null,
      isPlaying: false,
      isPaused: false,
    });
  },
}));
