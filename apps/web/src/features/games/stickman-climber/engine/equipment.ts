export type WeaponRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type WeaponType =
  | 'sword'
  | 'katana'
  | 'dual_blades'
  | 'axe'
  | 'spear'
  | 'bow'
  | 'hammer'
  | 'greatsword'
  | 'legendary';

export interface WeaponSpecialAbility {
  id: string;
  name: string;
  description: string;
  procChance: number; // e.g. 0.25 (25%)
  multiplier?: number; // e.g. 1.5x damage
  bonusDamage?: number; // e.g. +6 bleed damage
  cancelsCounterAttack?: boolean; // e.g. stun
  healAmount?: number; // e.g. holy smite heal
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rarity: WeaponRarity;
  damage: number;
  attackSpeed: number; // 1.0 = baseline, 1.4 = rapid, 0.7 = heavy
  range: number; // in pixels / reach units
  specialAbility: WeaponSpecialAbility;
  flavorText: string;
  icon: string;
}

export const WEAPON_CATALOG: Record<string, Weapon> = {
  'wooden-sword': {
    id: 'wooden-sword',
    name: 'Wooden Sword',
    type: 'sword',
    rarity: 'common',
    damage: 12,
    attackSpeed: 1.0,
    range: 50,
    specialAbility: {
      id: 'splinter-strike',
      name: 'Splinter Strike',
      description: '10% chance to cause splinter damage (+3 bonus damage)',
      procChance: 0.1,
      bonusDamage: 3,
    },
    flavorText: 'Carved from sturdy pine. Light and dependable for a novice mountaineer.',
    icon: 'Sword',
  },
  'iron-sword': {
    id: 'iron-sword',
    name: 'Iron Sword',
    type: 'sword',
    rarity: 'common',
    damage: 18,
    attackSpeed: 1.05,
    range: 55,
    specialAbility: {
      id: 'tempered-edge',
      name: 'Tempered Edge',
      description: '15% chance to land a clean precision cut with 1.25x damage',
      procChance: 0.15,
      multiplier: 1.25,
    },
    flavorText: 'Forged from valley bog iron, balanced for quick thrusts and parries.',
    icon: 'Sword',
  },
  katana: {
    id: 'katana',
    name: 'Shadow Katana',
    type: 'katana',
    rarity: 'uncommon',
    damage: 24,
    attackSpeed: 1.35,
    range: 60,
    specialAbility: {
      id: 'swift-bleed',
      name: 'Swift Bleed',
      description: '25% chance to inflict bleed lacerations for +8 extra damage',
      procChance: 0.25,
      bonusDamage: 8,
    },
    flavorText: 'A folded steel blade that slices the air like whisperwind.',
    icon: 'Zap',
  },
  'double-sword': {
    id: 'double-sword',
    name: 'Dual Blades',
    type: 'dual_blades',
    rarity: 'rare',
    damage: 28,
    attackSpeed: 1.6,
    range: 45,
    specialAbility: {
      id: 'twin-flurry',
      name: 'Twin Flurry',
      description: '30% chance to execute a rapid second strike dealing 1.4x total damage',
      procChance: 0.3,
      multiplier: 1.4,
    },
    flavorText: 'Twin crescent daggers that overwhelm single targets in a blur of steel.',
    icon: 'Swords',
  },
  'battle-axe': {
    id: 'battle-axe',
    name: 'Executioner Axe',
    type: 'axe',
    rarity: 'rare',
    damage: 36,
    attackSpeed: 0.8,
    range: 65,
    specialAbility: {
      id: 'heavy-cleave',
      name: 'Heavy Cleave',
      description: '35% chance to crush foe armor for 1.45x devastating impact',
      procChance: 0.35,
      multiplier: 1.45,
    },
    flavorText: 'Weighted beard head designed to shatter stone shields and iron hides.',
    icon: 'Axe',
  },
  'war-spear': {
    id: 'war-spear',
    name: 'Vanguard Spear',
    type: 'spear',
    rarity: 'rare',
    damage: 30,
    attackSpeed: 1.1,
    range: 95,
    specialAbility: {
      id: 'piercing-reach',
      name: 'Piercing Reach',
      description:
        'Keeps hostiles at bay; 25% chance to counter-parry and reduce taken damage by 50%',
      procChance: 0.25,
      bonusDamage: 6,
    },
    flavorText:
      'Long ash shaft tipped with barbed steel, perfect for keeping beasts at arm’s length.',
    icon: 'Crosshair',
  },
  'hunter-bow': {
    id: 'hunter-bow',
    name: 'Ranger Longbow',
    type: 'bow',
    rarity: 'epic',
    damage: 42,
    attackSpeed: 1.15,
    range: 150,
    specialAbility: {
      id: 'snipe-crit',
      name: 'Snipe Critical',
      description: '25% chance to loose a piercing arrow dealing 1.75x critical strike',
      procChance: 0.25,
      multiplier: 1.75,
    },
    flavorText: 'Yew wood composite reinforced with wyvern sinew. Strikes before the enemy reacts.',
    icon: 'Target',
  },
  'thunder-hammer': {
    id: 'thunder-hammer',
    name: 'Thunder Hammer',
    type: 'hammer',
    rarity: 'epic',
    damage: 52,
    attackSpeed: 0.65,
    range: 70,
    specialAbility: {
      id: 'stun-shockwave',
      name: 'Stun Shockwave',
      description: '35% chance to stun enemy and completely cancel their counter-attack',
      procChance: 0.35,
      cancelsCounterAttack: true,
    },
    flavorText: 'Heavy basalt hammer pulsing with dormant electrostatic discharge.',
    icon: 'Hammer',
  },
  'titan-slayer': {
    id: 'titan-slayer',
    name: 'Titan Slayer Greatsword',
    type: 'greatsword',
    rarity: 'epic',
    damage: 58,
    attackSpeed: 0.75,
    range: 80,
    specialAbility: {
      id: 'titan-bane',
      name: 'Titan Bane',
      description: '30% chance to execute a titan-cleaving blow dealing +20 bonus damage',
      procChance: 0.3,
      bonusDamage: 20,
    },
    flavorText:
      'Massive obsidian two-hander wielded only by those who conquer the highest summits.',
    icon: 'Shield',
  },
  'legendary-sword': {
    id: 'legendary-sword',
    name: 'Excalibur, Blade of Light',
    type: 'legendary',
    rarity: 'legendary',
    damage: 75,
    attackSpeed: 1.4,
    range: 85,
    specialAbility: {
      id: 'celestial-smite',
      name: 'Celestial Smite',
      description: '40% chance to call down radiant smite: 2.0x damage and restores 15 HP',
      procChance: 0.4,
      multiplier: 2.0,
      healAmount: 15,
    },
    flavorText: 'Ancient relic forged in starlight. The pinnacle of climb and combat prowess.',
    icon: 'Sparkles',
  },
};

