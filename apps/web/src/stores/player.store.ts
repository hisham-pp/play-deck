import { create } from 'zustand';
import type { Player, PlayerStats, GameCategory } from '@playdeck/game-types';
import { SupabaseAuthService } from '@/features/auth/services/supabase-auth.service';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { DEFAULT_STATS, createGuestPlayer, persistPlayerAndStats } from './player-store.utils';

export interface PlayerState {
  player: Player | null;
  stats: PlayerStats;
  isInitialized: boolean;
  isAuthModalOpen: boolean;
  isLoadingAuth: boolean;
  authError: string | null;
  setAuthModalOpen: (open: boolean) => void;
  clearAuthError: () => void;
  initPlayer: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    displayName?: string,
  ) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  recordGamePlayed: (won: boolean, category?: GameCategory) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,
  stats: DEFAULT_STATS,
  isInitialized: false,
  isAuthModalOpen: false,
  isLoadingAuth: false,
  authError: null,

  setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open, authError: null }),
  clearAuthError: () => set({ authError: null }),

  initPlayer: async () => {
    if (get().isInitialized) return;
    try {
      if (SupabaseAuthService.isConfigured()) {
        const remote = await SupabaseAuthService.getCurrentPlayer();
        if (remote) {
          const stored = await StorageService.get<{ stats: PlayerStats }>(STORAGE_KEYS.PLAYER);
          const stats = stored?.stats || DEFAULT_STATS;
          set({ player: remote, stats, isInitialized: true });
          await persistPlayerAndStats(remote, stats);
          return;
        }
      }
      const stored = await StorageService.get<{ player: Player; stats: PlayerStats }>(
        STORAGE_KEYS.PLAYER,
      );
      if (stored?.player) {
        set({ player: stored.player, stats: stored.stats || DEFAULT_STATS, isInitialized: true });
      } else {
        const guest = createGuestPlayer();
        set({ player: guest, stats: DEFAULT_STATS, isInitialized: true });
        await persistPlayerAndStats(guest, DEFAULT_STATS);
      }
    } catch {
      set({ player: createGuestPlayer(), stats: DEFAULT_STATS, isInitialized: true });
    }
  },

  signInWithEmail: async (email: string, pass: string) => {
    set({ isLoadingAuth: true, authError: null });
    const res = await SupabaseAuthService.signIn(email, pass);
    if (!res.success || !res.player) {
      const err = res.error || 'Failed to sign in';
      set({ isLoadingAuth: false, authError: err });
      return { success: false, error: err };
    }
    set({ player: res.player, isLoadingAuth: false, authError: null, isAuthModalOpen: false });
    await persistPlayerAndStats(res.player, get().stats);
    return { success: true };
  },

  signUpWithEmail: async (email: string, pass: string, displayName?: string) => {
    set({ isLoadingAuth: true, authError: null });
    const res = await SupabaseAuthService.signUp(email, pass, displayName);
    if (!res.success) {
      const err = res.error || 'Failed to sign up';
      set({ isLoadingAuth: false, authError: err });
      return { success: false, error: err };
    }
    if (res.player) {
      set({ player: res.player, isLoadingAuth: false, authError: null, isAuthModalOpen: false });
      await persistPlayerAndStats(res.player, get().stats);
    } else {
      set({ isLoadingAuth: false });
    }
    return { success: true, requiresVerification: res.requiresVerification };
  },

  signOut: async () => {
    set({ isLoadingAuth: true });
    await SupabaseAuthService.signOut();
    const guest = createGuestPlayer();
    set({ player: guest, isLoadingAuth: false, authError: null });
    await persistPlayerAndStats(guest, get().stats);
  },

  continueAsGuest: async () => {
    set({ isAuthModalOpen: false, authError: null });
    if (!get().player) {
      const guest = createGuestPlayer();
      set({ player: guest });
      await persistPlayerAndStats(guest, get().stats);
    }
  },

  updateDisplayName: async (name: string) => {
    const current = get().player;
    if (!current) return;
    const updated = { ...current, displayName: name.trim() };
    set({ player: updated });
    await persistPlayerAndStats(updated, get().stats);
    if (!updated.isGuest) await SupabaseAuthService.savePlayerToTable(updated);
  },

  updateAvatar: async (avatar: string) => {
    const current = get().player;
    if (!current) return;
    const updated = { ...current, avatar };
    set({ player: updated });
    await persistPlayerAndStats(updated, get().stats);
    if (!updated.isGuest) await SupabaseAuthService.savePlayerToTable(updated);
  },

  recordGamePlayed: async (won: boolean, category?: GameCategory) => {
    const s = get().stats;
    const updated: PlayerStats = {
      gamesPlayed: s.gamesPlayed + 1,
      wins: won ? s.wins + 1 : s.wins,
      losses: won ? s.losses : s.losses + 1,
      favoriteCategory: category || s.favoriteCategory,
    };
    set({ stats: updated });
    if (get().player) await persistPlayerAndStats(get().player!, updated);
  },
}));
