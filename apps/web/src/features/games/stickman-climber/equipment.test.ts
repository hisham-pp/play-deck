import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  INITIAL_INVENTORY,
  type ItemDrop,
  type PlayerInventory,
  WEAPON_CATALOG,
  compareWeapons,
  equipWeapon,
  generateDrops,
  getWeapon,
  processItemPickup,
  storeWeapon,
} from './engine/equipment';
import { resolveCombat } from './engine/stickman-climber-logic';

describe('Stickman Climber — Weapons, Items & Equipment (#128)', () => {
  it('catalog contains all required weapons with valid combat attributes and abilities', () => {
    const requiredKeys = [
      'wooden-sword',
      'iron-sword',
      'katana',
      'double-sword',
      'battle-axe',
      'war-spear',
      'hunter-bow',
      'thunder-hammer',
      'titan-slayer',
      'legendary-sword',
    ];

    for (const key of requiredKeys) {
      const weapon = WEAPON_CATALOG[key];
      assert.ok(weapon, `Expected weapon ${key} in catalog`);
      assert.ok(weapon.name.length > 0);
      assert.ok(weapon.damage > 0);
      assert.ok(weapon.attackSpeed > 0);
      assert.ok(weapon.range > 0);
      assert.ok(weapon.rarity);
      assert.ok(weapon.specialAbility.name.length > 0);
      assert.ok(weapon.specialAbility.procChance > 0);
    }
  });

  it('enforces rarity progression where higher tier weapons have superior power', () => {
    const wooden = getWeapon('wooden-sword'); // Common
    const katana = getWeapon('katana'); // Uncommon
    const axe = getWeapon('battle-axe'); // Rare
    const hammer = getWeapon('thunder-hammer'); // Epic
    const excalibur = getWeapon('legendary-sword'); // Legendary

    assert.ok(katana.damage > wooden.damage);
    assert.ok(axe.damage > katana.damage);
    assert.ok(hammer.damage > axe.damage);
    assert.ok(excalibur.damage > hammer.damage);
    assert.equal(excalibur.rarity, 'legendary');
  });

  it('retrieves weapons by id or name with fallback to wooden sword', () => {
    assert.equal(getWeapon('wooden-sword').name, 'Wooden Sword');
    assert.equal(getWeapon('Iron Sword').id, 'iron-sword');
    assert.equal(getWeapon('Katana').id, 'katana');
    assert.equal(getWeapon('unknown-relic-xyz').id, 'wooden-sword');
  });

  it('compares weapons accurately and flags upgrades', () => {
    const wooden = getWeapon('wooden-sword');
    const iron = getWeapon('iron-sword');
    const hammer = getWeapon('thunder-hammer');

    const comparison1 = compareWeapons(wooden, iron);
    assert.equal(comparison1.damageDiff, 6);
    assert.equal(comparison1.isUpgrade, true);

    const comparison2 = compareWeapons(hammer, wooden);
    assert.ok(comparison2.damageDiff < 0);
    assert.equal(comparison2.isUpgrade, false);
  });

  it('manages inventory equipping and quick-swap storage slots', () => {
    let inv: PlayerInventory = INITIAL_INVENTORY;
    assert.equal(inv.equippedWeaponId, 'wooden-sword');

    inv = equipWeapon(inv, 'iron-sword');
    assert.equal(inv.equippedWeaponId, 'iron-sword');
    assert.ok(inv.storedWeapons.includes('iron-sword'));

    inv = storeWeapon(inv, 'battle-axe');
    assert.ok(inv.storedWeapons.includes('battle-axe'));
    assert.equal(inv.equippedWeaponId, 'iron-sword'); // stays equipped

    // Stored weapons capped at 5
    inv = storeWeapon(inv, 'war-spear');
    inv = storeWeapon(inv, 'hunter-bow');
    inv = storeWeapon(inv, 'thunder-hammer');
    assert.ok(inv.storedWeapons.length <= 5);
  });

  it('generates contextual item drops across scouts, brutes, chests, and bosses', () => {
    // 1. Scout drops
    const scoutDrops = generateDrops('scout', 1, () => 0.05); // low roll ensures drops
    assert.ok(scoutDrops.some((d) => d.type === 'coin'));
    assert.ok(scoutDrops.some((d) => d.type === 'health_potion'));

    // 2. Brute drops
    const bruteDrops = generateDrops('brute', 2, () => 0.1);
    assert.ok(bruteDrops.some((d) => d.type === 'coin'));
    assert.ok(bruteDrops.some((d) => d.type === 'armor_piece'));

    // 3. Chest drops
    const chestDrops = generateDrops('chest', 3, () => 0.2);
    assert.ok(chestDrops.some((d) => d.type === 'coin'));
    assert.ok(chestDrops.some((d) => d.type === 'health_potion'));
    assert.ok(chestDrops.some((d) => d.type === 'chest_reward'));

    // 4. Boss drops: guaranteed epic/legendary weapon, titan gold, crystal, shield
    const bossDrops = generateDrops('boss', 5, () => 0.5);
    assert.ok(bossDrops.some((d) => d.type === 'coin'));
    assert.ok(bossDrops.some((d) => d.type === 'xp_crystal'));
    assert.ok(bossDrops.some((d) => d.type === 'armor_piece'));
    const weaponDrop = bossDrops.find((d) => d.type === 'chest_reward');
    assert.ok(weaponDrop?.weaponPayload);
    assert.equal(weaponDrop.weaponPayload.rarity, 'legendary');
  });

  it('processes item pickups: healing, shields, coins, XP, and weapon discovery', () => {
    const inv = INITIAL_INVENTORY;

    // 1. Health Potion Pickup
    const potionDrop: ItemDrop = {
      id: 'p1',
      type: 'health_potion',
      name: 'Health Potion',
      healAmount: 30,
      description: 'Restores HP',
      icon: 'Heart',
    };
    const healRes = processItemPickup({
      drop: potionDrop,
      currentHealth: 60,
      currentShield: 0,
      currentCoins: 10,
      currentXp: 50,
      inventory: inv,
    });
    assert.equal(healRes.health, 90);
    assert.ok(healRes.notification.includes('+30 HP'));

    // 2. Armor Shield Pickup
    const armorDrop: ItemDrop = {
      id: 'a1',
      type: 'armor_piece',
      name: 'Iron Pauldron',
      shieldAmount: 25,
      description: 'Shielding',
      icon: 'Shield',
    };
    const shieldRes = processItemPickup({
      drop: armorDrop,
      currentHealth: 100,
      currentShield: 10,
      currentCoins: 10,
      currentXp: 50,
      inventory: inv,
    });
    assert.equal(shieldRes.armorShield, 35);

    // 3. Weapon Chest Reward
    const weaponDrop: ItemDrop = {
      id: 'w1',
      type: 'chest_reward',
      name: 'Shadow Katana',
      weaponPayload: getWeapon('katana'),
      description: 'Weapon drop',
      icon: 'Swords',
    };
    const weaponRes = processItemPickup({
      drop: weaponDrop,
      currentHealth: 100,
      currentShield: 0,
      currentCoins: 10,
      currentXp: 50,
      inventory: inv,
    });
    assert.ok(weaponRes.newWeapon);
    assert.equal(weaponRes.newWeapon.id, 'katana');
    assert.ok(weaponRes.inventory.storedWeapons.includes('katana'));
    assert.ok(weaponRes.notification.includes('NEW WEAPON'));
  });

  it('absorbs incoming counter-attack damage using armor shield before health in combat', () => {
    // Combat with 20 armor shield
    const resWithShield = resolveCombat({
      weapon: 'wooden-sword',
      level: 3, // enemy hp: 38 -> raw incoming damage = ceil(38/8) = 5
      health: 80,
      xp: 0,
      coins: 0,
      enemyHp: 30, // not defeated
      armorShield: 10,
      rng: () => 0.99, // no ability proc
    });

    // Enemy deals 5 damage: 10 shield absorbs 5, health remains 80!
    assert.equal(resWithShield.armorShield, 5);
    assert.equal(resWithShield.health, 80);
  });

  it('triggers weapon abilities and special procs in combat resolution', () => {
    // Katana proc: 25% chance for Swift Bleed +8 bonus damage
    const resProc = resolveCombat({
      weapon: 'katana',
      level: 1,
      health: 100,
      xp: 0,
      coins: 0,
      enemyHp: 50,
      rng: () => 0.05, // triggers proc (< 0.25)
    });

    assert.ok(resProc.abilityProc);
    assert.equal(resProc.abilityProc.name, 'Swift Bleed');
    assert.equal(resProc.abilityProc.bonusDamage, 8);
    assert.equal(resProc.damage, 24 + 8); // 32
  });

  it('cancels enemy counter-attack when Thunder Hammer stuns', () => {
    // Thunder Hammer proc: 35% chance to stun enemy and cancel counter
    const resStun = resolveCombat({
      weapon: 'thunder-hammer',
      level: 4,
      health: 75,
      xp: 0,
      coins: 0,
      enemyHp: 100, // not defeated
      rng: () => 0.1, // triggers stun (< 0.35)
    });

    assert.ok(resStun.abilityProc?.canceledCounter);
    // Health is not deducted because counter-attack was canceled!
    assert.equal(resStun.health, 75);
  });
});
