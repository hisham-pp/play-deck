import { create } from 'zustand';
import { PlayerPreferences } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

interface PreferencesState extends PlayerPreferences {
  isInitialized: boolean;
  initPreferences: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleReducedMotion: () => Promise<void>;
  toggleAutoSave: () => Promise<void>;
}

const DEFAULT_PREFERENCES: PlayerPreferences = {
  theme: 'dark',
  soundEnabled: true,
  reducedMotion: false,
  autoSave: true,
};

function applyThemeClass(theme: 'dark' | 'light' | 'system') {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  isInitialized: false,

  initPreferences: async () => {
    if (get().isInitialized) return;
    try {
      const stored = await StorageService.get<PlayerPreferences>(STORAGE_KEYS.PREFERENCES);
      const preferences = stored || DEFAULT_PREFERENCES;
      set({ ...preferences, isInitialized: true });
      applyThemeClass(preferences.theme);
    } catch {
      set({ ...DEFAULT_PREFERENCES, isInitialized: true });
      applyThemeClass('dark');
    }
  },

  setTheme: async (theme: 'dark' | 'light' | 'system') => {
    set({ theme });
    applyThemeClass(theme);
    const updated: PlayerPreferences = {
      theme,
      soundEnabled: get().soundEnabled,
      reducedMotion: get().reducedMotion,
      autoSave: get().autoSave,
    };
    await StorageService.set(STORAGE_KEYS.PREFERENCES, updated);
  },

  toggleSound: async () => {
    const next = !get().soundEnabled;
    set({ soundEnabled: next });
    const updated: PlayerPreferences = {
      theme: get().theme,
      soundEnabled: next,
      reducedMotion: get().reducedMotion,
      autoSave: get().autoSave,
    };
    await StorageService.set(STORAGE_KEYS.PREFERENCES, updated);
  },

  toggleReducedMotion: async () => {
    const next = !get().reducedMotion;
    set({ reducedMotion: next });
    const updated: PlayerPreferences = {
      theme: get().theme,
      soundEnabled: get().soundEnabled,
      reducedMotion: next,
      autoSave: get().autoSave,
    };
    await StorageService.set(STORAGE_KEYS.PREFERENCES, updated);
  },

  toggleAutoSave: async () => {
    const next = !get().autoSave;
    set({ autoSave: next });
    const updated: PlayerPreferences = {
      theme: get().theme,
      soundEnabled: get().soundEnabled,
      reducedMotion: get().reducedMotion,
      autoSave: next,
    };
    await StorageService.set(STORAGE_KEYS.PREFERENCES, updated);
  },
}));
