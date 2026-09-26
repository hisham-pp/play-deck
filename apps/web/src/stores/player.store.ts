import { create } from 'zustand';
import type { GameCategory, Player, PlayerStats } from '@playdeck/game-types';
import { SupabaseAuthService } from '@/features/auth/services/supabase-auth.service';
import { evaluateProgression, type ProgressionUpdateResult } from '@/features/player';
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
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  recordGamePlayed: (
    won: boolean,
    category?: GameCategory,
    gameId?: string,
    score?: number,
  ) => Promise<ProgressionUpdateResult>;
  resetStats: () => Promise<void>;
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
      const stored = await StorageService.get<{ player: Player; stats: PlayerStats }>(
        STORAGE_KEYS.PLAYER,
      );

      if (stored?.player) {
        // If stored player is logged-in, refresh profile from table if connected
        if (!stored.player.isGuest && SupabaseAuthService.isConfigured()) {
          const fresh = await SupabaseAuthService.fetchPlayerFromTable(stored.player.id);
          if (fresh) {
            set({ player: fresh, stats: stored.stats || DEFAULT_STATS, isInitialized: true });
            await persistPlayerAndStats(fresh, stored.stats || DEFAULT_STATS);
            return;
          }
        }
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
    if (!res.success || !res.player) {
      const err = res.error || 'Failed to sign up';
      set({ isLoadingAuth: false, authError: err });
      return { success: false, error: err };
    }
    set({ player: res.player, isLoadingAuth: false, authError: null, isAuthModalOpen: false });
    await persistPlayerAndStats(res.player, get().stats);
    return { success: true };
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

    // Evaluate customization achievement
    const currentStats = get().stats;
    const progressRes = evaluateProgression(currentStats);
    if (!progressRes.updatedStats.unlockedAchievements?.includes('custom_identity')) {
      const nowIso = new Date().toISOString();
      const updatedAchievements = [
        ...(progressRes.updatedStats.unlockedAchievements ?? []),
        'custom_identity',
      ];
      const updatedAchievementsData = {
        ...(progressRes.updatedStats.achievementsData ?? {}),
        custom_identity: { unlockedAt: nowIso, progress: 1 },
      };
      const statsWithAchievement = {
        ...progressRes.updatedStats,
        unlockedAchievements: updatedAchievements,
        achievementsData: updatedAchievementsData,
        xp: (progressRes.updatedStats.xp ?? 0) + 50,
      };
      set({ stats: statsWithAchievement });
      await persistPlayerAndStats(updated, statsWithAchievement);
    } else {
      await persistPlayerAndStats(updated, currentStats);
    }

    if (!updated.isGuest) await SupabaseAuthService.savePlayerToTable(updated);
  },

  updateAvatar: async (avatar: string) => {
    const current = get().player;
    if (!current) return;
    const updated = { ...current, avatar };
    set({ player: updated });

    // Evaluate customization achievement
    const currentStats = get().stats;
    const progressRes = evaluateProgression(currentStats);
    if (!progressRes.updatedStats.unlockedAchievements?.includes('custom_identity')) {
      const nowIso = new Date().toISOString();
      const updatedAchievements = [
        ...(progressRes.updatedStats.unlockedAchievements ?? []),
        'custom_identity',
      ];
      const updatedAchievementsData = {
        ...(progressRes.updatedStats.achievementsData ?? {}),
        custom_identity: { unlockedAt: nowIso, progress: 1 },
      };
      const statsWithAchievement = {
        ...progressRes.updatedStats,
        unlockedAchievements: updatedAchievements,
        achievementsData: updatedAchievementsData,
        xp: (progressRes.updatedStats.xp ?? 0) + 50,
      };
      set({ stats: statsWithAchievement });
      await persistPlayerAndStats(updated, statsWithAchievement);
    } else {
      await persistPlayerAndStats(updated, currentStats);
    }

    if (!updated.isGuest) await SupabaseAuthService.savePlayerToTable(updated);
  },

  recordGamePlayed: async (
    won: boolean,
    category?: GameCategory,
    gameId?: string,
    score?: number,
  ) => {
    const s = get().stats;
    const result = evaluateProgression(s, { won, category, gameId, score });
    set({ stats: result.updatedStats });
    if (get().player) {
      await persistPlayerAndStats(get().player!, result.updatedStats);
    }
    return result;
  },

  resetStats: async () => {
    set({ stats: DEFAULT_STATS });
    if (get().player) {
      await persistPlayerAndStats(get().player!, DEFAULT_STATS);
    }
  },
}));
