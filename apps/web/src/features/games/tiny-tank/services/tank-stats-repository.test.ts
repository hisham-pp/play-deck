import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import { TankStatsRepository } from './tank-stats-repository';

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

describe('TankStatsRepository', () => {
  let repo: TankStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new TankStatsRepository();
  });

  it('returns default stats initially', async () => {
    const stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 0);
    assert.strictEqual(stats.matchesWon, 0);
    assert.strictEqual(stats.kills, 0);
    assert.strictEqual(stats.highScore, 0);
  });

  it('records match completion and updates career metrics', async () => {
    // won, score, kills, damageDealt, shotsFired, shotsHit, cratesCollected
    await repo.recordMatchCompletion(true, 300, 3, 240, 10, 8, 2);
    let stats = await repo.getStats();

    assert.strictEqual(stats.matchesPlayed, 1);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.highScore, 300);
    assert.strictEqual(stats.kills, 3);
    assert.strictEqual(stats.damageDealt, 240);
    assert.strictEqual(stats.shotsFired, 10);
    assert.strictEqual(stats.shotsHit, 8);
    assert.strictEqual(stats.cratesCollected, 2);

    // Second match with lower score
    await repo.recordMatchCompletion(false, 150, 1, 90, 8, 4, 1);
    stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 2);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.highScore, 300); // Retained high score
    assert.strictEqual(stats.kills, 4);
    assert.strictEqual(stats.damageDealt, 330);
    assert.strictEqual(stats.cratesCollected, 3);
  });
});
