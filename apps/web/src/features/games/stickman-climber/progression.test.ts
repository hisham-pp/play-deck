import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import {
  CLIMBER_ACHIEVEMENTS,
  INITIAL_CLIMBER_PROFILE,
  calculatePlayerLevel,
  calculateStatsForLevel,
  evaluateXpGain,
  loadClimberProfile,
  saveClimberProfile,
} from './engine/progression';

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

describe('Stickman Climber — Progression, XP, Leveling & Stats (#130)', () => {
  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
  });
  it('calculates player levels and rank titles accurately across XP thresholds', () => {
    // Level 1: 0 to 99 XP
    const lvl1 = calculatePlayerLevel(0);
    assert.equal(lvl1.level, 1);
    assert.equal(lvl1.title, 'Greenhorn Scaler');
    assert.equal(lvl1.progressPercent, 0);

    const lvl1Mid = calculatePlayerLevel(50);
    assert.equal(lvl1Mid.level, 1);
    assert.equal(lvl1Mid.progressPercent, 50);

    // Level 2: 100 XP
    const lvl2 = calculatePlayerLevel(100);
    assert.equal(lvl2.level, 2);
    assert.equal(lvl2.title, 'Crag Hiker');

    // Level 3: 250 XP
    const lvl3 = calculatePlayerLevel(250);
    assert.equal(lvl3.level, 3);
    assert.equal(lvl3.title, 'Cliff Strider');

    // Level 4: 450 XP
    const lvl4 = calculatePlayerLevel(450);
    assert.equal(lvl4.level, 4);
    assert.equal(lvl4.title, 'Peak Nomad');

    // Level 5: 700 XP
    const lvl5 = calculatePlayerLevel(700);
    assert.equal(lvl5.level, 5);
    assert.equal(lvl5.title, 'Titan Challenger');
  });

  it('scales player combat stats according to proficiency level', () => {
    // Level 1 base stats
    const stats1 = calculateStatsForLevel(0);
    assert.equal(stats1.maxHealth, 100);
    assert.equal(stats1.attackBonus, 0);
    assert.equal(stats1.defenseArmor, 0);
    assert.equal(stats1.climbSpeed, 1.0);

    // Level 3 stats (250 XP) -> +30 HP, +6 ATK, +4 DEF
    const stats3 = calculateStatsForLevel(250);
    assert.equal(stats3.maxHealth, 130);
    assert.equal(stats3.attackBonus, 6);
    assert.equal(stats3.defenseArmor, 4);
    assert.equal(stats3.climbSpeed, 1.1);

    // Level 5 stats (700 XP) -> +60 HP, +12 ATK, +8 DEF
    const stats5 = calculateStatsForLevel(700);
    assert.equal(stats5.maxHealth, 160);
    assert.equal(stats5.attackBonus, 12);
    assert.equal(stats5.defenseArmor, 8);
    assert.equal(stats5.climbSpeed, 1.2);
  });

  it('evaluates XP gains and triggers level up event with full health restoration', () => {
    // Gaining 40 XP at 20 XP (stays at Level 1)
    const result1 = evaluateXpGain(20, 40);
    assert.equal(result1.didLevelUp, false);
    assert.equal(result1.newLevel, 1);
    assert.equal(result1.hpRestored, 0);

    // Gaining 60 XP at 80 XP (reaches 140 XP -> crosses 100 threshold into Level 2)
    const result2 = evaluateXpGain(80, 60);
    assert.equal(result2.didLevelUp, true);
    assert.equal(result2.previousLevel, 1);
    assert.equal(result2.newLevel, 2);
    assert.equal(result2.bonusAtk, 3);
    assert.equal(result2.bonusDef, 2);
    assert.equal(result2.hpRestored, 115); // full heal to new maxHealth (115 HP)
  });

  it('contains comprehensive climber achievements roster', () => {
    const requiredAchievements = [
      'first_ascent',
      'shield_smasher',
      'arsenal_ready',
      'summit_conqueror',
      'excalibur_wielder',
      'level_five',
    ];

    for (const key of requiredAchievements) {
      const ach = CLIMBER_ACHIEVEMENTS[key];
      assert.ok(ach, `Expected achievement ${key}`);
      assert.ok(ach.title.length > 0);
      assert.ok(ach.description.length > 0);
      assert.ok(ach.icon.length > 0);
    }
  });

  it('persists and retrieves climber profile via StorageService', async () => {
    const customProfile = {
      ...INITIAL_CLIMBER_PROFILE,
      totalXp: 450,
      unlockedLevels: [1, 2, 3, 4],
      bestScores: { 1: 1200, 2: 2400 },
      storedWeapons: ['wooden-sword', 'katana', 'battle-axe'],
      equippedWeaponId: 'katana',
      achievements: {
        first_ascent: { unlockedAt: new Date().toISOString() },
      },
    };

    await saveClimberProfile(customProfile);
    const loaded = await loadClimberProfile();

    assert.equal(loaded.totalXp, 450);
    assert.deepEqual(loaded.unlockedLevels, [1, 2, 3, 4]);
    assert.equal(loaded.equippedWeaponId, 'katana');
    assert.ok(loaded.achievements.first_ascent);
  });
});
