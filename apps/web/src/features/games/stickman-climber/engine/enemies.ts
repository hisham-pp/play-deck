export type EnemyArchetype =
  'basic' | 'fast' | 'shield' | 'archer' | 'heavy' | 'ninja' | 'elite' | 'boss';

export type AIState =
  | 'idle'
  | 'patrol'
  | 'telegraphing'
  | 'attacking'
  | 'blocking'
  | 'staggered'
  | 'enraged'
  | 'defeated';

export interface BossPhase {
  phase: number;
  name: string;
  thresholdHpPercent: number; // e.g. 60 for 60% HP
  ability: string;
  damageMultiplier: number;
  description: string;
}

export interface EnemySpecialAttack {
  id: string;
  name: string;
  damage: number;
  telegraphMs: number;
  description: string;
  canBeFlanked: boolean;
  canBeInterrupted: boolean;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  archetype: EnemyArchetype;
  maxHp: number;
  damage: number;
  attackSpeed: number; // 1.0 baseline
  aggression: number; // 0.1 to 1.0
  shieldHp?: number; // Absorbs frontal attacks for shield enemies
  specialAttack?: EnemySpecialAttack;
  bossPhases?: BossPhase[];
  rewardXp: number;
  rewardCoins: number;
  flavorText: string;
  themeColor: string;
}

