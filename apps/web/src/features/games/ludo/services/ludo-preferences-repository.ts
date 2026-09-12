import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { LudoPreferences } from '../types/ludo.types';

const DEFAULT_PREFERENCES: LudoPreferences = {
  lastSeatCount: 4,
  autoFillWithBots: false,
};

export class LocalLudoPreferencesRepository {
  private readonly storageKey = STORAGE_KEYS.gamePreferences('ludo');

  async getPreferences(): Promise<LudoPreferences> {
    const prefs = await StorageService.get<LudoPreferences>(this.storageKey);
    return prefs ?? { ...DEFAULT_PREFERENCES };
  }

  async savePreferences(preferences: LudoPreferences): Promise<void> {
    await StorageService.set(this.storageKey, preferences);
  }
}

export const ludoPreferencesRepository = new LocalLudoPreferencesRepository();
