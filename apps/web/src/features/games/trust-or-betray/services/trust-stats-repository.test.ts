import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';

import { TrustStatsRepository } from './trust-stats-repository';

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

describe('TrustStatsRepository', () => {
  let repo: TrustStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new TrustStatsRepository();
  });

  it('returns default career stats initially', async () => {
    const stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 0);
    assert.strictEqual(stats.matchesWon, 0);
    assert.strictEqual(stats.highScore, 0);
    assert.strictEqual(stats.totalCooperations, 0);
    assert.strictEqual(stats.totalBetrayals, 0);
    assert.strictEqual(stats.soloSabotages, 0);
    assert.strictEqual(stats.timesExiled, 0);
    assert.strictEqual(stats.successfulAlliances, 0);
  });

  it('records match completion and updates career metrics', async () => {
    await repo.recordMatchCompletion({
      won: true,
      score: 450,
      cooperations: 3,
      betrayals: 1,
      soloSabotages: 1,
      wasExiled: false,
      alliedRounds: 3,
    });

    let stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 1);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.highScore, 450);
    assert.strictEqual(stats.totalCooperations, 3);
    assert.strictEqual(stats.totalBetrayals, 1);
    assert.strictEqual(stats.soloSabotages, 1);
    assert.strictEqual(stats.timesExiled, 0);
    assert.strictEqual(stats.successfulAlliances, 3);

    // Second match with lower score and an exile
    await repo.recordMatchCompletion({
      won: false,
      score: 200,
      cooperations: 2,
      betrayals: 2,
      soloSabotages: 0,
      wasExiled: true,
      alliedRounds: 2,
    });

    stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 2);
    assert.strictEqual(stats.matchesWon, 1);
    assert.strictEqual(stats.highScore, 450); // Kept highest
    assert.strictEqual(stats.totalCooperations, 5);
    assert.strictEqual(stats.totalBetrayals, 3);
    assert.strictEqual(stats.soloSabotages, 1);
    assert.strictEqual(stats.timesExiled, 1);
    assert.strictEqual(stats.successfulAlliances, 5);
  });

  it('resets stats when requested', async () => {
    await repo.recordMatchCompletion({
      won: true,
      score: 300,
      cooperations: 4,
      betrayals: 0,
      soloSabotages: 0,
      wasExiled: false,
      alliedRounds: 4,
    });

    await repo.resetStats();
    const stats = await repo.getStats();
    assert.strictEqual(stats.matchesPlayed, 0);
    assert.strictEqual(stats.highScore, 0);
  });
});
