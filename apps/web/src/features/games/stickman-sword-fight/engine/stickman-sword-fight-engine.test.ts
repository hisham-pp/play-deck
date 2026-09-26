import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createInitialSwordFightState,
  stepSwordFightEngine,
  handleFighterInput,
  checkHitRegistration,
} from './stickman-sword-fight-engine';

describe('Stickman Sword Fight Engine', () => {
  it('should initialize state correctly with countdown', () => {
    const state = createInitialSwordFightState({ difficulty: 'normal', isTwoPlayer: false });
    assert.equal(state.status, 'countdown');
    assert.equal(state.round, 1);
    assert.equal(state.p1.health, 100);
    assert.equal(state.p2.health, 100);
    assert.equal(state.p1.posture, 0);
    assert.equal(state.p2.posture, 0);
    assert.equal(state.p1.roundsWon, 0);
    assert.equal(state.p2.roundsWon, 0);
    assert.ok(state.p1.x < state.p2.x);
  });

  it('should transition from countdown to fighting', () => {
    let state = createInitialSwordFightState();
    // Step through 2.1 seconds of countdown in increments of 0.05s
    for (let i = 0; i < 45; i++) {
      state = stepSwordFightEngine(state, { p1: {} }, 0.05);
    }
    assert.equal(state.status, 'fighting');
  });

  it('should move player when movement inputs provided', () => {
    const state = createInitialSwordFightState();
    state.status = 'fighting';
    const initialX = state.p1.x;

    handleFighterInput(state.p1, { moveRight: true }, state.p2, state);
    assert.ok(state.p1.x > initialX);
  });

  it('should enter slashing state and consume stamina upon attack', () => {
    const state = createInitialSwordFightState();
    state.status = 'fighting';
    const initStamina = state.p1.stamina;

    handleFighterInput(state.p1, { slash: true }, state.p2, state);
    assert.equal(state.p1.state, 'slashing');
    assert.equal(state.p1.slashType, 'light');
    assert.ok(state.p1.stamina < initStamina);
  });

  it('should inflict damage on undefended target on hit', () => {
    const state = createInitialSwordFightState();
    state.status = 'fighting';
    state.p1.x = 300;
    state.p2.x = 350;
    state.p1.facing = 1;
    state.p1.hitboxActive = true;
    state.p1.slashType = 'light';

    const p2InitHp = state.p2.health;
    checkHitRegistration(state.p1, state.p2, state);

    assert.ok(state.p2.health < p2InitHp);
    assert.ok(state.p2.posture > 0);
    assert.equal(state.p2.state, 'hit');
  });

  it('should stagger attacker on perfect parry', () => {
    const state = createInitialSwordFightState();
    state.status = 'fighting';
    state.p1.x = 300;
    state.p2.x = 350;
    state.p1.facing = 1;
    state.p1.hitboxActive = true;
    state.p1.slashType = 'light';

    // Defender parrying in active window
    state.p2.state = 'parrying';
    state.p2.parryWindowActive = true;

    const p2InitHp = state.p2.health;
    checkHitRegistration(state.p1, state.p2, state);

    // Defender takes no damage, attacker is staggered
    assert.equal(state.p2.health, p2InitHp);
    assert.equal(state.p1.state, 'staggered');
    assert.ok(state.p1.posture > 0);
    assert.ok(state.soundEvents.includes('parry'));
  });

  it('should evade attack while in dash state', () => {
    const state = createInitialSwordFightState();
    state.status = 'fighting';
    state.p1.x = 300;
    state.p2.x = 350;
    state.p1.facing = 1;
    state.p1.hitboxActive = true;
    state.p1.slashType = 'light';

    state.p2.state = 'dashing';

    const p2InitHp = state.p2.health;
    checkHitRegistration(state.p1, state.p2, state);

    assert.equal(state.p2.health, p2InitHp);
  });

  it('should award round win when opponent HP drops to 0', () => {
    let state = createInitialSwordFightState();
    state.status = 'fighting';
    state.p2.health = 5;
    state.p1.x = 300;
    state.p2.x = 340;
    state.p1.facing = 1;
    state.p1.hitboxActive = true;
    state.p1.slashType = 'heavy';

    state = stepSwordFightEngine(state, { p1: {} }, 0.05);

    assert.equal(state.status, 'round_over');
    assert.equal(state.roundWinner, 'p1');
    assert.equal(state.p1.roundsWon, 1);
  });
});
