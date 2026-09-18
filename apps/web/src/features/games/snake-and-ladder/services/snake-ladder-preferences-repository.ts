import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { SnakeLadderPreferences } from '../types/snake-and-ladder.types';

const DEFAULT_PREFERENCES: SnakeLadderPreferences = {
  lastSeatCount: 2,
  lastBotCount: 1,
};

export class LocalSnakeLadderPreferencesRepository {
  private readonly storageKey = STORAGE_KEYS.gamePreferences('snake-and-ladder');

  async getPreferences(): Promise<SnakeLadderPreferences> {
    const prefs = await StorageService.get<SnakeLadderPreferences>(this.storageKey);
    return prefs ?? { ...DEFAULT_PREFERENCES };
  }

  async savePreferences(preferences: SnakeLadderPreferences): Promise<void> {
    await StorageService.set(this.storageKey, preferences);
  }
}

export const snakeLadderPreferencesRepository = new LocalSnakeLadderPreferencesRepository();
