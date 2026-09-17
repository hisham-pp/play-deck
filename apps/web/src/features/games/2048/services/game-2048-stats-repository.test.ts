import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import { LocalGame2048StatsRepository } from './game-2048-stats-repository';

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

describe('2048StatsRepository', () => {
  let repo: LocalGame2048StatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new LocalGame2048StatsRepository();
  });

  it('returns default stats when nothing is stored', async () => {
    const stats = await repo.getStats();
    assert.equal(stats.gamesPlayed, 0);
    assert.equal(stats.gamesWon, 0);
    assert.equal(stats.bestScore, 0);
    assert.equal(stats.highestTile, 0);
    assert.equal(stats.totalMoves, 0);
  });

  it('records game start', async () => {
    const stats = await repo.recordGameStart();
    assert.equal(stats.gamesPlayed, 1);
    assert.ok(stats.lastPlayedAt);
  });

  it('updates best score when new score is higher', async () => {
    const isHigher1 = await repo.updateBestScore(1024);
    assert.equal(isHigher1, true);
    assert.equal(await repo.getBestScore(), 1024);

    const isHigher2 = await repo.updateBestScore(512);
    assert.equal(isHigher2, false);
    assert.equal(await repo.getBestScore(), 1024);

    const isHigher3 = await repo.updateBestScore(2048);
    assert.equal(isHigher3, true);
    assert.equal(await repo.getBestScore(), 2048);
  });

  it('records game completion with win, moves, and highest tile', async () => {
    await repo.recordGameStart();
    const result = await repo.recordGameEnd(3450, 1024, true, 210);

    assert.equal(result.isNewBestScore, true);
    assert.equal(result.stats.gamesWon, 1);
    assert.equal(result.stats.bestScore, 3450);
    assert.equal(result.stats.highestTile, 1024);
    assert.equal(result.stats.totalMoves, 210);
  });

  it('records game loss and retains existing best score', async () => {
    await repo.recordGameEnd(5000, 2048, true, 300);
    const lossResult = await repo.recordGameEnd(1200, 512, false, 85);

    assert.equal(lossResult.isNewBestScore, false);
    assert.equal(lossResult.stats.gamesWon, 1);
    assert.equal(lossResult.stats.bestScore, 5000);
    assert.equal(lossResult.stats.highestTile, 2048);
    assert.equal(lossResult.stats.totalMoves, 385);
  });
});
