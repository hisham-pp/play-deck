import { create } from 'zustand';
import { GameSession } from '@playdeck/game-types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

interface LibraryState {
  recentSessions: GameSession[];
  favorites: string[];
  pinnedGames: string[];
  isInitialized: boolean;
  initLibrary: () => Promise<void>;
  addRecentSession: (session: GameSession) => Promise<void>;
  toggleFavorite: (gameId: string) => Promise<void>;
  togglePinned: (gameId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  recentSessions: [],
  favorites: [],
  pinnedGames: [],
  isInitialized: false,

  initLibrary: async () => {
    if (get().isInitialized) return;
    try {
      const [sessions, favs, pinned] = await Promise.all([
        StorageService.get<GameSession[]>(STORAGE_KEYS.SESSIONS),
        StorageService.get<string[]>(STORAGE_KEYS.FAVORITES),
        StorageService.get<string[]>(STORAGE_KEYS.RECENT_GAMES),
      ]);

      set({
        recentSessions: sessions || [],
        favorites: favs || [],
        pinnedGames: pinned || [],
        isInitialized: true,
      });
    } catch {
      set({ isInitialized: true });
    }
  },

  addRecentSession: async (session: GameSession) => {
    const current = get().recentSessions.filter((s) => s.id !== session.id);
    const updated = [session, ...current].slice(0, 20);
    set({ recentSessions: updated });
    await StorageService.set(STORAGE_KEYS.SESSIONS, updated);
  },

  toggleFavorite: async (gameId: string) => {
    const current = get().favorites;
    const exists = current.includes(gameId);
    const updated = exists ? current.filter((id) => id !== gameId) : [...current, gameId];
    set({ favorites: updated });
    await StorageService.set(STORAGE_KEYS.FAVORITES, updated);
  },

  togglePinned: async (gameId: string) => {
    const current = get().pinnedGames;
    const exists = current.includes(gameId);
    const updated = exists ? current.filter((id) => id !== gameId) : [...current, gameId];
    set({ pinnedGames: updated });
    await StorageService.set(STORAGE_KEYS.RECENT_GAMES, updated);
  },

  clearHistory: async () => {
    set({ recentSessions: [] });
    await StorageService.remove(STORAGE_KEYS.SESSIONS);
  },
}));
