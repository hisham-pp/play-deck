import type { Achievement, GameCategory, PlayerStats } from '@playdeck/game-types';
import { ACHIEVEMENTS } from '../constants/achievements';

export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  900, // Level 5
  1400, // Level 6
  2000, // Level 7
  2800, // Level 8
  3800, // Level 9
  5000, // Level 10
];

export interface LevelInfo {
  level: number;
  title: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpNeededForNext: number;
  progressPercent: number;
}

export function getRankTitle(level: number): string {
  if (level <= 1) return 'Rookie Contender';
  if (level <= 2) return 'Arcade Novice';
  if (level <= 3) return 'Deck Apprentice';
  if (level <= 4) return 'Tactical Gamer';
  if (level <= 5) return 'Deck Veteran';
  if (level <= 6) return 'Skilled Specialist';
  if (level <= 7) return 'Elite Champion';
  if (level <= 8) return 'Master Strategist';
  if (level <= 9) return 'Grand Challenger';
  return 'Grandmaster of the Deck';
}

export function calculateLevelInfo(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp));

  let level = 1;
  while (level < LEVEL_THRESHOLDS.length && safeXp >= LEVEL_THRESHOLDS[level]) {
    level++;
  }

  // Beyond Level 10
  if (level >= LEVEL_THRESHOLDS.length) {
    const level10Xp = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const surplus = safeXp - level10Xp;
    const additionalLevels = Math.floor(surplus / 1500);
    level = 10 + additionalLevels;
  }

  const prevThreshold =
    level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level - 1] : 5000 + (level - 10) * 1500;
  const nextThreshold =
    level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : prevThreshold + 1500;

  const currentLevelXp = safeXp - prevThreshold;
  const xpNeededForNext = nextThreshold - prevThreshold;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentLevelXp / xpNeededForNext) * 100)),
  );

  return {
    level,
    title: getRankTitle(level),
    totalXp: safeXp,
    currentLevelXp,
    nextLevelXp: nextThreshold,
    xpNeededForNext,
    progressPercent,
  };
}

export function calculateMatchXp(session: { won: boolean; score?: number }): number {
  let xp = 50; // Base match participation XP
  if (session.won) {
    xp += 75; // Win bonus
  }
  if (session.score && session.score > 0) {
    // Score bonus capped at +150 XP
    const scoreBonus = Math.min(150, Math.floor(session.score / 10));
    xp += scoreBonus;
  }
  return xp;
}

export interface ProgressionUpdateResult {
  updatedStats: PlayerStats;
  newlyUnlocked: Achievement[];
  xpGained: number;
  leveledUp: boolean;
  levelInfo: LevelInfo;
}

