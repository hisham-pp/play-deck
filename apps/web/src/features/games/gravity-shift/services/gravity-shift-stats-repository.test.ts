import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { StorageAdapter } from '@playdeck/game-types';

import { StorageService } from '@/lib/storage/storage';

import { GravityShiftStatsRepository } from './gravity-shift-stats-repository';

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

describe('GravityShiftStatsRepository', () => {
  let repo: GravityShiftStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new GravityShiftStatsRepository();
  });

  it('returns default stats initially', async () => {
    const stats = await repo.getStats();
    assert.strictEqual(stats.racesCompleted, 0);
    assert.strictEqual(stats.racesWon, 0);
    assert.deepStrictEqual(stats.fastestTimes, {});
  });

  it('records race completion and updates fastest time', async () => {
    await repo.recordRaceCompletion('neon-circuit', 45000, true, 4, 3);
    let stats = await repo.getStats();

    assert.strictEqual(stats.racesCompleted, 1);
    assert.strictEqual(stats.racesWon, 1);
    assert.strictEqual(stats.fastestTimes['neon-circuit'], 45000);
    assert.strictEqual(stats.totalShiftsTriggered, 4);
    assert.strictEqual(stats.totalCheckpointsReached, 3);

    // Record slower race on same course
    await repo.recordRaceCompletion('neon-circuit', 52000, false, 2, 3);
    stats = await repo.getStats();
    assert.strictEqual(stats.racesCompleted, 2);
    assert.strictEqual(stats.racesWon, 1);
    assert.strictEqual(stats.fastestTimes['neon-circuit'], 45000); // Kept the faster time
  });
});
