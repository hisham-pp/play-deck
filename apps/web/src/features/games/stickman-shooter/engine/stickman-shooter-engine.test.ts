import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createInitialShooterState,
  firePlayerWeapon,
  setPlayerPosture,
  spawnWaveEnemies,
  startReload,
  startShooterGame,
  stepShooterEngine,
  togglePlayerPosture,
} from './stickman-shooter-engine';

describe('Stickman Shooter Engine — State & Initialization', () => {
  it('creates initial state with full health, ammo, and cover posture', () => {
    const state = createInitialShooterState(500);
    assert.equal(state.status, 'ready');
    assert.equal(state.player.health, 100);
    assert.equal(state.player.ammo, 10);
    assert.equal(state.player.posture, 'cover');
    assert.equal(state.highScore, 500);
    assert.equal(state.enemies.length, 0);
  });

  it('starts game in playing state with spawned enemies', () => {
    const state = createInitialShooterState();
    const running = startShooterGame(state);
    assert.equal(running.status, 'playing');
    assert.ok(running.enemies.length > 0);
    assert.equal(running.wave, 1);
  });

  it('spawns more enemies and advanced archetypes on higher waves', () => {
    const wave1 = spawnWaveEnemies(1);
    const wave5 = spawnWaveEnemies(5);
    assert.ok(wave5.length >= wave1.length);
    assert.ok(wave5.some((e) => e.type === 'boss' || e.type === 'heavy' || e.type === 'sniper'));
  });
});

describe('Stickman Shooter Engine — Posture & Cover Mechanics', () => {
  it('toggles posture between cover and aiming', () => {
    let state = startShooterGame(createInitialShooterState());
    assert.equal(state.player.posture, 'cover');

    state = togglePlayerPosture(state);
    assert.equal(state.player.posture, 'aiming');

    state = togglePlayerPosture(state);
    assert.equal(state.player.posture, 'cover');
  });

  it('prevents shooting while in cover posture', () => {
    const state = startShooterGame(createInitialShooterState());
    assert.equal(state.player.posture, 'cover');

    const { state: nextState, outcome } = firePlayerWeapon(state, 400, 300);
    assert.equal(outcome, 'in_cover');
    assert.equal(nextState.player.ammo, 10); // Ammo unchanged
  });
});

describe('Stickman Shooter Engine — Firing & Hit Detection', () => {
  it('fires weapon when aiming and deducts ammo', () => {
    let state = startShooterGame(createInitialShooterState());
    state = setPlayerPosture(state, 'aiming');

    const { state: nextState, outcome } = firePlayerWeapon(state, 0, 0); // Miss
    assert.equal(outcome, 'miss');
    assert.equal(nextState.player.ammo, 9);
    assert.equal(nextState.stats.shotsFired, 1);
    assert.equal(nextState.stats.shotsHit, 0);
  });

  it('detects headshots with critical damage multiplier', () => {
    let state = startShooterGame(createInitialShooterState());
    state = setPlayerPosture(state, 'aiming');

    // Place an exposed enemy directly in view
    const testEnemy = {
      ...state.enemies[0],
      x: 500,
      y: 350,
      state: 'aiming' as const,
      bodyHeight: 50,
      headRadius: 15,
      health: 100,
    };
    state.enemies = [testEnemy];

    // Target the head: y = 350 - 50 - 15 = 285
    const { state: nextState, outcome } = firePlayerWeapon(state, 500, 285);
    assert.equal(outcome, 'headshot');
    assert.equal(nextState.stats.headshots, 1);
    assert.equal(nextState.stats.shotsHit, 1);
    assert.ok(nextState.enemies[0].health < 30); // 35 * 2.5 = 87.5 damage
    assert.equal(nextState.combo, 2);
  });

  it('detects body hits and awards score on enemy defeat', () => {
    let state = startShooterGame(createInitialShooterState());
    state = setPlayerPosture(state, 'aiming');

    const testEnemy = {
      ...state.enemies[0],
      x: 500,
      y: 350,
      state: 'aiming' as const,
      bodyWidth: 30,
      bodyHeight: 50,
      headRadius: 15,
      health: 20, // Low health so one shot eliminates
    };
    state.enemies = [testEnemy];

    // Target the body center: y = 325, x = 500
    const { state: nextState, outcome } = firePlayerWeapon(state, 500, 325);
    assert.equal(outcome, 'hit');
    assert.equal(nextState.enemies[0].state, 'dead');
    assert.equal(nextState.stats.enemiesKilled, 1);
    assert.ok(nextState.score > 0);
  });

  it('signals empty chamber when ammo reaches 0', () => {
    let state = startShooterGame(createInitialShooterState());
    state = setPlayerPosture(state, 'aiming');
    state.player.ammo = 0;

    const { state: nextState, outcome } = firePlayerWeapon(state, 500, 300);
    assert.equal(outcome, 'empty');
    assert.equal(nextState.player.ammo, 0);
  });
});

describe('Stickman Shooter Engine — Reloading & Recovery', () => {
  it('initiates reload and restocks magazine when timer completes', () => {
    let state = startShooterGame(createInitialShooterState());
    state.player.ammo = 2;

    state = startReload(state);
    assert.equal(state.player.isReloading, true);

    // Step through time past reload duration
    for (let t = 0; t < 15; t++) {
      state = stepShooterEngine(state, 0.1);
    }
    assert.equal(state.player.isReloading, false);
    assert.equal(state.player.ammo, state.player.maxAmmo);
  });
});

describe('Stickman Shooter Engine — Combat Simulation & Cover Protection', () => {
  it('blocks enemy damage completely when player is crouched in cover', () => {
    let state = startShooterGame(createInitialShooterState());
    state = setPlayerPosture(state, 'cover');

    // Setup an enemy ready to fire
    state.enemies = [
      {
        ...state.enemies[0],
        state: 'aiming',
        stateTimer: 0.05,
        attackDamage: 25,
      },
    ];

    const initialHealth = state.player.health;
    // Step time so enemy transitions from aiming to shooting
    state = stepShooterEngine(state, 0.1);

    assert.equal(state.player.health, initialHealth); // No damage taken
    assert.ok(state.floatingTexts.some((f) => f.text === 'BLOCKED!'));
  });

  it('inflicts damage on player when standing to aim', () => {
    let state = startShooterGame(createInitialShooterState());
    state = setPlayerPosture(state, 'aiming');

    state.enemies = [
      {
        ...state.enemies[0],
        state: 'aiming',
        stateTimer: 0.05,
        attackDamage: 25,
      },
    ];

    state = stepShooterEngine(state, 0.1);
    assert.equal(state.player.health, 75); // 100 - 25
  });

  it('triggers game over when player health drops to 0', () => {
    let state = startShooterGame(createInitialShooterState());
    state = setPlayerPosture(state, 'aiming');
    state.player.health = 10;

    state.enemies = [
      {
        ...state.enemies[0],
        state: 'aiming',
        stateTimer: 0.05,
        attackDamage: 20,
      },
    ];

    state = stepShooterEngine(state, 0.1);
    assert.equal(state.status, 'game_over');
    assert.equal(state.player.health, 0);
  });
});
