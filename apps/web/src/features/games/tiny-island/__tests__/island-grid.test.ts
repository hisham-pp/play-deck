import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateNextShrinkWave,
  generateIslandGrid,
  getAdjacentCoords,
  getDistanceFromCenter,
  getSpawnCoordinates,
  isAdjacent,
  isInBounds,
  isTileWalkable,
} from '../engine/tiny-island-grid';

describe('Tiny Island Grid — Generation & Adjacency', () => {
  it('generates a 9x9 circular tropical island grid', () => {
    const tiles = generateIslandGrid(9);
    assert.equal(tiles.length, 9);
    assert.equal(tiles[0].length, 9);

    // Center tile (4,4) should be land with stone or vegetation
    const centerTile = tiles[4][4];
    assert.notEqual(centerTile.type, 'water');
    assert.equal(centerTile.sinkingState, 'dry');

    // Corner tiles (0,0), (8,8) should be submerged ocean
    assert.equal(tiles[0][0].type, 'water');
    assert.equal(tiles[0][0].sinkingState, 'submerged');
    assert.equal(tiles[8][8].type, 'water');
    assert.equal(tiles[8][8].sinkingState, 'submerged');
  });

  it('correctly calculates orthogonal adjacency and boundaries', () => {
    assert.equal(isInBounds(0, 0, 9), true);
    assert.equal(isInBounds(8, 8, 9), true);
    assert.equal(isInBounds(-1, 0, 9), false);
    assert.equal(isInBounds(9, 4, 9), false);

    assert.equal(isAdjacent({ x: 4, y: 4 }, { x: 4, y: 5 }), true);
    assert.equal(isAdjacent({ x: 4, y: 4 }, { x: 5, y: 4 }), true);
    assert.equal(isAdjacent({ x: 4, y: 4 }, { x: 5, y: 5 }), false); // diagonal is not orthogonally adjacent

    const neighbors = getAdjacentCoords({ x: 0, y: 0 }, 9);
    assert.equal(neighbors.length, 2); // Corner has 2 neighbors
    const centerNeighbors = getAdjacentCoords({ x: 4, y: 4 }, 9);
    assert.equal(centerNeighbors.length, 4); // Center has 4 neighbors
  });

  it('evaluates tile walkability with bridges and barriers', () => {
    // Normal dry sand is walkable
    assert.equal(
      isTileWalkable({
        x: 4,
        y: 4,
        type: 'sand',
        baseType: 'sand',
        sinkingState: 'dry',
        resource: null,
        resourceCount: 0,
      }),
      true,
    );

    // Open water or submerged tile is NOT walkable
    assert.equal(
      isTileWalkable({
        x: 0,
        y: 0,
        type: 'water',
        baseType: 'water',
        sinkingState: 'submerged',
        resource: null,
        resourceCount: 0,
      }),
      false,
    );

    // Wooden bridge built on water IS walkable
    assert.equal(
      isTileWalkable({
        x: 0,
        y: 0,
        type: 'bridge',
        baseType: 'water',
        sinkingState: 'dry',
        resource: null,
        resourceCount: 0,
      }),
      true,
    );

    // Stone barrier blocks movement
    assert.equal(
      isTileWalkable({
        x: 4,
        y: 4,
        type: 'barrier',
        baseType: 'grass',
        sinkingState: 'dry',
        resource: null,
        resourceCount: 0,
      }),
      false,
    );
  });

  it('calculates shrinking waves with warnings before submerging', () => {
    const tiles = generateIslandGrid(9);
    const wave1 = calculateNextShrinkWave(tiles, 1, 9);
    assert.ok(wave1.newlyWarning.length > 0, 'Round 1 should mark perimeter warnings');

    // Round 3 should progressively submerge outer tiles
    const wave3 = calculateNextShrinkWave(tiles, 3, 9);
    assert.ok(wave3.newlySubmerged.length > 0, 'Round 3 should submerge outer ring');
  });

  it('generates distributed spawn coordinates for 2-6 players', () => {
    const spawns2 = getSpawnCoordinates(2, 9);
    assert.equal(spawns2.length, 2);
    assert.notDeepEqual(spawns2[0], spawns2[1]);

    const spawns6 = getSpawnCoordinates(6, 9);
    assert.equal(spawns6.length, 6);
    spawns6.forEach((coord) => {
      assert.ok(isInBounds(coord.x, coord.y, 9));
      assert.ok(getDistanceFromCenter(coord.x, coord.y) > 0);
    });
  });
});
