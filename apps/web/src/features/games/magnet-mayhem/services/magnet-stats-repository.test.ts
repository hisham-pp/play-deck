import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import { MagnetStatsRepository } from './magnet-stats-repository';

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

describe('MagnetStatsRepository', () => {
  let repo: MagnetStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new MagnetStatsRepository();
  });

  it('returns default stats initially', async () => {
    const stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 0);
    assert.strictEqual(stats.matchesWon, 0);
    assert.strictEqual(stats.highScore, 0);
  });

  it('records match completion and updates career metrics', async () => {
    await repo.recordMatchCompletion(true, 120, 8, 4, 6);
    let stats = await repo.getStats();

    assert.strictEqual(stats.matchesPlayed, 1);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.highScore, 120);
    assert.strictEqual(stats.targetsCollected, 8);
    assert.strictEqual(stats.slingshots, 4);
    assert.strictEqual(stats.repelHits, 6);

    // Second match with lower score
    await repo.recordMatchCompletion(false, 75, 5, 2, 3);
    stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 2);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.highScore, 120); // Kept highest
    assert.strictEqual(stats.targetsCollected, 13);
    assert.strictEqual(stats.slingshots, 6);
    assert.strictEqual(stats.repelHits, 9);
  });
});
