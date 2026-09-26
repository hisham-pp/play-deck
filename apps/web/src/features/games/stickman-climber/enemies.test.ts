import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ENEMY_ROSTER, createActiveEnemy, getBossPhase, processCombatTurn } from './engine/enemies';

describe('Stickman Climber — Enemy Roster, Bosses & AI States (#129)', () => {
  it('roster contains all 8 required enemy archetypes with attributes', () => {
    const requiredArchetypes = [
      'basic',
      'fast',
      'shield',
      'archer',
      'heavy',
      'ninja',
      'elite',
      'boss',
    ];

    for (const archetype of requiredArchetypes) {
      const enemy = Object.values(ENEMY_ROSTER).find((e) => e.archetype === archetype);
      assert.ok(enemy, `Expected archetype ${archetype} in ENEMY_ROSTER`);
      assert.ok(enemy.maxHp > 0);
      assert.ok(enemy.damage > 0);
      assert.ok(enemy.attackSpeed > 0);
      assert.ok(enemy.rewardXp > 0);
      assert.ok(enemy.rewardCoins > 0);
      assert.ok(enemy.flavorText.length > 0);
    }
  });

  it('configures boss encounters with multi-phase transitions and damage escalation', () => {
    const titan = ENEMY_ROSTER['titan-gorgoroth'];
    assert.equal(titan.archetype, 'boss');
    assert.ok(titan.bossPhases && titan.bossPhases.length >= 3);

    // Phase 1: 100% HP
    const phase1 = getBossPhase(titan, 160);
    assert.equal(phase1.phase, 1);
    assert.equal(phase1.damageMultiplier, 1.0);

    // Phase 2: 50% HP (below 60%)
    const phase2 = getBossPhase(titan, 80);
    assert.equal(phase2.phase, 2);
    assert.ok(phase2.damageMultiplier > 1.0);
    assert.equal(phase2.name, 'Phase 2: Magma Rage');

    // Phase 3: 20% HP (below 30%)
    const phase3 = getBossPhase(titan, 30);
    assert.equal(phase3.phase, 3);
    assert.equal(phase3.damageMultiplier, 1.75);
    assert.equal(phase3.name, 'Phase 3: Mountain Shatterer');
  });

  it('shields absorb frontal strike damage until depleted', () => {
    const enemyState = createActiveEnemy('shield-bearer');
    assert.equal(enemyState.currentShieldHp, 25);
    assert.equal(enemyState.currentHp, 38);

    // Strike for 15 damage
    const turn1 = processCombatTurn({
      playerAction: 'strike',
      playerWeaponDamage: 15,
      enemyState,
    });

    assert.equal(turn1.enemyState.currentShieldHp, 10); // 25 - 15
    assert.equal(turn1.enemyState.currentHp, 38); // HP protected by shield!
    assert.equal(turn1.shieldBroken, false);

    // Second strike for 15 damage breaks shield
    const turn2 = processCombatTurn({
      playerAction: 'strike',
      playerWeaponDamage: 15,
      enemyState: turn1.enemyState,
    });

    assert.equal(turn2.enemyState.currentShieldHp, 0);
    assert.equal(turn2.shieldBroken, true);
  });

  it('flanking bypasses shield guard and dodges telegraphed special attacks', () => {
    const enemyState = createActiveEnemy('shield-bearer');
    enemyState.isTelegraphing = true; // charging special attack

    const result = processCombatTurn({
      playerAction: 'flank',
      playerWeaponDamage: 20,
      enemyState,
    });

    // Flank bypasses shield and hits HP directly!
    assert.ok(result.enemyState.currentHp < 38);
    assert.equal(result.enemyState.currentShieldHp, 25); // shield unchanged
    // Incoming damage is 0 because flank evades the telegraphed attack
    assert.equal(result.playerHealthDelta, 0);
    assert.equal(result.enemyState.aiState, 'staggered');
  });

  it('heavy cleave smashes through enemy shields with bonus damage', () => {
    const enemyState = createActiveEnemy('shield-bearer');

    const result = processCombatTurn({
      playerAction: 'cleave',
      playerWeaponDamage: 24, // 24 * 1.25 = 30 cleave damage
      enemyState,
    });

    assert.equal(result.enemyState.currentShieldHp, 0); // 25 shield wiped out
    assert.equal(result.shieldBroken, true);
    assert.ok(result.actionMessage.includes('SHIELD BROKEN'));
  });

  it('counter-parry deflects incoming attacks and staggers the enemy', () => {
    const enemyState = createActiveEnemy('stone-crusher');
    enemyState.isTelegraphing = true;

    const result = processCombatTurn({
      playerAction: 'parry',
      playerWeaponDamage: 20,
      enemyState,
    });

    assert.equal(result.playerHealthDelta, 0); // deflected
    assert.equal(result.enemyState.aiState, 'staggered');
    assert.ok(result.actionMessage.includes('PERFECT PARRY'));
  });

  it('handles enemy defeat and transitions AI state to defeated', () => {
    const enemyState = createActiveEnemy('basic-scout');
    enemyState.currentHp = 10;

    const result = processCombatTurn({
      playerAction: 'strike',
      playerWeaponDamage: 18,
      enemyState,
    });

    assert.equal(result.enemyState.currentHp, 0);
    assert.equal(result.enemyDefeated, true);
    assert.equal(result.enemyState.aiState, 'defeated');
  });
});
