import { type ItemDrop, type Weapon, generateDrops, getWeapon } from './equipment';
import {
  FIRST_FIVE_LEVELS,
  type LevelConfig,
  calculateLevelStars,
  getLevelConfig,
  isLevelUnlocked,
} from './levels';

export const ENEMY_TEMPLATES = {
  1: { name: 'Rookie Scout', hp: 18, rewardXp: 18, rewardCoins: 4, type: 'scout' as const },
  2: { name: 'Dust Fang', hp: 28, rewardXp: 28, rewardCoins: 6, type: 'scout' as const },
  3: { name: 'Stone Brute', hp: 38, rewardXp: 36, rewardCoins: 8, type: 'brute' as const },
  4: { name: 'Ash Warden', hp: 52, rewardXp: 48, rewardCoins: 12, type: 'brute' as const },
  5: { name: 'Summit Titan', hp: 72, rewardXp: 60, rewardCoins: 15, type: 'boss' as const },
} as const;

export const WEAPON_DAMAGE: Record<string, number> = {
  'Wooden Sword': 12,
  'Iron Blade': 18,
  Katana: 24,
  'Shadow Dagger': 32,
  'Titan Slayer Greatsword': 58,
  // Equipment catalog mappings
  'wooden-sword': 12,
  'iron-sword': 18,
  'double-sword': 28,
  'battle-axe': 36,
  'war-spear': 30,
  'hunter-bow': 42,
  'thunder-hammer': 52,
  'titan-slayer': 58,
  'legendary-sword': 75,
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

export interface CombatResolutionInput {
  weapon: keyof typeof WEAPON_DAMAGE | string;
  level: number;
  health: number;
  xp: number;
  coins: number;
  enemyHp: number;
  armorShield?: number;
  rng?: () => number;
}

export interface CombatResolutionResult {
  level: number;
  weapon: string;
  weaponModel: Weapon;
  damage: number;
  health: number;
  armorShield: number;
  xp: number;
  coins: number;
  enemyHp: number;
  defeated: boolean;
  abilityProc?: {
    name: string;
    description: string;
    bonusDamage: number;
    canceledCounter: boolean;
  };
  drops: ItemDrop[];
}

export function resolveCombat({
  weapon: weaponIdOrName,
  level,
  health,
  xp,
  coins,
  enemyHp,
  armorShield = 0,
  rng = Math.random,
}: CombatResolutionInput): CombatResolutionResult {
  const safeLevel = Math.min(Math.max(1, level), 5);
  const wave = createEnemyWave(safeLevel);
  const weaponModel = getWeapon(weaponIdOrName);

  // Base damage from weapon model or damage table
  const baseDamage = weaponModel.damage ?? WEAPON_DAMAGE[weaponIdOrName] ?? 12;
  let bonusDamage = 0;
  let cancelsCounter = false;
  let abilityProc:
    | {
        name: string;
        description: string;
        bonusDamage: number;
        canceledCounter: boolean;
      }
    | undefined;

  // Evaluate weapon special ability proc
  if (weaponModel.specialAbility && rng() < weaponModel.specialAbility.procChance) {
    const ability = weaponModel.specialAbility;
    if (ability.multiplier) {
      bonusDamage += Math.round(baseDamage * (ability.multiplier - 1));
    }
    if (ability.bonusDamage) {
      bonusDamage += ability.bonusDamage;
    }
    if (ability.cancelsCounterAttack) {
      cancelsCounter = true;
    }
    if (ability.healAmount) {
      health = Math.min(100, health + ability.healAmount);
    }
    abilityProc = {
      name: ability.name,
      description: ability.description,
      bonusDamage,
      canceledCounter: cancelsCounter,
    };
  }

  const totalDamage = baseDamage + bonusDamage;
  const remainingEnemyHp = Math.max(0, enemyHp - totalDamage);
  const isDefeated = remainingEnemyHp === 0;

  // Counter-attack damage calculation
  let remainingHealth = health;
  let remainingShield = armorShield;

  if (!isDefeated && !cancelsCounter) {
    const rawIncomingDamage = Math.max(2, Math.ceil(wave.enemy.hp / 8));
    if (remainingShield > 0) {
      const absorbed = Math.min(remainingShield, rawIncomingDamage);
      remainingShield -= absorbed;
      const unabsorbed = rawIncomingDamage - absorbed;
      remainingHealth = Math.max(0, remainingHealth - unabsorbed);
    } else {
      remainingHealth = Math.max(0, remainingHealth - rawIncomingDamage);
    }
  }

  const gainedXp = Math.max(0, wave.enemy.rewardXp + Math.floor((totalDamage - 10) / 2));
  const gainedCoins = Math.max(0, wave.enemy.rewardCoins + Math.max(0, totalDamage - 10));

  // Generate loot drops if defeated
  let drops: ItemDrop[] = [];
  if (isDefeated) {
    const dropSource = safeLevel === 5 ? 'boss' : wave.enemy.type === 'brute' ? 'brute' : 'scout';
    drops = generateDrops(dropSource, safeLevel, rng);
  }

  return {
    level: safeLevel,
    weapon: weaponModel.name,
    weaponModel,
    damage: totalDamage,
    health: remainingHealth,
    armorShield: remainingShield,
    xp: xp + gainedXp,
    coins: coins + gainedCoins,
    enemyHp: remainingEnemyHp,
    defeated: isDefeated,
    abilityProc,
    drops,
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
