import { create } from 'zustand';
import { PlayerPreferences } from '@playdeck/game-types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

interface PreferencesState extends PlayerPreferences {
  isInitialized: boolean;
  initPreferences: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleReducedMotion: () => Promise<void>;
  toggleAutoSave: () => Promise<void>;
}

const THEME_DARK = 'dark';

const DEFAULT_PREFERENCES: PlayerPreferences = {
  theme: THEME_DARK,
  soundEnabled: true,
  reducedMotion: false,
  autoSave: true,
};

function applyThemeClass(theme: 'dark' | 'light' | 'system') {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === THEME_DARK || (theme === 'system' && prefersDark);

  if (isDark) {
    root.classList.add(THEME_DARK);
  } else {
    root.classList.remove(THEME_DARK);
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
      applyThemeClass(THEME_DARK);
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
