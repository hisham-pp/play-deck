import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createArenaGrid,
  createInitialBomberState,
  isTileBlocked,
  checkPlayerCollision,
  computeExplosionCells,
  stepBomberGame,
  getBotAction,
  GRID_WIDTH,
  GRID_HEIGHT,
} from './bomber-engine';
import type { Bomb, TileType } from './bomber-engine';

describe('Bomber Arena Engine', () => {
  describe('Grid Generation & Setup', () => {
    it('creates arena with correct dimensions and outer solid boundaries', () => {
      const grid = createArenaGrid(1001);
      assert.equal(grid.length, GRID_HEIGHT);
      assert.equal(grid[0].length, GRID_WIDTH);

      // Verify top and bottom boundaries are solid walls
      for (let x = 0; x < GRID_WIDTH; x++) {
        assert.equal(grid[0][x], 'solid_wall');
        assert.equal(grid[GRID_HEIGHT - 1][x], 'solid_wall');
      }

      // Verify left and right boundaries are solid walls
      for (let y = 0; y < GRID_HEIGHT; y++) {
        assert.equal(grid[y][0], 'solid_wall');
        assert.equal(grid[y][GRID_WIDTH - 1], 'solid_wall');
      }
    });

    it('enforces internal pillar pattern at even coordinate intersections', () => {
      const grid = createArenaGrid(1001);
      for (let y = 2; y < GRID_HEIGHT - 1; y += 2) {
        for (let x = 2; x < GRID_WIDTH - 1; x += 2) {
          assert.equal(grid[y][x], 'solid_wall');
        }
      }
    });

    it('preserves empty safe zones at spawn corners', () => {
      const grid = createArenaGrid(1001);
      // Top-left corner (1, 1), (1, 2), (2, 1)
      assert.equal(grid[1][1], 'empty');
      assert.equal(grid[1][2], 'empty');
      assert.equal(grid[2][1], 'empty');

      // Bottom-right corner
      assert.equal(grid[GRID_HEIGHT - 2][GRID_WIDTH - 2], 'empty');
      assert.equal(grid[GRID_HEIGHT - 3][GRID_WIDTH - 2], 'empty');
      assert.equal(grid[GRID_HEIGHT - 2][GRID_WIDTH - 3], 'empty');
    });

    it('initializes state with active players and standard match settings', () => {
      const state = createInitialBomberState();
      assert.equal(state.players.length, 4);
      assert.equal(state.status, 'playing');
      assert.equal(state.round, 1);
      assert.equal(state.bombs.length, 0);
      assert.equal(state.explosions.length, 0);

      // Verify player 1 is human, others are AI
      assert.equal(state.players[0].isAi, false);
      assert.equal(state.players[1].isAi, true);
    });
  });

  describe('Collision & Movement', () => {
    it('detects boundary out-of-bounds as blocked', () => {
      const grid = createArenaGrid(1001);
      assert.equal(isTileBlocked(-1, 0, grid, []), true);
      assert.equal(isTileBlocked(GRID_WIDTH, 5, grid, []), true);
      assert.equal(isTileBlocked(5, -1, grid, []), true);
      assert.equal(isTileBlocked(5, GRID_HEIGHT, grid, []), true);
    });

    it('detects active bomb on a tile as blocked', () => {
      const grid = createArenaGrid(1001);
      const bombs: Bomb[] = [
        {
          id: 'b1',
          ownerId: 'p1',
          tileX: 1,
          tileY: 1,
          plantedAt: 1000,
          fuseMs: 2500,
          blastRange: 2,
          exploded: false,
        },
      ];

      assert.equal(isTileBlocked(1, 1, grid, bombs), true);
      assert.equal(isTileBlocked(1, 1, grid, bombs, 'b1'), false);
    });

    it('prevents player from walking into solid walls', () => {
      const grid = createArenaGrid(1001);
      // Wall at (0, 1). Player at (1.5, 1.5) trying to walk left
      const collides = checkPlayerCollision(0.2, 1.5, 0.32, grid, []);
      assert.equal(collides, true);

      // Clear tile at (1.5, 1.5)
      const clear = checkPlayerCollision(1.5, 1.5, 0.32, grid, []);
      assert.equal(clear, false);
    });
  });

  describe('Explosion Propagation & Chain Reactions', () => {
    it('stops flame rays at solid walls', () => {
      const customGrid: TileType[][] = Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => 'empty' as TileType),
      );
      customGrid[1][2] = 'solid_wall'; // wall above center (2, 2)

      const bomb: Bomb = {
        id: 'test_b',
        ownerId: 'p1',
        tileX: 2,
        tileY: 2,
        plantedAt: 0,
        fuseMs: 2000,
        blastRange: 3,
        exploded: false,
      };

      const result = computeExplosionCells(bomb, customGrid, []);
      // Flame going up should not pass the solid wall at (2, 1)
      const upCell = result.cells.find((c) => c.tileX === 2 && c.tileY === 1);
      const pastUpCell = result.cells.find((c) => c.tileX === 2 && c.tileY === 0);

      assert.equal(upCell, undefined);
      assert.equal(pastUpCell, undefined);
    });

    it('destroys destructible blocks and stops ray at block', () => {
      const customGrid: TileType[][] = Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => 'empty' as TileType),
      );
      customGrid[2][3] = 'destructible_block'; // block to right of center (2, 2)

      const bomb: Bomb = {
        id: 'test_b',
        ownerId: 'p1',
        tileX: 2,
        tileY: 2,
        plantedAt: 0,
        fuseMs: 2000,
        blastRange: 3,
        exploded: false,
      };

      const result = computeExplosionCells(bomb, customGrid, []);
      assert.equal(result.destroyedBlocks.length, 1);
      assert.deepEqual(result.destroyedBlocks[0], { x: 3, y: 2 });

      // Ray should not reach (4, 2) past the destructible block
      const pastRight = result.cells.find((c) => c.tileX === 4 && c.tileY === 2);
      assert.equal(pastRight, undefined);
    });

    it('triggers adjacent bombs in blast line as chain reaction', () => {
      const customGrid: TileType[][] = Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => 'empty' as TileType),
      );

      const bombA: Bomb = {
        id: 'bombA',
        ownerId: 'p1',
        tileX: 2,
        tileY: 2,
        plantedAt: 0,
        fuseMs: 2000,
        blastRange: 2,
        exploded: false,
      };

      const bombB: Bomb = {
        id: 'bombB',
        ownerId: 'p2',
        tileX: 2,
        tileY: 3,
        plantedAt: 500,
        fuseMs: 2000,
        blastRange: 2,
        exploded: false,
      };

      const result = computeExplosionCells(bombA, customGrid, [bombA, bombB]);
      assert.equal(result.triggeredBombs.length, 1);
      assert.equal(result.triggeredBombs[0].id, 'bombB');
    });
  });

  describe('Game Loop & Progression', () => {
    it('allows player to place bomb and ticks countdown', () => {
      const state = createInitialBomberState();
      const actions = {
        p1: { moveX: 0, moveY: 0, placeBomb: true },
      };

      const nextState = stepBomberGame(state, actions, 100, 1000);
      assert.equal(nextState.bombs.length, 1);
      assert.equal(nextState.bombs[0].ownerId, 'p1');
      assert.equal(nextState.bombs[0].tileX, Math.floor(nextState.players[0].x));
    });

    it('upgrades player stats when picking up powerups', () => {
      const state = createInitialBomberState();
      const initialBlast = state.players[0].blastRange;

      // Place powerups directly under player 1
      state.powerUps.push({
        id: 'pu1',
        type: 'blast_range',
        tileX: Math.floor(state.players[0].x),
        tileY: Math.floor(state.players[0].y),
      });

      const nextState = stepBomberGame(state, {}, 16, 2000);
      assert.equal(nextState.players[0].blastRange, initialBlast + 1);
      assert.equal(nextState.powerUps.length, 0);
    });

    it('absorbs hit with shield without eliminating player', () => {
      const state = createInitialBomberState();
      state.players[0].hasShield = true;
      state.explosions.push({
        id: 'exp1',
        bombId: 'b1',
        ownerId: 'p2',
        createdAt: 1000,
        expiresAt: 2000,
        cells: [
          {
            tileX: Math.floor(state.players[0].x),
            tileY: Math.floor(state.players[0].y),
            isCenter: true,
          },
        ],
      });

      const nextState = stepBomberGame(state, {}, 50, 1100);
      assert.equal(nextState.players[0].alive, true);
      assert.equal(nextState.players[0].hasShield, false);
    });

    it('eliminates unshielded player in explosion and declares winner when 1 remains', () => {
      const state = createInitialBomberState();
      // Eliminate p3 and p4 manually
      state.players[2].alive = false;
      state.players[3].alive = false;

      // Explosion hits p2
      state.explosions.push({
        id: 'exp1',
        bombId: 'b1',
        ownerId: 'p1',
        createdAt: 1000,
        expiresAt: 2000,
        cells: [
          {
            tileX: Math.floor(state.players[1].x),
            tileY: Math.floor(state.players[1].y),
            isCenter: true,
          },
        ],
      });

      const nextState = stepBomberGame(state, {}, 50, 1100);
      assert.equal(nextState.players[1].alive, false);
      assert.equal(nextState.status, 'round_over');
      assert.equal(nextState.winnerId, 'p1');
    });
  });

  describe('Bot AI Behavior', () => {
    it('moves away from dangerous bomb blast zones', () => {
      const state = createInitialBomberState();
      const bot = state.players[1];
      const botTileX = Math.floor(bot.x);
      const botTileY = Math.floor(bot.y);

      // Place bomb directly on bot's tile
      state.bombs.push({
        id: 'threat_bomb',
        ownerId: 'p1',
        tileX: botTileX,
        tileY: botTileY,
        plantedAt: 1000,
        fuseMs: 2500,
        blastRange: 2,
        exploded: false,
      });

      const action = getBotAction(bot, state, 1500);
      // Bot must attempt to move away (moveX or moveY non-zero)
      const isMoving = action.moveX !== 0 || action.moveY !== 0;
      assert.equal(isMoving, true);
      assert.equal(action.placeBomb, false);
    });
  });
});
