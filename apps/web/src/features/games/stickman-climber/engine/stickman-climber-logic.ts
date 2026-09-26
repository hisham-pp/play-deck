import {
  FIRST_FIVE_LEVELS,
  type LevelConfig,
  calculateLevelStars,
  getLevelConfig,
  isLevelUnlocked,
} from './levels';

export const ENEMY_TEMPLATES = {
  1: { name: 'Rookie Scout', hp: 18, rewardXp: 18, rewardCoins: 4 },
  2: { name: 'Dust Fang', hp: 28, rewardXp: 28, rewardCoins: 6 },
  3: { name: 'Stone Brute', hp: 38, rewardXp: 36, rewardCoins: 8 },
  4: { name: 'Ash Warden', hp: 52, rewardXp: 48, rewardCoins: 12 },
  5: { name: 'Summit Titan', hp: 72, rewardXp: 60, rewardCoins: 15 },
} as const;

export const WEAPON_DAMAGE: Record<string, number> = {
  'Wooden Sword': 12,
  'Iron Blade': 18,
  Katana: 24,
  'Shadow Dagger': 32,
  'Titan Slayer Greatsword': 45,
};

export interface LevelCompletionRecord {
  stars: number;
  bestScore: number;
  completedAt: string;
}

export interface PlayerClimberProgress {
  unlockedLevels: number[];
  completedLevels: Record<number, LevelCompletionRecord>;
  totalStars: number;
}

export const INITIAL_CLIMBER_PROGRESS: PlayerClimberProgress = {
  unlockedLevels: [1],
  completedLevels: {},
  totalStars: 0,
};

export function createEnemyWave(level: number) {
  const safeLevel = Math.min(Math.max(1, level), 5);
  const enemy = ENEMY_TEMPLATES[safeLevel as keyof typeof ENEMY_TEMPLATES];
  const levelConfig = getLevelConfig(safeLevel);

  return {
    level: safeLevel,
    config: levelConfig,
    enemy: {
      ...enemy,
      name: levelConfig.isBossLevel && levelConfig.bossName ? levelConfig.bossName : enemy.name,
    },
  };
}

export function resolveCombat({
  weapon,
  level,
  health,
  xp,
  coins,
  enemyHp,
}: {
  weapon: keyof typeof WEAPON_DAMAGE | string;
  level: number;
  health: number;
  xp: number;
  coins: number;
  enemyHp: number;
}) {
  const safeLevel = Math.min(Math.max(1, level), 5);
  const wave = createEnemyWave(safeLevel);
  const damage = WEAPON_DAMAGE[weapon] ?? 10;
  const remainingEnemyHp = Math.max(0, enemyHp - damage);
  const remainingHealth = Math.max(0, health - Math.max(2, Math.ceil(wave.enemy.hp / 8)));
  const gainedXp = Math.max(0, wave.enemy.rewardXp + Math.floor((damage - 10) / 2));
  const gainedCoins = Math.max(0, wave.enemy.rewardCoins + Math.max(0, damage - 10));

  return {
    level: safeLevel,
    weapon,
    damage,
    health: remainingHealth,
    xp: xp + gainedXp,
    coins: coins + gainedCoins,
    enemyHp: remainingEnemyHp,
    defeated: remainingEnemyHp === 0,
  };
}

export interface LevelCompleteResult {
  levelId: number;
  stars: number;
  earnedXp: number;
  earnedCoins: number;
  unlockedWeapon?: string;
  nextLevelUnlocked?: number;
  progress: PlayerClimberProgress;
}

export function completeLevel(
  levelId: number,
  healthPercent: number,
  score: number,
  progress: PlayerClimberProgress = INITIAL_CLIMBER_PROGRESS,
): LevelCompleteResult {
  const config = getLevelConfig(levelId);
  const stars = calculateLevelStars(healthPercent);

  const existingRecord = progress.completedLevels[levelId];
  const bestScore = Math.max(existingRecord?.bestScore ?? 0, score);
  const bestStars = Math.max(existingRecord?.stars ?? 0, stars);

  const updatedCompleted: Record<number, LevelCompletionRecord> = {
    ...progress.completedLevels,
    [levelId]: {
      stars: bestStars,
      bestScore,
      completedAt: new Date().toISOString(),
    },
  };

  const unlockedLevelsSet = new Set(progress.unlockedLevels);
  let nextLevelUnlocked: number | undefined;

  if (levelId < 5) {
    const nextLevel = levelId + 1;
    if (!unlockedLevelsSet.has(nextLevel)) {
      unlockedLevelsSet.add(nextLevel);
      nextLevelUnlocked = nextLevel;
    }
  }

  const updatedUnlocked = Array.from(unlockedLevelsSet).sort((a, b) => a - b);
  const totalStars = Object.values(updatedCompleted).reduce((sum, item) => sum + item.stars, 0);

  const updatedProgress: PlayerClimberProgress = {
    unlockedLevels: updatedUnlocked,
    completedLevels: updatedCompleted,
    totalStars,
  };

  return {
    levelId,
    stars,
    earnedXp: config.rewardXp,
    earnedCoins: config.rewardCoins,
    unlockedWeapon: config.rewardWeapon,
    nextLevelUnlocked,
    progress: updatedProgress,
  };
}

export { FIRST_FIVE_LEVELS, calculateLevelStars, getLevelConfig, isLevelUnlocked };
export type { LevelConfig };
