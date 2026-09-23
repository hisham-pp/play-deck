import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createEnemyWave, resolveCombat } from './engine/stickman-climber-logic';

describe('Stickman Climber combat engine', () => {
    it('creates a threat-appropriate enemy wave for the selected level', () => {
        const wave = createEnemyWave(3);

        assert.equal(wave.level, 3);
        assert.ok(wave.enemy.name.length > 0);
        assert.ok(wave.enemy.hp > 0);
        assert.ok(wave.enemy.rewardXp > 0);
        assert.ok(wave.enemy.rewardCoins > 0);
    });

    it('applies weapon damage and rewards progression without going below zero', () => {
        const result = resolveCombat({
            weapon: 'Wooden Sword',
            level: 2,
            health: 32,
            xp: 180,
            coins: 10,
            enemyHp: 25,
        });

        assert.ok(result.health >= 0);
        assert.ok(result.xp >= 180);
        assert.ok(result.coins >= 10);
        assert.ok(result.defeated || result.health < 32);
    });
});
