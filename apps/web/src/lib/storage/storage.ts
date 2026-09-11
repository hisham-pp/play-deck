import { StorageAdapter } from '@playdeck/game-types';
import { IndexedDBAdapter } from './indexed-db';
import { LocalStorageAdapter } from './local-storage';

class StorageServiceSingleton {
  private adapter: StorageAdapter;

  constructor() {
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      this.adapter = new IndexedDBAdapter();
    } else {
      this.adapter = new LocalStorageAdapter();
    }
  }

  setAdapter(newAdapter: StorageAdapter): void {
    this.adapter = newAdapter;
  }

  getAdapter(): StorageAdapter {
    return this.adapter;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.adapter.get<T>(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    return this.adapter.set<T>(key, value);
  }

  async remove(key: string): Promise<void> {
    return this.adapter.remove(key);
  }

  async clear(): Promise<void> {
    return this.adapter.clear();
  }
}

export const StorageService = new StorageServiceSingleton();
