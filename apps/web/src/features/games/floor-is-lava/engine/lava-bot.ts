import type {
  ArenaState,
  LavaArenaConfig,
  LavaPlayer,
  TileData,
} from '../types/floor-is-lava.types';
import {
  BASE_PUSH_RADIUS,
  DEFAULT_ARENA_CONFIG,
  getTileAtPosition,
  type PlayerMoveInput,
} from './lava-tile-engine';

export function computeLavaBotDecision(
  bot: LavaPlayer,
  arena: ArenaState,
  config: LavaArenaConfig = DEFAULT_ARENA_CONFIG,
): PlayerMoveInput {
  if (!bot.isAlive) {
    return { moveX: 0, moveY: 0, push: false, jump: false };
  }

  const curTile = getTileAtPosition(bot.position, arena, config);
  const curTileSafe = curTile && curTile.state !== 'lava';
  const curTileUrgent =
    !curTileSafe || (curTile && (curTile.state === 'cracking' || curTile.stability < 0.3));

  // Find nearest high-stability safe tile
  let bestTile: TileData | null = null;
  let bestScore = -Infinity;

  const centerRow = config.rows / 2;
  const centerCol = config.cols / 2;

  arena.tiles.forEach((row) => {
    row.forEach((tile) => {
      if (tile.state === 'lava') return;

      const tileCenterX = tile.x + tile.size / 2;
      const tileCenterY = tile.y + tile.size / 2;
      const dist = Math.hypot(bot.position.x - tileCenterX, bot.position.y - tileCenterY);

      // Closeness to center increases score
      const centerDist = Math.hypot(tile.row - centerRow, tile.col - centerCol);
      const stabilityBonus = tile.stability * 100;
      const safeBonus = tile.state === 'safe' ? 60 : 20;

      // Score formula: prefer nearby, high stability, central tiles
      const score = stabilityBonus + safeBonus - dist * 0.4 - centerDist * 15;

      if (score > bestScore) {
        bestScore = score;
        bestTile = tile;
      }
    });
  });

  let moveX = 0;
  let moveY = 0;
  let jump = false;

  if (bestTile) {
    const targetX = (bestTile as TileData).x + (bestTile as TileData).size / 2;
    const targetY = (bestTile as TileData).y + (bestTile as TileData).size / 2;
    const dx = targetX - bot.position.x;
    const dy = targetY - bot.position.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 12) {
      moveX = dx / dist;
      moveY = dy / dist;
    }

    if (curTileUrgent && dist > config.tileSize && bot.hasDoubleJumpReady) {
      jump = true;
    }
  }

  // Tactical Push: check if opponents are nearby
  let push = false;
  if (bot.pushCooldown <= 0) {
    arena.players.forEach((target) => {
      if (target.id === bot.id || !target.isAlive) return;

      const pDist = Math.hypot(
        target.position.x - bot.position.x,
        target.position.y - bot.position.y,
      );

      if (pDist < BASE_PUSH_RADIUS) {
        // Push opponent if close
        push = true;
      }
    });
  }

  return {
    moveX,
    moveY,
    push,
    jump,
  };
}
