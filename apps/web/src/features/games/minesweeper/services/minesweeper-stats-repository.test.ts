import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import {
  DIFFICULTY_BEGINNER,
  DIFFICULTY_EXPERT,
  DIFFICULTY_INTERMEDIATE,
} from '../engine/minesweeper-constants';
import { LocalMinesweeperStatsRepository } from './minesweeper-stats-repository';

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

describe('MinesweeperStatsRepository', () => {
  let repo: LocalMinesweeperStatsRepository;

  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
    repo = new LocalMinesweeperStatsRepository();
  });

  it('returns default stats when nothing is persisted', async () => {
    const stats = await repo.getStats();
    assert.equal(stats.gamesPlayed, 0);
    assert.equal(stats.gamesWon, 0);
    assert.equal(stats.byDifficulty[DIFFICULTY_BEGINNER].played, 0);
    assert.equal(stats.byDifficulty[DIFFICULTY_BEGINNER].bestTimeMs, null);
  });

  it('increments gamesPlayed when recordStart is called', async () => {
    await repo.recordStart(DIFFICULTY_BEGINNER);
    const stats = await repo.getStats();
    assert.equal(stats.gamesPlayed, 1);
    assert.equal(stats.byDifficulty[DIFFICULTY_BEGINNER].played, 1);
  });

  it('records win and tracks best time', async () => {
    await repo.recordStart(DIFFICULTY_BEGINNER);
    const result1 = await repo.recordCompletion(DIFFICULTY_BEGINNER, 45000);

    assert.equal(result1.isNewBestTime, true);
    assert.equal(result1.stats.gamesWon, 1);
    assert.equal(result1.stats.byDifficulty[DIFFICULTY_BEGINNER].won, 1);
    assert.equal(result1.stats.byDifficulty[DIFFICULTY_BEGINNER].bestTimeMs, 45000);
    assert.equal(result1.stats.byDifficulty[DIFFICULTY_BEGINNER].currentStreak, 1);

    // Slower game does not override best time
    const result2 = await repo.recordCompletion(DIFFICULTY_BEGINNER, 55000);
    assert.equal(result2.isNewBestTime, false);
    assert.equal(result2.stats.byDifficulty[DIFFICULTY_BEGINNER].bestTimeMs, 45000);
    assert.equal(result2.stats.byDifficulty[DIFFICULTY_BEGINNER].currentStreak, 2);

    // Faster game sets new best time
    const result3 = await repo.recordCompletion(DIFFICULTY_BEGINNER, 32000);
    assert.equal(result3.isNewBestTime, true);
    assert.equal(result3.stats.byDifficulty[DIFFICULTY_BEGINNER].bestTimeMs, 32000);
    assert.equal(result3.stats.byDifficulty[DIFFICULTY_BEGINNER].currentStreak, 3);
  });

  it('maintains independent stats across difficulties', async () => {
    await repo.recordCompletion(DIFFICULTY_BEGINNER, 20000);
    await repo.recordCompletion(DIFFICULTY_INTERMEDIATE, 95000);

    const bestBeginner = await repo.getBestTime(DIFFICULTY_BEGINNER);
    const bestInter = await repo.getBestTime(DIFFICULTY_INTERMEDIATE);
    const bestExpert = await repo.getBestTime(DIFFICULTY_EXPERT);

    assert.equal(bestBeginner, 20000);
    assert.equal(bestInter, 95000);
    assert.equal(bestExpert, null);
  });

  it('resets current streak on loss', async () => {
    await repo.recordCompletion(DIFFICULTY_BEGINNER, 25000);
    await repo.recordCompletion(DIFFICULTY_BEGINNER, 24000);

    let stats = await repo.getStats();
    assert.equal(stats.byDifficulty[DIFFICULTY_BEGINNER].currentStreak, 2);

    await repo.recordLoss(DIFFICULTY_BEGINNER);
    stats = await repo.getStats();
    assert.equal(stats.byDifficulty[DIFFICULTY_BEGINNER].currentStreak, 0);
    assert.equal(stats.byDifficulty[DIFFICULTY_BEGINNER].bestStreak, 2);
  });
});
