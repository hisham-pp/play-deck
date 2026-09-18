import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import { LocalFlappyStatsRepository } from '../services/flappy-stats-repository';

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

describe('FlappyStatsRepository', () => {
  let repo: LocalFlappyStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new LocalFlappyStatsRepository();
  });

  it('returns default stats when nothing is stored', async () => {
    const stats = await repo.getStats();
    assert.equal(stats.gamesPlayed, 0);
    assert.equal(stats.bestScore, 0);
    assert.equal(stats.totalScore, 0);
    assert.equal(stats.pipesCleared, 0);
  });

  it('records game result, increments totals, and tracks high score', async () => {
    const firstRun = await repo.recordGameResult(12, 12);
    assert.equal(firstRun.gamesPlayed, 1);
    assert.equal(firstRun.bestScore, 12);
    assert.equal(firstRun.totalScore, 12);
    assert.equal(firstRun.pipesCleared, 12);
    assert.ok(firstRun.lastPlayedAt);

    // Second lower run: best score should remain 12
    const secondRun = await repo.recordGameResult(5, 5);
    assert.equal(secondRun.gamesPlayed, 2);
    assert.equal(secondRun.bestScore, 12);
    assert.equal(secondRun.totalScore, 17);
    assert.equal(secondRun.pipesCleared, 17);

    // Third higher run: best score updates to 28
    const thirdRun = await repo.recordGameResult(28, 28);
    assert.equal(thirdRun.gamesPlayed, 3);
    assert.equal(thirdRun.bestScore, 28);
    assert.equal(thirdRun.totalScore, 45);
  });

  it('resets stats back to defaults', async () => {
    await repo.recordGameResult(45, 45);
    const reset = await repo.resetStats();
    assert.equal(reset.gamesPlayed, 0);
    assert.equal(reset.bestScore, 0);
    assert.equal(reset.totalScore, 0);

    const reloaded = await repo.getStats();
    assert.equal(reloaded.bestScore, 0);
  });
});
