import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

export const RANK_TITLES: Record<number, string> = {
  1: 'Greenhorn Scaler',
  2: 'Crag Hiker',
  3: 'Cliff Strider',
  4: 'Peak Nomad',
  5: 'Titan Challenger',
  6: 'Summit Legend',
  7: 'Sky Apex',
  8: 'Mountain Overlord',
  9: 'Ascendant Master',
  10: 'Celestial Conqueror',
};

export interface PlayerStats {
  level: number;
  totalXp: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  title: string;
  maxHealth: number;
  attackBonus: number;
  defenseArmor: number;
  climbSpeed: number;
}

export function calculatePlayerLevel(totalXp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  title: string;
} {
  const safeXp = Math.max(0, totalXp);
  let level = 1;

  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (safeXp >= XP_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelBaseXp = XP_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXp = XP_THRESHOLDS[level] ?? currentLevelBaseXp + 1000;
  const xpIntoLevel = safeXp - currentLevelBaseXp;
  const levelSpan = nextLevelXp - currentLevelBaseXp;
  const progressPercent = Math.min(100, Math.round((xpIntoLevel / levelSpan) * 100));
  const title = RANK_TITLES[level] ?? `Ascendant Tier ${level}`;

  return {
    level,
    currentXp: xpIntoLevel,
    nextLevelXp: levelSpan,
    progressPercent,
    title,
  };
}

export function calculateStatsForLevel(totalXp: number): PlayerStats {
  const levelInfo = calculatePlayerLevel(totalXp);
  const lvl = levelInfo.level;

  // Base stats: 100 HP, 0 Bonus ATK, 0 DEF Armor, 1.0 Speed
  // Growth per level: +15 HP, +3 ATK, +2 DEF, +0.05 Speed
  const maxHealth = 100 + (lvl - 1) * 15;
  const attackBonus = (lvl - 1) * 3;
  const defenseArmor = (lvl - 1) * 2;
  const climbSpeed = Math.round((1.0 + (lvl - 1) * 0.05) * 100) / 100;

  return {
    ...levelInfo,
    totalXp,
    maxHealth,
    attackBonus,
    defenseArmor,
    climbSpeed,
  };
}

export interface LevelUpEvent {
  didLevelUp: boolean;
  previousLevel: number;
  newLevel: number;
  stats: PlayerStats;
  hpRestored: number;
  bonusAtk: number;
  bonusDef: number;
}

export function evaluateXpGain(currentTotalXp: number, gainedXp: number): LevelUpEvent {
  const prevLevel = calculatePlayerLevel(currentTotalXp).level;
  const newTotalXp = currentTotalXp + gainedXp;
  const newStats = calculateStatsForLevel(newTotalXp);
  const didLevelUp = newStats.level > prevLevel;

  return {
    didLevelUp,
    previousLevel: prevLevel,
    newLevel: newStats.level,
    stats: newStats,
    hpRestored: didLevelUp ? newStats.maxHealth : 0,
    bonusAtk: (newStats.level - prevLevel) * 3,
    bonusDef: (newStats.level - prevLevel) * 2,
  };
}

export interface ClimberAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const CLIMBER_ACHIEVEMENTS: Record<string, ClimberAchievement> = {
  first_ascent: {
    id: 'first_ascent',
    title: 'First Ascent',
    description: 'Conquer Level 1: Verdant Foothills.',
    icon: 'Mountain',
  },
  shield_smasher: {
    id: 'shield_smasher',
    title: 'Shield Smasher',
    description: 'Shatter an armored enemy guard using Cleave.',
    icon: 'ShieldAlert',
  },
  arsenal_ready: {
    id: 'arsenal_ready',
    title: 'Armed & Ready',
    description: 'Store 3 or more distinct weapons in your loadout.',
    icon: 'Swords',
  },
  summit_conqueror: {
    id: 'summit_conqueror',
    title: 'Summit Slayer',
    description: 'Defeat Summit Titan Gorgoroth and clear Level 5.',
    icon: 'Crown',
  },
  excalibur_wielder: {
    id: 'excalibur_wielder',
    title: 'Chosen of Light',
    description: 'Claim Excalibur, Blade of Light.',
    icon: 'Sparkles',
  },
  level_five: {
    id: 'level_five',
    title: 'Peak Champion',
    description: 'Reach Player Level 5 in climbing proficiency.',
    icon: 'Award',
  },
};

export interface PersistentClimberProfile {
  totalXp: number;
  unlockedLevels: number[];
  bestScores: Record<number, number>;
  storedWeapons: string[];
  equippedWeaponId: string;
  achievements: Record<string, { unlockedAt: string }>;
  lastSaved: string;
}

export const INITIAL_CLIMBER_PROFILE: PersistentClimberProfile = {
  totalXp: 0,
  unlockedLevels: [1],
  bestScores: {},
  storedWeapons: ['wooden-sword'],
  equippedWeaponId: 'wooden-sword',
  achievements: {},
  lastSaved: new Date().toISOString(),
};

export async function saveClimberProfile(profile: PersistentClimberProfile): Promise<void> {
  try {
    const updated = {
      ...profile,
      lastSaved: new Date().toISOString(),
    };
    await StorageService.set(STORAGE_KEYS.gameSave('stickman-climber'), updated);
  } catch (err) {
    console.error('Failed to persist climber profile:', err);
  }
}

export async function loadClimberProfile(): Promise<PersistentClimberProfile> {
  try {
    const saved = await StorageService.get<PersistentClimberProfile>(
      STORAGE_KEYS.gameSave('stickman-climber'),
    );
    if (saved) {
      return {
        ...INITIAL_CLIMBER_PROFILE,
        ...saved,
      };
    }
  } catch (err) {
    console.warn('Could not load persistent climber profile, using defaults:', err);
  }
  return INITIAL_CLIMBER_PROFILE;
}