export const RARITY_CONFIG: Record<
  WeaponRarity,
  { label: string; color: string; border: string; bg: string; badge: string }
> = {
  common: {
    label: 'Common',
    color: 'text-slate-300',
    border: 'border-slate-600',
    bg: 'bg-slate-800/60',
    badge: 'bg-slate-700 text-slate-200 border-slate-600',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-emerald-400',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-950/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  rare: {
    label: 'Rare',
    color: 'text-sky-400',
    border: 'border-sky-500/50',
    bg: 'bg-sky-950/40',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-400',
    border: 'border-purple-500/50',
    bg: 'bg-purple-950/40',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-amber-400',
    border: 'border-amber-500/60',
    bg: 'bg-amber-950/40',
    badge: 'bg-amber-500/25 text-amber-300 border-amber-500/50',
  },
};

export type ItemType =
  'coin' | 'health_potion' | 'xp_crystal' | 'armor_piece' | 'dungeon_key' | 'chest_reward';

export interface ItemDrop {
  id: string;
  type: ItemType;
  name: string;
  amount?: number;
  healAmount?: number;
  shieldAmount?: number;
  xpAmount?: number;
  weaponPayload?: Weapon;
  description: string;
  icon: string;
  rarity?: WeaponRarity;
}

export type DropSource = 'scout' | 'brute' | 'elite' | 'boss' | 'chest' | 'hidden_cache';