export const ENEMY_ROSTER: Record<string, EnemyDefinition> = {
  'basic-scout': {
    id: 'basic-scout',
    name: 'Mountain Scout',
    archetype: 'basic',
    maxHp: 24,
    damage: 8,
    attackSpeed: 1.0,
    aggression: 0.5,
    rewardXp: 20,
    rewardCoins: 8,
    flavorText: 'Lightly armed hill patrol scouting the lower slopes.',
    themeColor: 'text-amber-400',
  },
  'fast-stalker': {
    id: 'fast-stalker',
    name: 'Cliffstalker Fang',
    archetype: 'fast',
    maxHp: 22,
    damage: 12,
    attackSpeed: 1.6,
    aggression: 0.85,
    specialAttack: {
      id: 'quick-lunge',
      name: 'Pounce Lunge',
      damage: 15,
      telegraphMs: 800,
      description: 'Dashes forward with high velocity claws.',
      canBeFlanked: true,
      canBeInterrupted: true,
    },
    rewardXp: 28,
    rewardCoins: 12,
    flavorText: 'Agile predator that leaps across narrow ledges at blinding speed.',
    themeColor: 'text-emerald-400',
  },
  'shield-bearer': {
    id: 'shield-bearer',
    name: 'Iron Shield Bearer',
    archetype: 'shield',
    maxHp: 38,
    shieldHp: 25,
    damage: 10,
    attackSpeed: 0.8,
    aggression: 0.4,
    specialAttack: {
      id: 'shield-bash',
      name: 'Fortified Shield Bash',
      damage: 14,
      telegraphMs: 1200,
      description: 'Hunkers behind iron wall and rams forward.',
      canBeFlanked: true,
      canBeInterrupted: false,
    },
    rewardXp: 38,
    rewardCoins: 16,
    flavorText: 'Heavily armored sentry immune to simple front slashes until guard is broken.',
    themeColor: 'text-sky-400',
  },
  'peak-archer': {
    id: 'peak-archer',
    name: 'Ridge Deadeye',
    archetype: 'archer',
    maxHp: 26,
    damage: 18,
    attackSpeed: 0.9,
    aggression: 0.6,
    specialAttack: {
      id: 'snipe-shot',
      name: 'Piercing Arrow',
      damage: 22,
      telegraphMs: 1400,
      description: 'Draws a charged compound bow aimed directly at the climber.',
      canBeFlanked: true,
      canBeInterrupted: true,
    },
    rewardXp: 35,
    rewardCoins: 15,
    flavorText: 'Keeps high perch and picks off ascending climbers with barbed arrows.',
    themeColor: 'text-indigo-400',
  },
  'stone-crusher': {
    id: 'stone-crusher',
    name: 'Granite Brute',
    archetype: 'heavy',
    maxHp: 65,
    damage: 24,
    attackSpeed: 0.6,
    aggression: 0.65,
    specialAttack: {
      id: 'ground-slam',
      name: 'Seismic Slam',
      damage: 32,
      telegraphMs: 1600,
      description: 'Lifts a massive boulder to crush the climber.',
      canBeFlanked: true,
      canBeInterrupted: false,
    },
    rewardXp: 50,
    rewardCoins: 22,
    flavorText: 'Colossal mountain dweller with skin hardened like solid granite.',
    themeColor: 'text-orange-400',
  },
  'shadow-ninja': {
    id: 'shadow-ninja',
    name: 'Shadow Infiltrator',
    archetype: 'ninja',
    maxHp: 34,
    damage: 20,
    attackSpeed: 1.45,
    aggression: 0.8,
    specialAttack: {
      id: 'smoke-backstab',
      name: 'Smoke Vanish & Backstab',
      damage: 26,
      telegraphMs: 1000,
      description: 'Vanishes in black smoke to strike from the climber’s blind spot.',
      canBeFlanked: false,
      canBeInterrupted: true,
    },
    rewardXp: 45,
    rewardCoins: 20,
    flavorText: 'An elusive assassin who blends into rock crevices and strikes without warning.',
    themeColor: 'text-purple-400',
  },
  'ash-warden': {
    id: 'ash-warden',
    name: 'Ash Warden Captain',
    archetype: 'elite',
    maxHp: 80,
    shieldHp: 20,
    damage: 22,
    attackSpeed: 1.1,
    aggression: 0.75,
    specialAttack: {
      id: 'ash-whirlwind',
      name: 'Ashstorm Cleave',
      damage: 28,
      telegraphMs: 1300,
      description: 'Spins a two-handed halberd engulfing the platform in embers.',
      canBeFlanked: true,
      canBeInterrupted: true,
    },
    rewardXp: 75,
    rewardCoins: 35,
    flavorText: 'Veteran champion guarding the obsidian spire against would-be summit conquerors.',
    themeColor: 'text-rose-400',
  },
  'titan-gorgoroth': {
    id: 'titan-gorgoroth',
    name: 'Summit Titan Gorgoroth',
    archetype: 'boss',
    maxHp: 160,
    damage: 30,
    attackSpeed: 0.85,
    aggression: 0.9,
    bossPhases: [
      {
        phase: 1,
        name: 'Phase 1: Colossus Awakening',
        thresholdHpPercent: 100,
        ability: 'Tremor Slam',
        damageMultiplier: 1.0,
        description: 'Titan strikes with methodical seismic punches and rock volleys.',
      },
      {
        phase: 2,
        name: 'Phase 2: Magma Rage',
        thresholdHpPercent: 60,
        ability: 'Molten Eruption',
        damageMultiplier: 1.35,
        description:
          'Cracks appear along the Titan’s obsidian core, igniting magma strikes (+35% DMG).',
      },
      {
        phase: 3,
        name: 'Phase 3: Mountain Shatterer',
        thresholdHpPercent: 30,
        ability: 'Cataclysmic Apocalypse',
        damageMultiplier: 1.75,
        description:
          'Enraged berserk fury; attacks become relentless and cannot be blocked (+75% DMG).',
      },
    ],
    specialAttack: {
      id: 'titan-crush',
      name: 'Cataclysmic Fist',
      damage: 42,
      telegraphMs: 1800,
      description: 'Brings down a boulder-sized fist shaking the entire summit peak.',
      canBeFlanked: true,
      canBeInterrupted: false,
    },
    rewardXp: 200,
    rewardCoins: 100,
    flavorText: 'Ancient titan forged in the mountain core. The ultimate trial of the climber.',
    themeColor: 'text-amber-500',
  },
};

export interface ActiveEnemyState {
  definition: EnemyDefinition;
  currentHp: number;
  currentShieldHp: number;
  aiState: AIState;
  currentPhase: number;
  isTelegraphing: boolean;
  telegraphProgress: number; // 0 to 100
  knockbackOffset: number; // visual offset in px for hit reactions
  isStaggered: boolean;
}

