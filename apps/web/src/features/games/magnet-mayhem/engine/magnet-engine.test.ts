import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createInitialArenaState, stepMagnetSimulation } from './magnet-engine';

describe('Magnet Mayhem — Game Engine', () => {
  const mockPlayers = [
    { id: 'p1', name: 'Alice', avatar: '🧲', isBot: false, isHost: true },
    { id: 'p2', name: 'Bot Bravo', avatar: '🤖', isBot: true, isHost: false },
  ];

  it('initializes balanced arena layout with countdown phase', () => {
    const state = createInitialArenaState(mockPlayers, { roundDurationSec: 45 });
    assert.equal(state.players.length, 2);
    assert.equal(state.roundPhase, 'countdown');
    assert.equal(state.countdownSec, 3.0);
    assert.equal(state.roundDurationSec, 45);
    assert.ok(state.anchors.length >= 4);
    assert.ok(state.hazards.length >= 2);
    assert.ok(state.targets.length >= 5);
    assert.equal(state.isGameOver, false);
    assert.equal(state.winnerId, null);
  });

  it('progresses from countdown to playing phase', () => {
    let state = createInitialArenaState(mockPlayers);
    // Step 2 seconds
    state = stepMagnetSimulation(state, 2.0);
    assert.equal(state.roundPhase, 'countdown');
    assert.ok(state.countdownSec <= 1.0);

    // Step another 1.5 seconds -> transitions to playing
    state = stepMagnetSimulation(state, 1.5);
    assert.equal(state.roundPhase, 'playing');
    assert.equal(state.countdownSec, 0);
  });

  it('drains energy and attracts toward anchor during attract action', () => {
    let state = createInitialArenaState(mockPlayers);
    state.roundPhase = 'playing';

    // Place player 1 near center anchor
    const centerAnchor = state.anchors.find((a) => a.id === 'anchor-center')!;
    state.players[0].position = { x: centerAnchor.x - 100, y: centerAnchor.y };
    state.players[0].velocity = { x: 0, y: 0 };
    state.players[0].action = 'attract';
    state.players[0].energy = 100;

    let tetherEventTriggered = false;
    state = stepMagnetSimulation(state, 0.1, {
      onAttractTether: () => {
        tetherEventTriggered = true;
      },
    });

    const p1 = state.players[0];
    assert.ok(p1.velocity.x > 0, 'velocity should increase towards anchor');
    assert.ok(p1.energy < 100, 'energy should drain during attract');
    assert.ok(p1.isTethered, 'should be marked as tethered');
    assert.ok(tetherEventTriggered, 'tether event should trigger');
  });

  it('pushes rivals away during repel action', () => {
    let state = createInitialArenaState(mockPlayers);
    state.roundPhase = 'playing';

    // Place player 1 and player 2 close to each other
    state.players[0].position = { x: 300, y: 300 };
    state.players[0].velocity = { x: 0, y: 0 };
    state.players[0].action = 'repel';
    state.players[0].energy = 100;

    state.players[1].position = { x: 380, y: 300 };
    state.players[1].velocity = { x: 0, y: 0 };

    state = stepMagnetSimulation(state, 0.1);

    const rival = state.players[1];
    assert.ok(rival.velocity.x > 0, 'rival should be pushed away along positive X');
    assert.ok(state.players[0].energy < 100);
    assert.ok(state.players[0].repelHitCount > 0);
  });

  it('recharges energy when idle', () => {
    let state = createInitialArenaState(mockPlayers);
    state.roundPhase = 'playing';

    state.players[0].energy = 50;
    state.players[0].action = 'idle';

    state = stepMagnetSimulation(state, 0.5);
    assert.ok(state.players[0].energy > 50, 'energy should recharge when idle');
  });

  it('awards points and spawns visual feedback on target collection', () => {
    let state = createInitialArenaState(mockPlayers);
    state.roundPhase = 'playing';

    const target = state.targets[0];
    state.players[0].position = { x: target.x, y: target.y };
    state.players[0].score = 0;

    let collectedEvent = false;
    state = stepMagnetSimulation(state, 0.05, {
      onTargetCollected: () => {
        collectedEvent = true;
      },
    });

    assert.ok(state.players[0].score > 0, 'score should increase');
    assert.ok(state.targets[0].isCollected, 'target should be marked collected');
    assert.ok(collectedEvent, 'collection event should fire');
    assert.ok(state.floatingTexts.length > 0, 'floating score text should appear');
  });

  it('applies penalty, stun, and knockback on hazard zap', () => {
    let state = createInitialArenaState(mockPlayers);
    state.roundPhase = 'playing';

    const hazard = state.hazards[0];
    state.players[0].position = { x: hazard.x, y: hazard.y };
    state.players[0].score = 20;

    let zappedEvent = false;
    state = stepMagnetSimulation(state, 0.05, {
      onHazardZapped: () => {
        zappedEvent = true;
      },
    });

    assert.ok(zappedEvent, 'zap event should fire');
    assert.equal(state.players[0].score, 15, '5 points should be deducted');
    assert.ok(state.players[0].stunnedTimer > 0, 'player should be stunned');
    assert.ok(vecLength(state.players[0].velocity) > 0, 'player should be knocked back');
  });

  it('triggers game over and resolves winner when round timer expires', () => {
    let state = createInitialArenaState(mockPlayers, { roundDurationSec: 10 });
    state.roundPhase = 'playing';
    state.elapsedSec = 9.9;
    state.players[0].score = 80;
    state.players[1].score = 30;

    state = stepMagnetSimulation(state, 0.2);

    assert.ok(state.isGameOver);
    assert.equal(state.roundPhase, 'game-over');
    assert.equal(state.winnerId, 'p1');
  });
});

function vecLength(v: { x: number; y: number }): number {
  return Math.hypot(v.x, v.y);
}