export function evaluateProgression(
  currentStats: PlayerStats,
  session?: {
    won: boolean;
    category?: GameCategory;
    gameId?: string;
    score?: number;
  },
): ProgressionUpdateResult {
  const previousLevel = currentStats.level ?? 1;
  const previousXp = currentStats.xp ?? 0;
  const previousScore = currentStats.totalScore ?? 0;

  let sessionScore = session?.score ?? 0;
  if (sessionScore < 0) sessionScore = 0;

  const matchXp = session ? calculateMatchXp({ won: session.won, score: sessionScore }) : 0;
  let totalXp = previousXp + matchXp;
  const totalScore = previousScore + sessionScore;

  // Games count & win/loss
  const gamesPlayed = currentStats.gamesPlayed + (session ? 1 : 0);
  const wins = session
    ? session.won
      ? currentStats.wins + 1
      : currentStats.wins
    : currentStats.wins;
  const losses = session
    ? !session.won
      ? currentStats.losses + 1
      : currentStats.losses
    : currentStats.losses;

  // Streak tracking
  const currentStreak = session
    ? session.won
      ? (currentStats.currentStreak ?? 0) + 1
      : 0
    : (currentStats.currentStreak ?? 0);
  const bestStreak = Math.max(currentStats.bestStreak ?? 0, currentStreak);

  // Category plays tracking
  const categoryPlays: Record<string, number> = { ...(currentStats.categoryPlays ?? {}) };
  if (session?.category) {
    categoryPlays[session.category] = (categoryPlays[session.category] ?? 0) + 1;
  }

  // Favorite category calculation
  let favoriteCategory: GameCategory | undefined = currentStats.favoriteCategory;
  if (Object.keys(categoryPlays).length > 0) {
    const topEntry = Object.entries(categoryPlays).sort((a, b) => b[1] - a[1])[0];
    if (topEntry) {
      favoriteCategory = topEntry[0] as GameCategory;
    }
  }

  // Best scores per game tracking
  const bestScores: Record<string, number> = { ...(currentStats.bestScores ?? {}) };
  if (session?.gameId && sessionScore > 0) {
    bestScores[session.gameId] = Math.max(bestScores[session.gameId] ?? 0, sessionScore);
  }

  // Achievements evaluation
  const unlockedAchievements = new Set(currentStats.unlockedAchievements ?? []);
  const achievementsData: Record<string, { unlockedAt: string; progress?: number }> = {
    ...(currentStats.achievementsData ?? {}),
  };
  const newlyUnlocked: Achievement[] = [];

  const nowIso = new Date().toISOString();
  const currentHour = new Date().getHours();

  const tryUnlock = (achievementId: string, currentProgress: number, isMet: boolean) => {
    const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!def) return;

    if (!unlockedAchievements.has(achievementId)) {
      if (isMet) {
        unlockedAchievements.add(achievementId);
        achievementsData[achievementId] = {
          unlockedAt: nowIso,
          progress: def.maxProgress ?? currentProgress,
        };
        newlyUnlocked.push({
          ...def,
          unlockedAt: nowIso,
          progress: def.maxProgress ?? currentProgress,
        });
        totalXp += def.xpReward;
      } else {
        achievementsData[achievementId] = {
          unlockedAt: '',
          progress: currentProgress,
        };
      }
    }
  };

  // 1. first_win
  tryUnlock('first_win', wins, wins >= 1);

  // 2. game_explorer (at least 3 categories played)
  const uniqueCategoriesCount = Object.keys(categoryPlays).length;
  tryUnlock('game_explorer', uniqueCategoriesCount, uniqueCategoriesCount >= 3);

  // 3. arcade_enthusiast
  const arcadeCount = categoryPlays['arcade'] ?? 0;
  tryUnlock('arcade_enthusiast', arcadeCount, arcadeCount >= 10);

  // 4. puzzle_prodigy
  const puzzleCount = categoryPlays['puzzle'] ?? 0;
  tryUnlock('puzzle_prodigy', puzzleCount, puzzleCount >= 5);

  // 5. strategic_mind
  const strategyCount = (categoryPlays['strategy'] ?? 0) + (categoryPlays['board'] ?? 0);
  tryUnlock('strategic_mind', strategyCount, strategyCount >= 5);

  // 6. card_sharp
  const cardCount = categoryPlays['card'] ?? 0;
  tryUnlock('card_sharp', cardCount, cardCount >= 5);

  // 7. high_roller
  const maxRecordedScore = Math.max(0, ...Object.values(bestScores), sessionScore);
  tryUnlock('high_roller', maxRecordedScore, maxRecordedScore >= 1000);

  // 8. hot_streak
  tryUnlock('hot_streak', bestStreak, bestStreak >= 3);

  // 9. century_club
  tryUnlock('century_club', gamesPlayed, gamesPlayed >= 100);

  // Calculate final level info after achievement bonus XP
  const levelInfo = calculateLevelInfo(totalXp);

  // 10. deck_veteran (level >= 5)
  tryUnlock('deck_veteran', levelInfo.level, levelInfo.level >= 5);

  // 11. night_owl (played between 10 PM and 4 AM)
  const isNight = currentHour >= 22 || currentHour < 4;
  if (session && isNight) {
    tryUnlock('night_owl', 1, true);
  }

  const finalLevelInfo = calculateLevelInfo(totalXp);
  const leveledUp = finalLevelInfo.level > previousLevel;

  const updatedStats: PlayerStats = {
    gamesPlayed,
    wins,
    losses,
    favoriteCategory,
    totalScore,
    xp: totalXp,
    level: finalLevelInfo.level,
    title: finalLevelInfo.title,
    currentStreak,
    bestStreak,
    bestScores,
    categoryPlays,
    unlockedAchievements: Array.from(unlockedAchievements),
    achievementsData,
  };

  return {
    updatedStats,
    newlyUnlocked,
    xpGained: totalXp - previousXp,
    leveledUp,
    levelInfo: finalLevelInfo,
  };
}
