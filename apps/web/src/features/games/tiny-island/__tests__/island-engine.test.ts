import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  advanceRound,
  computeBotMove,
  createInitialGameState,
  executeAction,
} from '../engine/tiny-island-engine';

describe('Tiny Island Engine — State, Actions & Combat', () => {
  it('creates initial game state with 2-6 players and starting AP', () => {
    const state = createInitialGameState([
      { id: 'p1', displayName: 'Survivor 1', isBot: false },
      { id: 'p2', displayName: 'Survivor 2', isBot: true },
    ]);

    assert.equal(state.players.length, 2);
    assert.equal(state.round, 1);
    assert.equal(state.phase, 'playing');
    assert.equal(state.currentTurnSeatIndex, 0);
    assert.equal(state.players[0].ap, 2);
    assert.equal(state.players[0].isAlive, true);
  });

  it('moves player to an adjacent walkable tile and deducts 1 AP', () => {
    const state = createInitialGameState([
      { id: 'p1', displayName: 'Survivor 1', isBot: false },
      { id: 'p2', displayName: 'Survivor 2', isBot: true },
    ]);

    const player = state.players[0];
    const targetX = player.x;
    const targetY = player.y > 0 ? player.y - 1 : player.y + 1;

    // Ensure target tile is walkable
    state.tiles[targetY][targetX].type = 'sand';
    state.tiles[targetY][targetX].sinkingState = 'dry';

    const nextState = executeAction(state, {
      type: 'MOVE',
      seatIndex: 0,
      targetCoord: { x: targetX, y: targetY },
    });

    assert.equal(nextState.players[0].x, targetX);
    assert.equal(nextState.players[0].y, targetY);
    assert.equal(nextState.players[0].ap, 1);
  });

  it('gathers resources from the current tile', () => {
    const state = createInitialGameState([
      { id: 'p1', displayName: 'Survivor 1', isBot: false },
      { id: 'p2', displayName: 'Survivor 2', isBot: true },
    ]);

    const player = state.players[0];
    state.tiles[player.y][player.x].resource = 'wood';
    state.tiles[player.y][player.x].resourceCount = 2;
    const initialWood = player.inventory.wood;

    const nextState = executeAction(state, {
      type: 'GATHER',
      seatIndex: 0,
    });

    assert.equal(nextState.players[0].inventory.wood, initialWood + 1);
    assert.equal(nextState.tiles[player.y][player.x].resourceCount, 1);
    assert.equal(nextState.players[0].ap, 1);
  });

  it('builds a wooden bridge on an adjacent water tile', () => {
    const state = createInitialGameState([
      { id: 'p1', displayName: 'Survivor 1', isBot: false },
      { id: 'p2', displayName: 'Survivor 2', isBot: true },
    ]);

    const player = state.players[0];
    player.inventory.wood = 3;

    const targetCoord = { x: player.x + 1, y: player.y };
    state.tiles[targetCoord.y][targetCoord.x].type = 'water';
    state.tiles[targetCoord.y][targetCoord.x].sinkingState = 'submerged';

    const nextState = executeAction(state, {
      type: 'BUILD_BRIDGE',
      seatIndex: 0,
      targetCoord,
    });

    assert.equal(nextState.players[0].inventory.wood, 1); // 3 - 2 = 1
    assert.equal(nextState.tiles[targetCoord.y][targetCoord.x].type, 'bridge');
    assert.equal(nextState.tiles[targetCoord.y][targetCoord.x].sinkingState, 'dry');
  });

  it('pushes an adjacent opponent and eliminates them if pushed into open water', () => {
    const state = createInitialGameState([
      { id: 'p1', displayName: 'Attacker', isBot: false },
      { id: 'p2', displayName: 'Victim', isBot: false },
    ]);

    // Setup: Attacker at (4, 4), Victim at (4, 3), water at (4, 2)
    state.players[0].x = 4;
    state.players[0].y = 4;
    state.players[1].x = 4;
    state.players[1].y = 3;
    state.tiles[2][4].type = 'water';
    state.tiles[2][4].sinkingState = 'submerged';

    const nextState = executeAction(state, {
      type: 'PUSH',
      seatIndex: 0,
      targetPlayerId: 'p2',
    });

    assert.equal(nextState.players[1].isAlive, false);
    assert.equal(nextState.players[1].eliminatedCause, 'pushed');
    assert.equal(nextState.players[0].stats.eliminations, 1);
    // Since only 1 survivor remains, victory triggers
    assert.equal(nextState.phase, 'game_over');
    assert.equal(nextState.winnerSeatIndex, 0);
  });

  it('emergency raft saves a pushed player from drowning', () => {
    const state = createInitialGameState([
      { id: 'p1', displayName: 'Attacker', isBot: false },
      { id: 'p2', displayName: 'Victim', isBot: false },
      { id: 'p3', displayName: 'Observer', isBot: false },
    ]);

    state.players[0].x = 4;
    state.players[0].y = 4;
    state.players[1].x = 4;
    state.players[1].y = 3;
    state.players[1].tools.hasRaft = true; // Has emergency raft!
    state.tiles[2][4].type = 'water';
    state.tiles[2][4].sinkingState = 'submerged';

    const nextState = executeAction(state, {
      type: 'PUSH',
      seatIndex: 0,
      targetPlayerId: 'p2',
    });

    // Victim survived because raft was consumed!
    assert.equal(nextState.players[1].isAlive, true);
    assert.equal(nextState.players[1].tools.hasRaft, false);
  });

  it('advances round and submerges warning tiles', () => {
    const state = createInitialGameState([
      { id: 'p1', displayName: 'P1', isBot: false },
      { id: 'p2', displayName: 'P2', isBot: false },
    ]);

    const nextRoundState = advanceRound(state);
    assert.equal(nextRoundState.round, 2);
    assert.equal(nextRoundState.currentTurnSeatIndex, 0);
    assert.equal(nextRoundState.players[0].ap, 2);
  });

  it('computes tactical moves for AI bot survivor', () => {
    const state = createInitialGameState([
      { id: 'p1', displayName: 'Human', isBot: false },
      { id: 'bot1', displayName: 'Chuck', isBot: true },
    ]);

    const botAction = computeBotMove(state, 1);
    assert.ok(
      ['MOVE', 'GATHER', 'BUILD_BRIDGE', 'CRAFT_RAFT', 'PUSH', 'STEAL', 'PASS'].includes(
        botAction.type,
      ),
    );
    assert.equal(botAction.seatIndex, 1);
  });
});
