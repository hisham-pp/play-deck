import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createGridForMap,
  createInitialTrainRushState,
  discardCurrentPiece,
  getPieceConnections,
  MAP_PRESETS,
  placeTrackPiece,
  removeTrackPiece,
  rotateCurrentPiece,
  rotateDirection,
  startTrainRushRound,
  stepTrainRushEngine,
  type TrackPiece,
} from './train-rush-engine';

test('Train Rush Engine - Direction rotation and piece connections', () => {
  // Direction rotations
  assert.equal(rotateDirection('N', 0), 'N');
  assert.equal(rotateDirection('N', 90), 'E');
  assert.equal(rotateDirection('N', 180), 'S');
  assert.equal(rotateDirection('N', 270), 'W');

  // Straight piece: 0° is N-S, 90° is E-W
  const straight0 = getPieceConnections('straight', 0);
  assert.deepEqual(straight0.sort(), ['N', 'S'].sort());

  const straight90 = getPieceConnections('straight', 90);
  assert.deepEqual(straight90.sort(), ['E', 'W'].sort());

  // Curve piece: 0° is N-E, 90° is E-S, 180° is S-W, 270° is W-N
  const curve0 = getPieceConnections('curve', 0);
  assert.deepEqual(curve0.sort(), ['E', 'N'].sort());

  const curve90 = getPieceConnections('curve', 90);
  assert.deepEqual(curve90.sort(), ['E', 'S'].sort());

  const curve180 = getPieceConnections('curve', 180);
  assert.deepEqual(curve180.sort(), ['S', 'W'].sort());

  const curve270 = getPieceConnections('curve', 270);
  assert.deepEqual(curve270.sort(), ['N', 'W'].sort());

  // Crossroad has all 4 directions
  const cross = getPieceConnections('crossroad', 0);
  assert.equal(cross.length, 4);
});

test('Train Rush Engine - Grid generation and map setup', () => {
  const map = MAP_PRESETS[0]; // Meadow Crossing 7x7
  const grid = createGridForMap(map);

  assert.equal(grid.length, 7);
  assert.equal(grid[0].length, 7);

  // Start depot at (0,3)
  assert.equal(grid[3][0].type, 'start');
  assert.equal(grid[3][0].isStart, true);

  // Destination at (6,3)
  assert.equal(grid[3][6].type, 'destination');
  assert.equal(grid[3][6].isDestination, true);

  // Obstacle at (3,1)
  assert.equal(grid[1][3].isObstacle, true);
});

test('Train Rush Engine - Track placement and route extension', () => {
  const map = MAP_PRESETS[0];
  const state = createInitialTrainRushState({ mapId: map.id });
  let player = state.players[0];

  // Initial route only has start depot
  assert.equal(player.routeResult.length, 1);
  assert.equal(player.routeResult.isComplete, false);

  // Start is at (0,3) exiting 'E'.
  // Place straight track at (1,3) rotated 90° (E-W)
  const piece1: TrackPiece = {
    id: 'test-p1',
    type: 'straight',
    rotation: 90, // E-W
  };

  const res1 = placeTrackPiece(player, map, 1, 3, piece1);
  assert.equal(res1.success, true);
  player = res1.player;

  // Path now extends through (1,3)
  assert.equal(player.routeResult.length, 2);
  assert.equal(player.grid[3][1].isPartOfRoute, true);

  // Placing mismatched track (straight 0° which is N-S) at (1,2)
  const piece2: TrackPiece = {
    id: 'test-p2',
    type: 'straight',
    rotation: 0, // N-S
  };

  const res2 = placeTrackPiece(player, map, 1, 2, piece2);
  assert.equal(res2.success, true);
  player = res2.player;

  // Route does not connect to (1,2) because (1,3) exits 'E' not 'N'
  assert.equal(player.routeResult.length, 2);

  // Remove the mismatched piece
  player = removeTrackPiece(player, map, 1, 2);
  assert.equal(player.grid[2][1].type, 'empty');
});

