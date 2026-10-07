import { create } from 'zustand';
import { getSupabaseClient } from '@/lib/supabase/client';
import { usePlayerStore } from './player.store';
import type { AchievementDefinition } from '@playdeck/game-types';

export interface ToastData {
  id: string;
  achievementId: string;
  gameId: string;
  title: string;
  icon: string;
  points: number;
}

interface AchievementsState {
  unlockedIds: Set<string>;
  toasts: ToastData[];
  
  loadUnlocked: () => Promise<void>;
  unlock: (def: AchievementDefinition) => Promise<void>;
  dismissToast: (id: string) => void;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  unlockedIds: new Set(),
  toasts: [],
  
  loadUnlocked: async () => {
    const supabase = getSupabaseClient();
    const player = usePlayerStore.getState().player;
    if (!supabase || !player || player.isGuest) return;
    
    try {
      const { data, error } = await supabase
        .from('player_achievements')
        .select('achievement_id')
        .eq('user_id', player.id);
        
      if (!error && data) {
        set({ unlockedIds: new Set(data.map((d) => d.achievement_id)) });
      }
    } catch (e) {
      console.error('Failed to load achievements', e);
    }
  },
  
  unlock: async (def) => {
    const { unlockedIds } = get();
    // If already unlocked in this session/memory, ignore
    if (unlockedIds.has(def.id)) return;
    
    const newToast: ToastData = {
      id: Math.random().toString(36).substring(2),
      achievementId: def.id,
      gameId: def.gameId,
      title: def.title,
      icon: def.icon,
      points: def.points,
    };
    
    // Add to unlocked list and show toast immediately (optimistic UI)
    const newSet = new Set(unlockedIds);
    newSet.add(def.id);
    set((state) => ({
      unlockedIds: newSet,
      toasts: [...state.toasts, newToast],
    }));
    
    // Persist to Supabase if logged in
    const supabase = getSupabaseClient();
    const player = usePlayerStore.getState().player;
    if (supabase && player && !player.isGuest) {
      try {
        await supabase.from('player_achievements').insert({
          user_id: player.id,
          game_id: def.gameId,
          achievement_id: def.id,
          points: def.points,
        });
      } catch (e) {
        console.error('Failed to save achievement unlock', e);
      }
    }
  },
  
  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
