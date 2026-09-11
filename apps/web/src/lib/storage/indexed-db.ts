import Dexie, { type Table } from 'dexie';
import { StorageAdapter } from '@playdeck/game-types';

interface KeyValueRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

class PlayDeckDexieDB extends Dexie {
  kvStore!: Table<KeyValueRecord, string>;

  constructor() {
    super('PlayDeckDB');
    this.version(1).stores({
      kvStore: 'key, updatedAt',
    });
  }
}

export class IndexedDBAdapter implements StorageAdapter {
  private db: PlayDeckDexieDB | null = null;
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
    if (this.isBrowser) {
      this.db = new PlayDeckDexieDB();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) return null;
    try {
      const record = await this.db.kvStore.get(key);
      return record ? (record.value as T) : null;
    } catch (error) {
      console.warn(`[IndexedDBAdapter] Failed to get key "${key}":`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.kvStore.put({
        key,
        value,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.warn(`[IndexedDBAdapter] Failed to set key "${key}":`, error);
    }
  }

  async remove(key: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.kvStore.delete(key);
    } catch (error) {
      console.warn(`[IndexedDBAdapter] Failed to remove key "${key}":`, error);
    }
  }

  async clear(): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.kvStore.clear();
    } catch (error) {
      console.warn('[IndexedDBAdapter] Failed to clear store:', error);
    }
  }

  async keys(): Promise<string[]> {
    if (!this.db) return [];
    try {
      const records = await this.db.kvStore.toArray();
      return records.map((r) => r.key);
    } catch (error) {
      console.warn('[IndexedDBAdapter] Failed to get keys:', error);
      return [];
    }
  }
}
