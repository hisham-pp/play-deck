import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { StorageAdapter } from '@playdeck/game-types';

import { StorageService } from '@/lib/storage/storage';

import { FloorIsLavaStatsRepository } from './floor-is-lava-stats-repository';

class MemoryStorageAdapter implements StorageAdapter {
  private map = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.map.get(key) as T) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.map.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.map.delete(key);
  }

  async clear(): Promise<void> {
    this.map.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.map.keys());
  }
}

describe('FloorIsLavaStatsRepository', () => {
  let repo: FloorIsLavaStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new FloorIsLavaStatsRepository();
  });

  it('returns default stats initially', async () => {
    const stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 0);
    assert.strictEqual(stats.matchesWon, 0);
    assert.strictEqual(stats.longestSurvivalSec, 0);
  });

  it('records match completion and updates career metrics', async () => {
    await repo.recordMatchCompletion(true, 42.5, 3, 2);
    let stats = await repo.getStats();

    assert.strictEqual(stats.matchesPlayed, 1);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.opponentsPushed, 3);
    assert.strictEqual(stats.powerUpsCollected, 2);
    assert.strictEqual(stats.longestSurvivalSec, 42.5);

    // Second match with shorter survival
    await repo.recordMatchCompletion(false, 30.0, 1, 1);
    stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 2);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.longestSurvivalSec, 42.5); // Kept longest
  });
});
