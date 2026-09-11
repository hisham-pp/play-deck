import { StorageAdapter } from '@playdeck/game-types';

export class LocalStorageAdapter implements StorageAdapter {
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isBrowser) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Failed to parse key "${key}":`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!this.isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Failed to write key "${key}":`, error);
    }
  }

  async remove(key: string): Promise<void> {
    if (!this.isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Failed to remove key "${key}":`, error);
    }
  }

  async clear(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn('[LocalStorageAdapter] Failed to clear storage:', error);
    }
  }

  async keys(): Promise<string[]> {
    if (!this.isBrowser) return [];
    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.warn('[LocalStorageAdapter] Failed to get keys:', error);
      return [];
    }
  }
}