export interface PlayerInventory {
  equippedWeaponId: string;
  storedWeapons: string[]; // up to 4 quick-swap backpack slots
  armorShield: number; // absorbs incoming combat counter-attacks
  keys: number;
}

export const INITIAL_INVENTORY: PlayerInventory = {
  equippedWeaponId: 'wooden-sword',
  storedWeapons: ['wooden-sword'],
  armorShield: 0,
  keys: 1,
};

export function getWeapon(idOrName: string): Weapon {
  // Check exact id
  if (WEAPON_CATALOG[idOrName]) {
    return WEAPON_CATALOG[idOrName];
  }
  const lower = idOrName.toLowerCase();
  // Check lowercase id
  if (WEAPON_CATALOG[lower]) {
    return WEAPON_CATALOG[lower];
  }
  // Check by name or id match
  const found = Object.values(WEAPON_CATALOG).find(
    (w) =>
      w.name.toLowerCase() === lower ||
      w.id.toLowerCase() === lower ||
      w.name.toLowerCase().includes(lower) ||
      lower.includes(w.id.toLowerCase()),
  );
  if (found) return found;

  return WEAPON_CATALOG['wooden-sword'];
}

export function equipWeapon(inventory: PlayerInventory, weaponId: string): PlayerInventory {
  const weapon = getWeapon(weaponId);
  const storedSet = new Set(inventory.storedWeapons);
  storedSet.add(weapon.id);

  // Keep up to 5 stored weapons max
  const storedList = Array.from(storedSet).slice(-5);

  return {
    ...inventory,
    equippedWeaponId: weapon.id,
    storedWeapons: storedList,
  };
}

export function storeWeapon(inventory: PlayerInventory, weaponId: string): PlayerInventory {
  const weapon = getWeapon(weaponId);
  if (inventory.storedWeapons.includes(weapon.id)) {
    return inventory;
  }
  return {
    ...inventory,
    storedWeapons: [...inventory.storedWeapons, weapon.id].slice(-5),
  };
}

export interface WeaponComparison {
  damageDiff: number;
  speedDiff: number;
  rangeDiff: number;
  isUpgrade: boolean;
}

export function compareWeapons(current: Weapon, candidate: Weapon): WeaponComparison {
  const damageDiff = candidate.damage - current.damage;
  const speedDiff = Math.round((candidate.attackSpeed - current.attackSpeed) * 100) / 100;
  const rangeDiff = candidate.range - current.range;

  // Composite power rating: Damage * AttackSpeed
  const currentDps = current.damage * current.attackSpeed;
  const candidateDps = candidate.damage * candidate.attackSpeed;
  const isUpgrade = candidateDps > currentDps || damageDiff > 0;

  return {
    damageDiff,
    speedDiff,
    rangeDiff,
    isUpgrade,
  };
}

