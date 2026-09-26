export type LevelTheme = 'forest' | 'ruins' | 'castle' | 'tower' | 'summit';

export type LevelFeature =
  'ladders' | 'platforms' | 'bridges' | 'moving_platforms' | 'traps' | 'secrets';

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  theme: LevelTheme;
  heightMeters: number;
  enemyCount: number;
  isBossLevel: boolean;
  bossName?: string;
  features: LevelFeature[];
  rewardXp: number;
  rewardCoins: number;
  rewardWeapon?: string;
  requiredLevelId?: number;
  layout: {
    platformCount: number;
    hazardCount: number;
    checkpointInterval: number;
  };
}

export const FIRST_FIVE_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Verdant Foothills',
    subtitle: 'The Ascent Begins',
    theme: 'forest',
    heightMeters: 120,
    enemyCount: 3,
    isBossLevel: false,
    features: ['platforms', 'ladders'],
    rewardXp: 120,
    rewardCoins: 15,
    rewardWeapon: 'Wooden Sword',
    layout: {
      platformCount: 12,
      hazardCount: 2,
      checkpointInterval: 60,
    },
  },
  {
    id: 2,
    name: 'Crumbling Ruins',
    subtitle: 'Ancient Traps & Crumbling Stone',
    theme: 'ruins',
    heightMeters: 280,
    enemyCount: 5,
    isBossLevel: false,
    features: ['platforms', 'bridges', 'traps'],
    rewardXp: 280,
    rewardCoins: 30,
    rewardWeapon: 'Iron Blade',
    requiredLevelId: 1,
    layout: {
      platformCount: 20,
      hazardCount: 6,
      checkpointInterval: 90,
    },
  },
  {
    id: 3,
    name: 'Iron Ramparts',
    subtitle: 'Guarded Fortress Walls',
    theme: 'castle',
    heightMeters: 480,
    enemyCount: 7,
    isBossLevel: false,
    features: ['platforms', 'moving_platforms', 'traps', 'ladders'],
    rewardXp: 480,
    rewardCoins: 50,
    rewardWeapon: 'Katana',
    requiredLevelId: 2,
    layout: {
      platformCount: 28,
      hazardCount: 10,
      checkpointInterval: 120,
    },
  },
  {
    id: 4,
    name: 'Obsidian Spire',
    subtitle: 'Gauntlet of Shadows',
    theme: 'tower',
    heightMeters: 750,
    enemyCount: 9,
    isBossLevel: false,
    features: ['moving_platforms', 'traps', 'secrets', 'bridges'],
    rewardXp: 750,
    rewardCoins: 80,
    rewardWeapon: 'Shadow Dagger',
    requiredLevelId: 3,
    layout: {
      platformCount: 36,
      hazardCount: 14,
      checkpointInterval: 150,
    },
  },
  {
    id: 5,
    name: 'Summit of the Titan',
    subtitle: 'Apex Guardian Showdown',
    theme: 'summit',
    heightMeters: 1000,
    enemyCount: 12,
    isBossLevel: true,
    bossName: 'Summit Titan Gorgoroth',
    features: ['platforms', 'moving_platforms', 'traps', 'secrets'],
    rewardXp: 1200,
    rewardCoins: 150,
    rewardWeapon: 'Titan Slayer Greatsword',
    requiredLevelId: 4,
    layout: {
      platformCount: 45,
      hazardCount: 20,
      checkpointInterval: 200,
    },
  },
];

export function getLevelConfig(levelId: number): LevelConfig {
  const found = FIRST_FIVE_LEVELS.find((l) => l.id === levelId);
  return found ?? FIRST_FIVE_LEVELS[0];
}

export function isLevelUnlocked(levelId: number, unlockedLevels: number[]): boolean {
  if (levelId === 1) return true;
  return unlockedLevels.includes(levelId);
}

export function calculateLevelStars(remainingHpPercent: number): number {
  if (remainingHpPercent >= 80) return 3;
  if (remainingHpPercent >= 40) return 2;
  return 1;
}