export function createActiveEnemy(enemyIdOrLevel: string | number): ActiveEnemyState {
  let enemyDef: EnemyDefinition;

  if (typeof enemyIdOrLevel === 'number') {
    switch (enemyIdOrLevel) {
      case 1:
        enemyDef = ENEMY_ROSTER['basic-scout'];
        break;
      case 2:
        enemyDef = ENEMY_ROSTER['fast-stalker'];
        break;
      case 3:
        enemyDef = ENEMY_ROSTER['shield-bearer'];
        break;
      case 4:
        enemyDef = ENEMY_ROSTER['ash-warden'];
        break;
      case 5:
        enemyDef = ENEMY_ROSTER['titan-gorgoroth'];
        break;
      default:
        enemyDef = ENEMY_ROSTER['basic-scout'];
        break;
    }
  } else {
    enemyDef = ENEMY_ROSTER[enemyIdOrLevel] ?? ENEMY_ROSTER['basic-scout'];
  }

  return {
    definition: enemyDef,
    currentHp: enemyDef.maxHp,
    currentShieldHp: enemyDef.shieldHp ?? 0,
    aiState: 'patrol',
    currentPhase: 1,
    isTelegraphing: false,
    telegraphProgress: 0,
    knockbackOffset: 0,
    isStaggered: false,
  };
}

export function getBossPhase(boss: EnemyDefinition, currentHp: number): BossPhase {
  if (!boss.bossPhases || boss.bossPhases.length === 0) {
    return {
      phase: 1,
      name: 'Normal Phase',
      thresholdHpPercent: 100,
      ability: 'Standard Strike',
      damageMultiplier: 1.0,
      description: 'Standard combat state.',
    };
  }

  const hpPercent = (currentHp / boss.maxHp) * 100;
  // Sort ascending by threshold to match the lowest applicable phase
  const matching = [...boss.bossPhases]
    .sort((a, b) => a.thresholdHpPercent - b.thresholdHpPercent)
    .find((p) => hpPercent <= p.thresholdHpPercent);

  return matching ?? boss.bossPhases[0];
}

export type PlayerCombatAction = 'strike' | 'flank' | 'cleave' | 'parry';

export interface CombatTurnResult {
  enemyState: ActiveEnemyState;
  playerHealthDelta: number;
  playerDamageDealt: number;
  actionMessage: string;
  shieldBroken: boolean;
  phaseAdvanced?: BossPhase;
  enemyDefeated: boolean;
}