export function generateDrops(
  source: DropSource,
  level: number,
  rng: () => number = Math.random,
): ItemDrop[] {
  const drops: ItemDrop[] = [];
  const safeLevel = Math.max(1, Math.min(5, level));

  switch (source) {
    case 'scout': {
      // Coins: 5-15
      const coinCount = Math.floor(rng() * 11) + 5;
      drops.push({
        id: `drop-coin-${Date.now()}-${rng()}`,
        type: 'coin',
        name: `${coinCount} Gold Coins`,
        amount: coinCount,
        description: 'Currency collected from defeated scout.',
        icon: 'Coins',
      });

      // 30% chance for small health potion
      if (rng() < 0.3) {
        drops.push({
          id: `drop-potion-${Date.now()}-${rng()}`,
          type: 'health_potion',
          name: 'Minor Health Potion',
          healAmount: 20,
          description: 'Restores 20 Health Points.',
          icon: 'Heart',
          rarity: 'common',
        });
      }

      // 15% chance for weapon drop (Iron Sword or Katana)
      if (rng() < 0.15) {
        const weaponId = rng() < 0.6 ? 'iron-sword' : 'katana';
        const weapon = getWeapon(weaponId);
        drops.push({
          id: `drop-weapon-${Date.now()}-${rng()}`,
          type: 'chest_reward',
          name: weapon.name,
          weaponPayload: weapon,
          description: `Acquired ${weapon.name}!`,
          icon: 'Swords',
          rarity: weapon.rarity,
        });
      }
      break;
    }

    case 'brute': {
      // Coins: 15-30
      const coinCount = Math.floor(rng() * 16) + 15;
      drops.push({
        id: `drop-coin-${Date.now()}-${rng()}`,
        type: 'coin',
        name: `${coinCount} Gold Coins`,
        amount: coinCount,
        description: 'Spoils of victory over an armored brute.',
        icon: 'Coins',
      });

      // 50% chance for Armor Piece
      if (rng() < 0.5) {
        drops.push({
          id: `drop-armor-${Date.now()}-${rng()}`,
          type: 'armor_piece',
          name: 'Reinforced Pauldron',
          shieldAmount: 25,
          description: 'Adds +25 armor shield against enemy strikes.',
          icon: 'Shield',
          rarity: 'uncommon',
        });
      }

      // 35% chance for Rare Weapon (Double Sword, Battle Axe, Spear)
      if (rng() < 0.35) {
        const weaponChoices = ['double-sword', 'battle-axe', 'war-spear'];
        const chosen = weaponChoices[Math.floor(rng() * weaponChoices.length)];
        const weapon = getWeapon(chosen);
        drops.push({
          id: `drop-weapon-${Date.now()}-${rng()}`,
          type: 'chest_reward',
          name: weapon.name,
          weaponPayload: weapon,
          description: `Acquired ${weapon.name}!`,
          icon: 'Swords',
          rarity: weapon.rarity,
        });
      }
      break;
    }

    case 'chest':
    case 'hidden_cache': {
      // Chest contains rich bounty
      const coins = Math.floor(rng() * 30) + 30;
      drops.push({
        id: `drop-coin-${Date.now()}-${rng()}`,
        type: 'coin',
        name: `${coins} Stashed Gold`,
        amount: coins,
        description: 'Gold discovered in hidden climber cache.',
        icon: 'Coins',
      });

      drops.push({
        id: `drop-potion-${Date.now()}-${rng()}`,
        type: 'health_potion',
        name: 'Elixir of Mending',
        healAmount: 40,
        description: 'Restores 40 Health Points.',
        icon: 'Heart',
        rarity: 'rare',
      });

      // 70% chance for Rare or Epic weapon
      if (rng() < 0.7) {
        const pool =
          safeLevel >= 3
            ? ['battle-axe', 'war-spear', 'hunter-bow', 'thunder-hammer']
            : ['katana', 'double-sword', 'battle-axe'];
        const chosen = pool[Math.floor(rng() * pool.length)];
        const weapon = getWeapon(chosen);
        drops.push({
          id: `drop-weapon-${Date.now()}-${rng()}`,
          type: 'chest_reward',
          name: weapon.name,
          weaponPayload: weapon,
          description: `Discovered ancient armament: ${weapon.name}!`,
          icon: 'Swords',
          rarity: weapon.rarity,
        });
      }
      break;
    }

    case 'boss': {
      // Boss drops huge rewards + guaranteed Epic or Legendary weapon
      const bossCoins = Math.floor(rng() * 50) + 80;
      drops.push({
        id: `drop-coin-${Date.now()}-${rng()}`,
        type: 'coin',
        name: `${bossCoins} Titan Gold`,
        amount: bossCoins,
        description: 'Vast horde dropped by the summit titan.',
        icon: 'Coins',
      });

      drops.push({
        id: `drop-xp-${Date.now()}-${rng()}`,
        type: 'xp_crystal',
        name: 'Radiant Summit Crystal',
        xpAmount: 120,
        description: 'A glowing summit shard granting +120 XP.',
        icon: 'Zap',
        rarity: 'epic',
      });

      drops.push({
        id: `drop-armor-${Date.now()}-${rng()}`,
        type: 'armor_piece',
        name: 'Aegis of the Colossus',
        shieldAmount: 50,
        description: 'Grants +50 barrier shield.',
        icon: 'Shield',
        rarity: 'epic',
      });

      // Guaranteed top tier weapon!
      const bossWeaponId = safeLevel >= 5 ? 'legendary-sword' : 'titan-slayer';
      const bossWeapon = getWeapon(bossWeaponId);
      drops.push({
        id: `drop-weapon-${Date.now()}-${rng()}`,
        type: 'chest_reward',
        name: bossWeapon.name,
        weaponPayload: bossWeapon,
        description: `Legendary relic claimed: ${bossWeapon.name}!`,
        icon: 'Sparkles',
        rarity: bossWeapon.rarity,
      });
      break;
    }

    default: {
      drops.push({
        id: `drop-coin-${Date.now()}-${rng()}`,
        type: 'coin',
        name: '10 Gold Coins',
        amount: 10,
        description: 'Scavenged coins.',
        icon: 'Coins',
      });
      break;
    }
  }

  return drops;
}

