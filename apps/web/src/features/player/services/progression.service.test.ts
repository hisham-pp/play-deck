import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PlayerStats } from '@playdeck/game-types';
import {
  calculateLevelInfo,
  calculateMatchXp,
  evaluateProgression,
  getRankTitle,
} from './progression.service';

describe('Player Progression Service', () => {
  it('calculates correct level, rank title, and progress percentage from XP', () => {
    // 0 XP -> Level 1
    const lvl1 = calculateLevelInfo(0);
    assert.equal(lvl1.level, 1);
    assert.equal(lvl1.title, 'Rookie Contender');
    assert.equal(getRankTitle(1), 'Rookie Contender');
    assert.equal(lvl1.progressPercent, 0);

    // 150 XP -> Level 2 (100-250 range)
    const lvl2 = calculateLevelInfo(150);
    assert.equal(lvl2.level, 2);
    assert.equal(lvl2.title, 'Arcade Novice');
    assert.equal(lvl2.currentLevelXp, 50); // 150 - 100
    assert.equal(lvl2.xpNeededForNext, 150); // 250 - 100
    assert.equal(lvl2.progressPercent, 33);

    // 900 XP -> Level 5 (Deck Veteran)
    const lvl5 = calculateLevelInfo(900);
    assert.equal(lvl5.level, 5);
    assert.equal(lvl5.title, 'Deck Veteran');

    // 6500 XP -> Level 11 (> 10)
    const lvl11 = calculateLevelInfo(6500);
    assert.equal(lvl11.level, 11);
    assert.equal(lvl11.title, 'Grandmaster of the Deck');
  });

  it('calculates match XP based on outcome and game score', () => {
    // Defeat, 0 score
    const lossXp = calculateMatchXp({ won: false, score: 0 });
    assert.equal(lossXp, 50);

    // Win, 0 score
    const winXp = calculateMatchXp({ won: true, score: 0 });
    assert.equal(winXp, 125); // 50 + 75

    // Win, 500 score -> 50 + 75 + 50 = 175
    const scoreXp = calculateMatchXp({ won: true, score: 500 });
    assert.equal(scoreXp, 175);

    // Win, massive 5000 score -> capped at +150 score bonus -> 50 + 75 + 150 = 275
    const maxScoreXp = calculateMatchXp({ won: true, score: 5000 });
    assert.equal(maxScoreXp, 275);
  });

  it('unlocks first_win achievement upon claiming first victory and awards achievement bonus XP', () => {
    const initialStats: PlayerStats = {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
    };

    const result = evaluateProgression(initialStats, {
      won: true,
      category: 'arcade',
      gameId: 'snake',
      score: 120,
    });

    assert.equal(result.updatedStats.gamesPlayed, 1);
    assert.equal(result.updatedStats.wins, 1);
    assert.equal(result.updatedStats.bestScores?.['snake'], 120);

    // Should unlock 'first_win' (+100 XP)
    const unlockedIds = result.newlyUnlocked.map((a) => a.id);
    assert.ok(unlockedIds.includes('first_win'));
    assert.ok(result.updatedStats.unlockedAchievements?.includes('first_win'));

    // Total XP should include match XP (50 + 75 + 12 = 137) + achievement XP (100) = 237 XP
    assert.equal(result.updatedStats.xp, 237);
  });

  it('tracks winning streaks and unlocks hot_streak upon 3 consecutive wins', () => {
    let stats: PlayerStats = {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
    };

    // Win 1
    let res = evaluateProgression(stats, { won: true, gameId: 'pong' });
    stats = res.updatedStats;
    assert.equal(stats.currentStreak, 1);

    // Win 2
    res = evaluateProgression(stats, { won: true, gameId: 'pong' });
    stats = res.updatedStats;
    assert.equal(stats.currentStreak, 2);

    // Win 3 -> hot_streak unlocks!
    res = evaluateProgression(stats, { won: true, gameId: 'pong' });
    stats = res.updatedStats;
    assert.equal(stats.currentStreak, 3);
    assert.ok(stats.unlockedAchievements?.includes('hot_streak'));

    // Loss resets current streak
    res = evaluateProgression(stats, { won: false, gameId: 'pong' });
    stats = res.updatedStats;
    assert.equal(stats.currentStreak, 0);
    assert.equal(stats.bestStreak, 3); // best streak preserved!
  });

  it('tracks category diversity and unlocks game_explorer upon playing 3 distinct categories', () => {
    let stats: PlayerStats = {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
    };

    // 1. Arcade
    let res = evaluateProgression(stats, { won: false, category: 'arcade' });
    stats = res.updatedStats;

    // 2. Puzzle
    res = evaluateProgression(stats, { won: false, category: 'puzzle' });
    stats = res.updatedStats;

    // 3. Strategy -> unlocks game_explorer!
    res = evaluateProgression(stats, { won: false, category: 'strategy' });
    stats = res.updatedStats;

    assert.ok(stats.unlockedAchievements?.includes('game_explorer'));
  });

  it('tracks high scores per game and unlocks high_roller for score >= 1000', () => {
    const stats: PlayerStats = {
      gamesPlayed: 2,
      wins: 1,
      losses: 1,
      bestScores: { tetris: 450 },
    };

    const res = evaluateProgression(stats, {
      won: true,
      gameId: 'tetris',
      score: 1250,
      category: 'arcade',
    });

    assert.equal(res.updatedStats.bestScores?.['tetris'], 1250);
    assert.ok(res.updatedStats.unlockedAchievements?.includes('high_roller'));
  });
});