export function processCombatTurn({
  playerAction,
  playerWeaponDamage,
  weaponType,
  enemyState,
  rng = Math.random,
}: {
  playerAction: PlayerCombatAction;
  playerWeaponDamage: number;
  weaponType?: string;
  enemyState: ActiveEnemyState;
  rng?: () => number;
}): CombatTurnResult {
  let hp = enemyState.currentHp;
  let shield = enemyState.currentShieldHp;
  let nextState: AIState = enemyState.aiState;
  let damageDealt: number;
  let incomingDamage = 0;
  let actionMessage: string;
  let shieldBroken = false;
  let phaseAdvanced: BossPhase | undefined;

  const def = enemyState.definition;
  const isBoss = def.archetype === 'boss';

  // Current boss phase
  const currentPhase = isBoss ? getBossPhase(def, hp) : null;
  const bossDamageMult = currentPhase ? currentPhase.damageMultiplier : 1.0;

  switch (playerAction) {
    case 'flank': {
      // Flanking bypasses shield and dodges telegraphed special attacks!
      const flankDamage = Math.round(playerWeaponDamage * 1.15);
      hp = Math.max(0, hp - flankDamage);
      damageDealt = flankDamage;
      nextState = 'staggered';

      if (enemyState.isTelegraphing) {
        actionMessage = `Flanked behind ${def.name}! Dodged telegraphed ${def.specialAttack?.name ?? 'strike'}!`;
      } else {
        actionMessage = `Flanked blind spot for ${flankDamage} critical damage!`;
      }
      // Flanking avoids incoming counter-attack
      incomingDamage = 0;
      break;
    }

    case 'cleave': {
      // Heavy cleave smashes through shields!
      const cleaveDamage = Math.round(playerWeaponDamage * 1.25);
      if (shield > 0) {
        const shieldDamage = Math.min(shield, cleaveDamage);
        shield -= shieldDamage;
        const remainder = cleaveDamage - shieldDamage;
        hp = Math.max(0, hp - remainder);
        damageDealt = cleaveDamage;
        if (shield === 0) {
          shieldBroken = true;
          nextState = 'staggered';
          actionMessage = `SHIELD BROKEN! Shattered guard and dealt ${remainder} HP damage!`;
        } else {
          actionMessage = `Crushed shield for ${shieldDamage} DMG (${shield} shield remaining)!`;
        }
      } else {
        hp = Math.max(0, hp - cleaveDamage);
        damageDealt = cleaveDamage;
        actionMessage = `Heavy cleave smashed ${def.name} for ${cleaveDamage} DMG!`;
      }

      // Slight counter-attack
      if (hp > 0 && nextState !== 'staggered') {
        incomingDamage = Math.round(def.damage * 0.7 * bossDamageMult);
      }
      break;
    }

    case 'parry': {
      // Counter-parry deflects incoming attack and stuns enemy
      if (enemyState.isTelegraphing || rng() < 0.6) {
        const counterDamage = Math.round(playerWeaponDamage * 1.5);
        hp = Math.max(0, hp - counterDamage);
        damageDealt = counterDamage;
        nextState = 'staggered';
        incomingDamage = 0;
        actionMessage = `PERFECT PARRY! Counter-struck for ${counterDamage} DMG!`;
      } else {
        // Missed parry
        damageDealt = 0;
        incomingDamage = Math.round(def.damage * 0.5 * bossDamageMult);
        actionMessage = `Parry mistimed; deflected partial blow.`;
      }
      break;
    }

    case 'strike':
    default: {
      // Standard strike: if shield active and not an axe/hammer, shield absorbs
      const isHeavyWeapon = weaponType === 'axe' || weaponType === 'hammer';
      if (shield > 0 && !isHeavyWeapon) {
        shield = Math.max(0, shield - playerWeaponDamage);
        damageDealt = playerWeaponDamage;
        if (shield === 0) {
          shieldBroken = true;
          actionMessage = `Shield depleted! Enemy guard is now broken.`;
        } else {
          actionMessage = `Blocked by shield! Absorbed ${playerWeaponDamage} DMG (${shield} left).`;
        }
      } else {
        hp = Math.max(0, hp - playerWeaponDamage);
        damageDealt = playerWeaponDamage;
        actionMessage = `Struck ${def.name} for ${playerWeaponDamage} damage!`;
      }

      // Incoming attack from enemy
      if (hp > 0) {
        // Check if enemy was telegraphing special attack
        if (enemyState.isTelegraphing && def.specialAttack) {
          incomingDamage = Math.round(def.specialAttack.damage * bossDamageMult);
          actionMessage += ` Hit by ${def.specialAttack.name} (-${incomingDamage} HP)!`;
        } else {
          incomingDamage = Math.round(def.damage * bossDamageMult);
        }
      }
      break;
    }
  }

  // Check boss phase transition
  if (isBoss && hp > 0) {
    const newPhase = getBossPhase(def, hp);
    if (currentPhase && newPhase.phase > currentPhase.phase) {
      phaseAdvanced = newPhase;
      nextState = 'enraged';
      actionMessage = `WARNING: ${def.name} entered ${newPhase.name}! ${newPhase.description}`;
    }
  }

  // Enemy state transition after turn
  const isDefeated = hp === 0;
  if (isDefeated) {
    nextState = 'defeated';
    actionMessage = `VICTORY! Defeated ${def.name}!`;
  } else if (nextState !== 'staggered' && nextState !== 'enraged') {
    // Determine next AI state: chance to telegraph special attack
    const shouldTelegraph =
      Boolean(def.specialAttack) && rng() < (def.aggression > 0.7 ? 0.45 : 0.25);
    nextState = shouldTelegraph ? 'telegraphing' : shield > 0 ? 'blocking' : 'attacking';
  }

  const updatedEnemy: ActiveEnemyState = {
    ...enemyState,
    currentHp: hp,
    currentShieldHp: shield,
    aiState: nextState,
    currentPhase: phaseAdvanced ? phaseAdvanced.phase : enemyState.currentPhase,
    isTelegraphing: nextState === 'telegraphing',
    telegraphProgress: nextState === 'telegraphing' ? 50 : 0,
    knockbackOffset: damageDealt > 0 ? 12 : 0,
    isStaggered: nextState === 'staggered',
  };

  return {
    enemyState: updatedEnemy,
    playerHealthDelta: incomingDamage === 0 ? 0 : -incomingDamage,
    playerDamageDealt: damageDealt,
    actionMessage,
    shieldBroken,
    phaseAdvanced,
    enemyDefeated: isDefeated,
  };
}