export interface PickupResult {
  health: number;
  armorShield: number;
  coins: number;
  xp: number;
  keys: number;
  inventory: PlayerInventory;
  notification: string;
  newWeapon?: Weapon;
}

export function processItemPickup({
  drop,
  currentHealth,
  currentShield,
  currentCoins,
  currentXp,
  inventory,
}: {
  drop: ItemDrop;
  currentHealth: number;
  currentShield: number;
  currentCoins: number;
  currentXp: number;
  inventory: PlayerInventory;
}): PickupResult {
  let health = currentHealth;
  let armorShield = currentShield;
  let coins = currentCoins;
  let xp = currentXp;
  let keys = inventory.keys;
  let updatedInventory = inventory;
  let notification = '';
  let newWeapon: Weapon | undefined;

  switch (drop.type) {
    case 'coin': {
      const added = drop.amount ?? 10;
      coins += added;
      notification = `+${added} Coins collected!`;
      break;
    }
    case 'health_potion': {
      const heal = drop.healAmount ?? 25;
      const prevHealth = health;
      health = Math.min(100, health + heal);
      const restored = health - prevHealth;
      notification = `Restored +${restored} HP!`;
      break;
    }
    case 'armor_piece': {
      const shield = drop.shieldAmount ?? 25;
      armorShield = Math.min(100, armorShield + shield);
      notification = `Equipped ${drop.name} (+${shield} Shield)!`;
      break;
    }
    case 'xp_crystal': {
      const bonusXp = drop.xpAmount ?? 30;
      xp += bonusXp;
      notification = `Absorbed ${drop.name} (+${bonusXp} XP)!`;
      break;
    }
    case 'dungeon_key': {
      keys += 1;
      updatedInventory = { ...inventory, keys };
      notification = `Found Key: ${drop.name}!`;
      break;
    }
    case 'chest_reward': {
      if (drop.weaponPayload) {
        newWeapon = drop.weaponPayload;
        updatedInventory = storeWeapon(inventory, newWeapon.id);
        notification = `NEW WEAPON: ${newWeapon.name.toUpperCase()} [${newWeapon.rarity.toUpperCase()}]!`;
      } else {
        notification = `Opened ${drop.name}!`;
      }
      break;
    }
  }

  return {
    health,
    armorShield,
    coins,
    xp,
    keys,
    inventory: updatedInventory,
    notification,
    newWeapon,
  };
}