test('Train Rush Engine - Complete route from Start to Destination awards victory points', () => {
  const map = MAP_PRESETS[0];
  const state = createInitialTrainRushState({ mapId: map.id });
  let player = state.players[0];

  // Obstacle is at (2,3), so path navigates around via row 4:
  player = placeTrackPiece(player, map, 1, 3, { id: 'p1', type: 'curve', rotation: 180 }).player;
  player = placeTrackPiece(player, map, 1, 4, { id: 'p2', type: 'curve', rotation: 0 }).player;
  player = placeTrackPiece(player, map, 2, 4, { id: 'p3', type: 'straight', rotation: 90 }).player;
  player = placeTrackPiece(player, map, 3, 4, { id: 'p4', type: 'straight', rotation: 90 }).player;
  player = placeTrackPiece(player, map, 4, 4, { id: 'p5', type: 'curve', rotation: 270 }).player;
  player = placeTrackPiece(player, map, 4, 3, { id: 'p6', type: 'curve', rotation: 90 }).player;
  player = placeTrackPiece(player, map, 5, 3, { id: 'p7', type: 'straight', rotation: 90 }).player;

  assert.equal(player.routeResult.isComplete, true);
  assert.equal(player.isFinished, true);
  assert.equal(player.routeResult.totalScore >= 800, true);
});

test('Train Rush Engine - Piece rotation and discard controls', () => {
  const state = createInitialTrainRushState();
  let player = state.players[0];
  const initialRot = player.currentPiece.rotation;

  player = rotateCurrentPiece(player);
  assert.equal(player.currentPiece.rotation, (initialRot + 90) % 360);

  const initialNextId = player.nextPiece.id;
  player = discardCurrentPiece(player);
  assert.equal(player.currentPiece.id, initialNextId);
});

test('Train Rush Engine - Bridge piece can be placed on water obstacles', () => {
  const canyonMap = MAP_PRESETS[1]; // Canyon Pass with water river
  const state = createInitialTrainRushState({ mapId: canyonMap.id });
  const player = state.players[0];

  // (3,1) is water obstacle. Non-bridge piece should be rejected
  const nonBridgePiece: TrackPiece = { id: 'nb-1', type: 'straight', rotation: 90 };
  const failRes = placeTrackPiece(player, canyonMap, 3, 1, nonBridgePiece);
  assert.equal(failRes.success, false);

  // Bridge piece placed on water should be allowed
  const bridgePiece: TrackPiece = { id: 'br-1', type: 'bridge', rotation: 90 };
  const okRes = placeTrackPiece(player, canyonMap, 3, 1, bridgePiece);
  assert.equal(okRes.success, true);
});

test('Train Rush Engine - Station pieces award bonus passenger points', () => {
  const map = MAP_PRESETS[0];
  const state = createInitialTrainRushState({ mapId: map.id });
  const player = state.players[0];

  // Place station piece at (1,3)
  const stationPiece: TrackPiece = { id: 'st-1', type: 'station', rotation: 90, bonusPoints: 150 };
  const res = placeTrackPiece(player, map, 1, 3, stationPiece);
  assert.equal(res.success, true);

  assert.equal(res.player.routeResult.stationsVisited, 1);
  assert.equal(res.player.routeResult.bonusScore >= 150, true);
});

test('Train Rush Engine - Round progression and bot simulation', () => {
  let state = createInitialTrainRushState({
    totalRounds: 2,
    roundDurationSeconds: 45,
    botCount: 2,
  });
  assert.equal(state.phase, 'lobby');
  assert.equal(state.players.length, 3);

  // Start Round 1
  state = startTrainRushRound(state, 1);
  assert.equal(state.phase, 'playing');
  assert.equal(state.currentRound.timeRemaining, 45);

  // Step engine with dt to verify bot simulation acts without error
  state.players[1].nextBotActionCooldown = 0.05;
  state = stepTrainRushEngine(state, 0.1);

  const bot = state.players[1];
  assert.equal(Boolean(bot.nextBotActionCooldown && bot.nextBotActionCooldown > 0), true);

  // Step engine by large dt to expire round timer
  state = stepTrainRushEngine(state, 50);
  assert.equal(state.phase, 'round-review');

  // Advance to Round 2
  state = startTrainRushRound(state, 2);
  assert.equal(state.phase, 'playing');
  assert.equal(state.currentRound.roundNumber, 2);

  // Expire final round
  state = stepTrainRushEngine(state, 50);
  assert.equal(state.phase, 'game-over');
});
