import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FIRST_FIVE_LEVELS,
  calculateLevelStars,
  completeLevel,
  createEnemyWave,
  getLevelConfig,
  isLevelUnlocked,
  resolveCombat,
} from './engine/stickman-climber-logic';

describe('Stickman Climber combat engine', () => {
  it('creates a threat-appropriate enemy wave for the selected level', () => {
    const wave = createEnemyWave(3);

    assert.equal(wave.level, 3);
    assert.ok(wave.enemy.name.length > 0);
    assert.ok(wave.enemy.hp > 0);
    assert.ok(wave.enemy.rewardXp > 0);
    assert.ok(wave.enemy.rewardCoins > 0);
  });

  it('applies weapon damage and rewards progression without going below zero', () => {
    const result = resolveCombat({
      weapon: 'Wooden Sword',
      level: 2,
      health: 32,
      xp: 180,
      coins: 10,
      enemyHp: 25,
    });

    assert.ok(result.health >= 0);
    assert.ok(result.xp >= 180);
    assert.ok(result.coins >= 10);
    assert.ok(result.defeated || result.health < 32);
  });
});

describe('Stickman Climber — First Five Levels & Map Progression (#127)', () => {
  it('defines 5 progressive levels with escalating heights, rewards, and themes', () => {
    assert.equal(FIRST_FIVE_LEVELS.length, 5);

    FIRST_FIVE_LEVELS.forEach((level, idx) => {
      assert.equal(level.id, idx + 1);
      assert.ok(level.name.length > 0);
      assert.ok(level.heightMeters > 0);
      assert.ok(level.enemyCount > 0);
      assert.ok(level.rewardXp > 0);
      assert.ok(level.rewardCoins > 0);
      assert.ok(level.features.length > 0);

      // Heights should strictly increase
      if (idx > 0) {
        assert.ok(level.heightMeters > FIRST_FIVE_LEVELS[idx - 1].heightMeters);
        assert.ok(level.rewardXp > FIRST_FIVE_LEVELS[idx - 1].rewardXp);
      }
    });

    // Level 5 is the final Boss Arena
    const level5 = getLevelConfig(5);
    assert.equal(level5.isBossLevel, true);
    assert.equal(level5.bossName, 'Summit Titan Gorgoroth');
    assert.equal(level5.theme, 'summit');
  });

  it('evaluates level unlocking rules correctly', () => {
    // Level 1 is always unlocked
    assert.equal(isLevelUnlocked(1, [1]), true);
    assert.equal(isLevelUnlocked(1, []), true);

    // Level 2 locked until unlockedLevels includes 2
    assert.equal(isLevelUnlocked(2, [1]), false);
    assert.equal(isLevelUnlocked(2, [1, 2]), true);
    assert.equal(isLevelUnlocked(3, [1, 2]), false);
  });

  it('calculates star ratings based on health percentage', () => {
    assert.equal(calculateLevelStars(100), 3);
    assert.equal(calculateLevelStars(85), 3);
    assert.equal(calculateLevelStars(79), 2);
    assert.equal(calculateLevelStars(40), 2);
    assert.equal(calculateLevelStars(39), 1);
    assert.equal(calculateLevelStars(10), 1);
  });

  it('completes a level, awards rewards, unlocks next level, and tallies stars', () => {
    const resultLvl1 = completeLevel(1, 90, 1500, {
      unlockedLevels: [1],
      completedLevels: {},
      totalStars: 0,
    });

    assert.equal(resultLvl1.levelId, 1);
    assert.equal(resultLvl1.stars, 3);
    assert.equal(resultLvl1.earnedCoins, 15);
    assert.equal(resultLvl1.earnedXp, 120);
    assert.equal(resultLvl1.nextLevelUnlocked, 2);
    assert.deepEqual(resultLvl1.progress.unlockedLevels, [1, 2]);
    assert.equal(resultLvl1.progress.totalStars, 3);

    // Completing level 2 with updated progress
    const resultLvl2 = completeLevel(2, 60, 2400, resultLvl1.progress);
    assert.equal(resultLvl2.levelId, 2);
    assert.equal(resultLvl2.stars, 2);
    assert.equal(resultLvl2.nextLevelUnlocked, 3);
    assert.deepEqual(resultLvl2.progress.unlockedLevels, [1, 2, 3]);
    assert.equal(resultLvl2.progress.totalStars, 5); // 3 + 2
  });
});
