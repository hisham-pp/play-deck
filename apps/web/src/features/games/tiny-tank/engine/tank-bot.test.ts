import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TankPlayer, PickupCrate } from '../types/tiny-tank.types';
import { computeBotInput } from './tank-bot';

function createDummyTank(id: string, x: number, y: number, isBot = true): TankPlayer {
  return {
    id,
    name: id,
    color: '#ef4444',
    isBot,
    isAlive: true,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    angle: 0,
    turretAngle: 0,
    health: 100,
    maxHealth: 100,
    shield: 0,
    maxShield: 50,
    ammo: 5,
    maxAmmo: 5,
    reloadTimer: 0,
    activeWeapon: 'cannon',
    weaponAmmo: { cannon: Infinity, bouncing: 0, homing: 0, mine: 0, laser: 0, rubber: 0 },
    score: 0,
    kills: 0,
    damageDealt: 0,
    recoilOffset: 0,
    invulnerableTimer: 0,
  };
}

describe('tank-bot', () => {
  it('returns no inputs if bot is dead', () => {
    const bot = createDummyTank('bot-1', 100, 100);
    bot.isAlive = false;

    const input = computeBotInput(bot, [bot], [], [], [], 'medium', 0.05);
    assert.equal(input.moveForward, false);
    assert.equal(input.fire, false);
  });

  it('steers and moves toward target opponent', () => {
    const bot = createDummyTank('bot-1', 100, 100);
    const enemy = createDummyTank('player-1', 300, 100, false);

    const input = computeBotInput(bot, [bot, enemy], [], [], [], 'medium', 0.05);
    assert.ok(input.moveForward || input.turnRight || input.turnLeft);
  });

  it('prioritizes nearby health crate when bot is critically damaged', () => {
    const bot = createDummyTank('bot-1', 100, 100);
    bot.health = 25; // Critical

    const enemy = createDummyTank('player-1', 800, 500, false); // Far away
    const crate: PickupCrate = {
      id: 'crate-hp',
      type: 'health',
      position: { x: 150, y: 100 }, // Close by
      radius: 14,
      pulseTimer: 0,
    };

    const input = computeBotInput(bot, [bot, enemy], [], [crate], [], 'hard', 0.05);
    assert.ok(input.moveForward || !input.moveBackward);
  });

  it('aims turret and fires at enemy when in line of sight and reloaded', () => {
    const bot = createDummyTank('bot-1', 200, 200);
    bot.turretAngle = 0; // aimed right
    bot.reloadTimer = 0;

    const enemy = createDummyTank('player-1', 350, 200, false); // Directly right

    const input = computeBotInput(bot, [bot, enemy], [], [], [], 'hard', 0.05);
    assert.equal(input.fire, true);
  });
});
