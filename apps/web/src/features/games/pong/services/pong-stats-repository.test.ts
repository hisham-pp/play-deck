import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import { LocalPongStatsRepository } from './pong-stats-repository';

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

describe('PongStatsRepository', () => {
  let repo: LocalPongStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new LocalPongStatsRepository();
  });

  it('returns default stats when nothing is stored', async () => {
    const stats = await repo.getStats();
    assert.equal(stats.gamesPlayed, 0);
    assert.equal(stats.gamesWon, 0);
    assert.equal(stats.gamesLost, 0);
    assert.equal(stats.highestRally, 0);
    assert.equal(stats.totalPointsScored, 0);
    assert.equal(stats.vsAiWins.medium, 0);
  });

  it('records win vs AI on medium difficulty', async () => {
    const stats = await repo.recordGameResult(true, true, 'medium', 7, 14);
    assert.equal(stats.gamesPlayed, 1);
    assert.equal(stats.gamesWon, 1);
    assert.equal(stats.gamesLost, 0);
    assert.equal(stats.highestRally, 14);
    assert.equal(stats.totalPointsScored, 7);
    assert.equal(stats.vsAiWins.medium, 1);
    assert.ok(stats.lastPlayedAt);
  });

  it('records loss and updates highest rally only when larger', async () => {
    await repo.recordGameResult(true, true, 'easy', 7, 10);
    const updated = await repo.recordGameResult(false, true, 'hard', 4, 8);

    assert.equal(updated.gamesPlayed, 2);
    assert.equal(updated.gamesWon, 1);
    assert.equal(updated.gamesLost, 1);
    assert.equal(updated.highestRally, 10); // preserved higher previous rally
    assert.equal(updated.totalPointsScored, 11);
  });

  it('resets stats back to defaults', async () => {
    await repo.recordGameResult(true, true, 'medium', 7, 15);
    const reset = await repo.resetStats();

    assert.equal(reset.gamesPlayed, 0);
    assert.equal(reset.highestRally, 0);
    assert.equal(reset.vsAiWins.medium, 0);
  });
});
