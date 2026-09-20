import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TinyTankConfig } from '../types/tiny-tank.types';
import { createInitialArenaState, stepTinyTankArena } from './tank-engine';

const TEST_CONFIG: TinyTankConfig = {
  botCount: 2,
  botDifficulty: 'medium',
  roundDuration: 60,
  soundEnabled: false,
  highContrast: false,
  reducedMotion: false,
};

describe('tank-engine', () => {
  it('initializes arena state with players, blocks, and crates', () => {
    const state = createInitialArenaState(TEST_CONFIG, 'Commander P1');
    assert.equal(state.status, 'countdown');
    assert.equal(state.players.length, 3); // 1 player + 2 bots
    assert.equal(state.players[0].name, 'Commander P1');
    assert.ok(state.blocks.length > 20);
    assert.ok(state.crates.length > 0);
  });

  it('progresses from countdown to playing state', () => {
    const state = createInitialArenaState(TEST_CONFIG);
    assert.equal(state.status, 'countdown');

    const result = stepTinyTankArena(state, {}, TEST_CONFIG, 3.5);
    assert.equal(result.nextState.status, 'playing');
    assert.equal(result.nextState.countdown, 0);
  });

  it('spawns projectile and consumes ammo when firing cannon', () => {
    const state = createInitialArenaState(TEST_CONFIG);
    state.status = 'playing';
    state.countdown = 0;
    state.players[0].reloadTimer = 0;
    state.players[0].ammo = 5;

    const inputs = {
      'player-1': {
        moveForward: false,
        moveBackward: false,
        turnLeft: false,
        turnRight: false,
        turretAngle: 0,
        fire: true,
      },
    };

    const result = stepTinyTankArena(state, inputs, TEST_CONFIG, 0.05);
    const p1 = result.nextState.players[0];

    assert.equal(result.nextState.projectiles.length, 1);
    assert.equal(p1.ammo < 5, true);
    assert.ok(p1.reloadTimer > 0);
    assert.ok(result.events.some((e) => e.type === 'fire'));
  });

  it('damages enemy tank and absorbs through shield', () => {
    const state = createInitialArenaState(TEST_CONFIG);
    state.status = 'playing';
    state.countdown = 0;

    // Position enemy tank directly in front of projectile
    const enemy = state.players[1];
    enemy.position = { x: 300, y: 300 };
    enemy.shield = 20;
    enemy.health = 100;
    enemy.invulnerableTimer = 0;

    // Bullet moving straight toward enemy
    state.projectiles = [
      {
        id: 'test-bullet',
        shooterId: 'player-1',
        weapon: 'cannon',
        position: { x: 295, y: 300 },
        velocity: { x: 300, y: 0 },
        angle: 0,
        radius: 5,
        damage: 30,
        bouncesRemaining: 0,
        lifetime: 2.0,
      },
    ];

    const result = stepTinyTankArena(state, {}, TEST_CONFIG, 0.05);
    const updatedEnemy = result.nextState.players.find((p) => p.id === enemy.id);

    assert.ok(updatedEnemy);
    // Shield should absorb 20, remaining 10 damages health (100 - 10 = 90)
    assert.equal(updatedEnemy.shield, 0);
    assert.equal(updatedEnemy.health, 90);
    assert.ok(result.events.some((e) => e.type === 'hit'));
  });

  it('arms and detonates proximity mine against nearby tank', () => {
    const state = createInitialArenaState(TEST_CONFIG);
    state.status = 'playing';
    state.countdown = 0;

    state.players[1].position = { x: 400, y: 400 };
    state.players[1].health = 100;

    state.mines = [
      {
        id: 'test-mine',
        ownerId: 'player-1',
        position: { x: 410, y: 400 }, // within trigger radius 36
        armTimer: 0,
        isArmed: true,
        triggerRadius: 36,
        blastRadius: 90,
        damage: 50,
        lifetime: 10,
      },
    ];

    const result = stepTinyTankArena(state, {}, TEST_CONFIG, 0.05);
    const updatedEnemy = result.nextState.players.find((p) => p.id === state.players[1].id);

    assert.ok(updatedEnemy);
    assert.ok(updatedEnemy.health < 100);
    assert.equal(result.nextState.mines.length, 0);
    assert.ok(result.nextState.explosions.length > 0);
  });

  it('collects pickup crate to recharge stats', () => {
    const state = createInitialArenaState(TEST_CONFIG);
    state.status = 'playing';
    state.countdown = 0;

    const p1 = state.players[0];
    p1.health = 50;
    p1.position = { x: 500, y: 500 };

    state.crates = [
      {
        id: 'test-health-crate',
        type: 'health',
        position: { x: 505, y: 500 },
        radius: 14,
        pulseTimer: 0,
      },
    ];

    const result = stepTinyTankArena(state, {}, TEST_CONFIG, 0.05);
    const updatedP1 = result.nextState.players[0];

    assert.ok(updatedP1.health > 50);
    assert.equal(result.nextState.crates.length, 0);
    assert.ok(result.events.some((e) => e.type === 'crate_pickup'));
  });

  it('concludes round with match_over when only one tank survives', () => {
    const state = createInitialArenaState(TEST_CONFIG);
    state.status = 'playing';
    state.countdown = 0;

    // Eliminate all bots
    state.players[1].isAlive = false;
    state.players[2].isAlive = false;

    const result = stepTinyTankArena(state, {}, TEST_CONFIG, 0.05);
    assert.equal(result.nextState.status, 'match_over');
    assert.equal(result.nextState.winnerId, 'player-1');
  });
});
