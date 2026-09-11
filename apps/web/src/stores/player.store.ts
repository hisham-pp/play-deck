import { create } from 'zustand';
import { Player, PlayerStats, GameCategory } from '@playdeck/game-types';
import { generateId } from '@playdeck/shared';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

interface PlayerState {
  player: Player | null;
  stats: PlayerStats;
  isInitialized: boolean;
  initPlayer: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  recordGamePlayed: (won: boolean, category?: GameCategory) => Promise<void>;
}

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
};

function createGuestPlayer(): Player {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return {
    id: generateId('player'),
    displayName: `Player_${randomSuffix}`,
    avatar: '🕹️',
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,
  stats: DEFAULT_STATS,
  isInitialized: false,

  initPlayer: async () => {
    if (get().isInitialized) return;

    try {
      const stored = await StorageService.get<{ player: Player; stats: PlayerStats }>(
        STORAGE_KEYS.PLAYER,
      );

      if (stored && stored.player) {
        set({
          player: stored.player,
          stats: stored.stats || DEFAULT_STATS,
          isInitialized: true,
        });
      } else {
        const newPlayer = createGuestPlayer();
        const newState = { player: newPlayer, stats: DEFAULT_STATS };
        await StorageService.set(STORAGE_KEYS.PLAYER, newState);
        set({ ...newState, isInitialized: true });
      }
    } catch {
      const fallbackPlayer = createGuestPlayer();
      set({ player: fallbackPlayer, stats: DEFAULT_STATS, isInitialized: true });
    }
  },

  updateDisplayName: async (displayName: string) => {
    const current = get().player;
    if (!current) return;
    const updated = { ...current, displayName: displayName.trim() };
    set({ player: updated });
    await StorageService.set(STORAGE_KEYS.PLAYER, { player: updated, stats: get().stats });
  },

  updateAvatar: async (avatar: string) => {
    const current = get().player;
    if (!current) return;
    const updated = { ...current, avatar };
    set({ player: updated });
    await StorageService.set(STORAGE_KEYS.PLAYER, { player: updated, stats: get().stats });
  },

  recordGamePlayed: async (won: boolean, category?: GameCategory) => {
    const currentStats = get().stats;
    const updatedStats: PlayerStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      wins: won ? currentStats.wins + 1 : currentStats.wins,
      losses: won ? currentStats.losses : currentStats.losses + 1,
      favoriteCategory: category || currentStats.favoriteCategory,
    };

    set({ stats: updatedStats });
    const player = get().player;
    if (player) {
      await StorageService.set(STORAGE_KEYS.PLAYER, { player, stats: updatedStats });
    }
  },
}));
