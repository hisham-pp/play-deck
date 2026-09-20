import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import { LootStatsRepository } from './loot-stats-repository';

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

describe('LootStatsRepository', () => {
  let repo: LootStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new LootStatsRepository();
  });

  it('returns default career stats initially', async () => {
    const stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 0);
    assert.strictEqual(stats.matchesWon, 0);
    assert.strictEqual(stats.highScore, 0);
    assert.strictEqual(stats.coinsCollected, 0);
    assert.strictEqual(stats.gemsCollected, 0);
    assert.strictEqual(stats.trapsTriggered, 0);
    assert.strictEqual(stats.stealsCount, 0);
    assert.strictEqual(stats.powerUpsUsed, 0);
  });

  it('records match completion and updates metrics', async () => {
    // won, score, coins, gems, traps, steals, powerups
    await repo.recordMatchCompletion(true, 350, 15, 6, 2, 4, 3);
    let stats = await repo.getStats();

    assert.strictEqual(stats.matchesPlayed, 1);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.highScore, 350);
    assert.strictEqual(stats.coinsCollected, 15);
    assert.strictEqual(stats.gemsCollected, 6);
    assert.strictEqual(stats.trapsTriggered, 2);
    assert.strictEqual(stats.stealsCount, 4);
    assert.strictEqual(stats.powerUpsUsed, 3);

    // Second match with lower score
    await repo.recordMatchCompletion(false, 180, 8, 2, 1, 1, 1);
    stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 2);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.highScore, 350);
    assert.strictEqual(stats.coinsCollected, 23);
    assert.strictEqual(stats.gemsCollected, 8);
    assert.strictEqual(stats.trapsTriggered, 3);
    assert.strictEqual(stats.stealsCount, 5);
  });
});
