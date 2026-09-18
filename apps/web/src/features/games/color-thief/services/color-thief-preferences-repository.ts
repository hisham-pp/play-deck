import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { ColorThiefPreferences } from '../types/color-thief.types';

const DEFAULT_PREFERENCES: ColorThiefPreferences = {
  lastSeatCount: 2,
  lastBotCount: 1,
  lastBoardSize: 10,
  highContrast: false,
};

export class LocalColorThiefPreferencesRepository {
  private readonly storageKey = STORAGE_KEYS.gamePreferences('color-thief');

  async getPreferences(): Promise<ColorThiefPreferences> {
    const prefs = await StorageService.get<ColorThiefPreferences>(this.storageKey);
    return { ...DEFAULT_PREFERENCES, ...prefs };
  }

  async savePreferences(preferences: Partial<ColorThiefPreferences>): Promise<void> {
    const current = await this.getPreferences();
    await StorageService.set(this.storageKey, { ...current, ...preferences });
  }
}

export const colorThiefPreferencesRepository = new LocalColorThiefPreferencesRepository();
