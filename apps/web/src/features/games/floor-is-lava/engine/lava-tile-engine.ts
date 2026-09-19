import type {
  ArenaState,
  LavaArenaConfig,
  LavaPlayer,
  PowerUpInstance,
  PowerUpType,
  TileData,
  Vector2D,
} from '../types/floor-is-lava.types';

export const DEFAULT_ARENA_CONFIG: LavaArenaConfig = {
  rows: 10,
  cols: 10,
  tileSize: 54,
  tileGap: 6,
  lavaSpeedMultiplier: 1.0,
};

export const MOVE_SPEED = 240;
export const FRICTION = 900;
export const BASE_PUSH_RADIUS = 52;
export const SUPER_PUSH_RADIUS = 98;
export const BASE_PUSH_FORCE = 420;
export const SUPER_PUSH_FORCE = 880;
export const PUSH_COOLDOWN_SEC = 1.2;

export interface PlayerMoveInput {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  push: boolean;
  jump: boolean;
}

export function createInitialArena(
  players: LavaPlayer[],
  config: LavaArenaConfig = DEFAULT_ARENA_CONFIG,
): ArenaState {
  const { rows, cols, tileSize, tileGap } = config;
  const tiles: TileData[][] = [];

  for (let r = 0; r < rows; r++) {
    const rowTiles: TileData[] = [];
    for (let c = 0; c < cols; c++) {
      const x = c * (tileSize + tileGap);
      const y = r * (tileSize + tileGap);
      rowTiles.push({
        id: `tile-${r}-${c}`,
        row: r,
        col: c,
        x,
        y,
        size: tileSize,
        state: 'safe',
        stability: 1.0,
        warningTimer: 0,
        dwellSec: 0,
      });
    }
    tiles.push(rowTiles);
  }

  // Position players around the center safe zone
  const midR = Math.floor(rows / 2);
  const midC = Math.floor(cols / 2);

  const initializedPlayers = players.map((p, idx) => {
    // Offset each player symmetrically around the center 4 tiles
    const angle = (idx / Math.max(1, players.length)) * Math.PI * 2;
    const spawnRadius = tileSize * 1.5;
    const centerX = midC * (tileSize + tileGap) + tileSize / 2;
    const centerY = midR * (tileSize + tileGap) + tileSize / 2;

    const posX = centerX + Math.cos(angle) * spawnRadius;
    const posY = centerY + Math.sin(angle) * spawnRadius;

    return {
      ...p,
      isAlive: true,
      position: { x: posX, y: posY },
      velocity: { x: 0, y: 0 },
      radius: 16,
      pushCooldown: 0,
      isPushing: false,
      activePowerUp: null,
      hasDoubleJumpReady: false,
    };
  });

  return {
    tiles,
    players: initializedPlayers,
    powerUps: [],
    elapsedSec: 0,
    frozenSec: 0,
    isGameOver: false,
    winnerId: null,
  };
}

export function getTileAtPosition(
  pos: Vector2D,
  arena: ArenaState,
  config: LavaArenaConfig = DEFAULT_ARENA_CONFIG,
): TileData | null {
  const { tileSize, tileGap, rows, cols } = config;
  const pitch = tileSize + tileGap;

  const col = Math.floor(pos.x / pitch);
  const row = Math.floor(pos.y / pitch);

  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    return null;
  }

  return arena.tiles[row][col] ?? null;
}

export function updateTileStates(arena: ArenaState, config: LavaArenaConfig, dt: number): void {
  if (arena.isGameOver) return;

  arena.elapsedSec += dt;

  if (arena.frozenSec > 0) {
    arena.frozenSec = Math.max(0, arena.frozenSec - dt);
    return;
  }

  const { rows, cols } = config;

  // Track tiles occupied by alive players
  const occupiedSet = new Set<string>();
  arena.players.forEach((p) => {
    if (p.isAlive) {
      const tile = getTileAtPosition(p.position, arena, config);
      if (tile) {
        occupiedSet.add(tile.id);
      }
    }
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = arena.tiles[r][c];

      // Handle temporary platforms
      if (tile.state === 'temporary') {
        if (tile.temporaryLifetime !== undefined) {
          tile.temporaryLifetime -= dt;
          if (tile.temporaryLifetime <= 0) {
            tile.state = 'lava';
            tile.stability = 0;
          }
        }
        continue;
      }

      if (tile.state === 'lava') continue;

      // Distance from perimeter (0 is outermost border ring)
      const ringDepth = Math.min(r, c, rows - 1 - r, cols - 1 - c);

      // Outer rings begin degrading earlier
      const ringStartSec = 3.0 + ringDepth * 8.5;
      const isDweltOn = occupiedSet.has(tile.id);

      if (isDweltOn) {
        tile.dwellSec += dt;
      }

      if (arena.elapsedSec >= ringStartSec) {
        // Natural ring decay rate
        const baseDecay = 0.08 * config.lavaSpeedMultiplier;
        // Dwell penalty accelerates cracking
        const dwellPenalty = isDweltOn ? 0.25 : 0;
        tile.stability = Math.max(0, tile.stability - (baseDecay + dwellPenalty) * dt);
      } else if (isDweltOn && tile.dwellSec > 2.5) {
        // Premature cracking from standing in one spot too long
        tile.stability = Math.max(0, tile.stability - 0.2 * dt);
      }

      // State transitions based on stability threshold
      if (tile.stability <= 0) {
        tile.state = 'lava';
      } else if (tile.stability < 0.35) {
        tile.state = 'cracking';
      } else if (tile.stability < 0.7) {
        tile.state = 'warning';
      }
    }
  }
}

export function executePush(
  pusher: LavaPlayer,
  arena: ArenaState,
): { targets: LavaPlayer[]; force: number } {
  if (pusher.pushCooldown > 0 || !pusher.isAlive) {
    return { targets: [], force: 0 };
  }

  const isSuper = pusher.activePowerUp?.type === 'super-push';
  const radius = isSuper ? SUPER_PUSH_RADIUS : BASE_PUSH_RADIUS;
  const force = isSuper ? SUPER_PUSH_FORCE : BASE_PUSH_FORCE;

  pusher.pushCooldown = PUSH_COOLDOWN_SEC;
  pusher.isPushing = true;

  const hitTargets: LavaPlayer[] = [];

  arena.players.forEach((target) => {
    if (target.id === pusher.id || !target.isAlive) return;

    const dx = target.position.x - pusher.position.x;
    const dy = target.position.y - pusher.position.y;
    const dist = Math.hypot(dx, dy);

    if (dist < radius && dist > 0.001) {
      const nx = dx / dist;
      const ny = dy / dist;
      target.velocity.x += nx * force;
      target.velocity.y += ny * force;
      hitTargets.push(target);
    }
  });

  return { targets: hitTargets, force };
}

export function applyPowerUp(
  player: LavaPlayer,
  powerUp: PowerUpInstance,
  arena: ArenaState,
  config: LavaArenaConfig,
): void {
  switch (powerUp.type) {
    case 'platform': {
      // Find adjacent or nearest lava tile and restore as temporary platform
      const curTile = getTileAtPosition(player.position, arena, config);
      if (curTile) {
        const { rows, cols } = config;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = curTile.row + dr;
            const nc = curTile.col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const targetTile = arena.tiles[nr][nc];
              if (targetTile.state === 'lava') {
                targetTile.state = 'temporary';
                targetTile.temporaryLifetime = 8.0;
                targetTile.stability = 1.0;
                break;
              }
            }
          }
        }
      }
      break;
    }

    case 'super-push': {
      player.activePowerUp = {
        type: 'super-push',
        durationSec: 8.0,
      };
      break;
    }

    case 'freeze': {
      arena.frozenSec = 6.0;
      player.activePowerUp = {
        type: 'freeze',
        durationSec: 6.0,
      };
      break;
    }

    case 'double-jump': {
      player.hasDoubleJumpReady = true;
      player.activePowerUp = {
        type: 'double-jump',
        durationSec: 10.0,
      };
      break;
    }
  }
}

export function spawnPowerUps(arena: ArenaState, _config: LavaArenaConfig): void {
  if (arena.powerUps.length >= 3) return;

  // Chance to spawn
  if (Math.random() > 0.4) return;

  const safeTiles: TileData[] = [];
  arena.tiles.forEach((row) => {
    row.forEach((tile) => {
      if (tile.state === 'safe' || tile.state === 'warning') {
        safeTiles.push(tile);
      }
    });
  });

  if (safeTiles.length === 0) return;

  const chosenTile = safeTiles[Math.floor(Math.random() * safeTiles.length)];
  const types: PowerUpType[] = ['platform', 'super-push', 'freeze', 'double-jump'];
  const type = types[Math.floor(Math.random() * types.length)];

  arena.powerUps.push({
    id: `pw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    x: chosenTile.x + chosenTile.size / 2,
    y: chosenTile.y + chosenTile.size / 2,
    row: chosenTile.row,
    col: chosenTile.col,
    spawnTime: arena.elapsedSec,
  });
}

export function updateLavaPhysics(
  arena: ArenaState,
  inputs: Record<string, PlayerMoveInput>,
  config: LavaArenaConfig,
  dt: number,
): {
  eliminatedIds: string[];
  powerUpCollected: { playerId: string; type: PowerUpType } | null;
} {
  const eliminatedIds: string[] = [];
  let powerUpCollected: { playerId: string; type: PowerUpType } | null = null;

  updateTileStates(arena, config, dt);

  // Update players
  arena.players.forEach((player) => {
    if (!player.isAlive) return;

    const input = inputs[player.id] || {
      moveX: 0,
      moveY: 0,
      push: false,
      jump: false,
    };

    // Cooldown reductions
    if (player.pushCooldown > 0) {
      player.pushCooldown = Math.max(0, player.pushCooldown - dt);
    }
    if (player.pushCooldown < PUSH_COOLDOWN_SEC - 0.2) {
      player.isPushing = false;
    }

    if (player.activePowerUp) {
      player.activePowerUp.durationSec -= dt;
      if (player.activePowerUp.durationSec <= 0) {
        player.activePowerUp = null;
      }
    }

    // Apply movement input
    const inputLen = Math.hypot(input.moveX, input.moveY);
    if (inputLen > 0.05) {
      const dirX = input.moveX / inputLen;
      const dirY = input.moveY / inputLen;
      player.velocity.x += dirX * MOVE_SPEED * 8 * dt;
      player.velocity.y += dirY * MOVE_SPEED * 8 * dt;
    } else {
      // Friction
      const speed = Math.hypot(player.velocity.x, player.velocity.y);
      if (speed > 0) {
        const drop = FRICTION * dt;
        const newSpeed = Math.max(0, speed - drop);
        player.velocity.x = (player.velocity.x / speed) * newSpeed;
        player.velocity.y = (player.velocity.y / speed) * newSpeed;
      }
    }

    // Clamp max velocity
    const currentSpeed = Math.hypot(player.velocity.x, player.velocity.y);
    if (currentSpeed > MOVE_SPEED * 2.5) {
      player.velocity.x = (player.velocity.x / currentSpeed) * (MOVE_SPEED * 2.5);
      player.velocity.y = (player.velocity.y / currentSpeed) * (MOVE_SPEED * 2.5);
    }

    // Double Jump / Leap
    if (input.jump && player.hasDoubleJumpReady) {
      player.hasDoubleJumpReady = false;
      const jumpBoost = 350;
      const jDirX = input.moveX !== 0 ? input.moveX : 1;
      const jDirY = input.moveY !== 0 ? input.moveY : 0;
      const jLen = Math.hypot(jDirX, jDirY);
      player.velocity.x += (jDirX / jLen) * jumpBoost;
      player.velocity.y += (jDirY / jLen) * jumpBoost;
    }

    // Integrate position
    player.position.x += player.velocity.x * dt;
    player.position.y += player.velocity.y * dt;

    // Check if player stepped into lava
    const curTile = getTileAtPosition(player.position, arena, config);
    if (!curTile || curTile.state === 'lava') {
      player.isAlive = false;
      eliminatedIds.push(player.id);
    }

    // Check power-up collection
    if (player.isAlive) {
      for (let i = arena.powerUps.length - 1; i >= 0; i--) {
        const pw = arena.powerUps[i];
        const dist = Math.hypot(player.position.x - pw.x, player.position.y - pw.y);
        if (dist < player.radius + 18) {
          applyPowerUp(player, pw, arena, config);
          powerUpCollected = { playerId: player.id, type: pw.type };
          arena.powerUps.splice(i, 1);
          break;
        }
      }
    }

    // Check push trigger
    if (input.push && player.pushCooldown <= 0) {
      executePush(player, arena);
    }
  });

  // Assign elimination ranks
  const alivePlayers = arena.players.filter((p) => p.isAlive);
  if (alivePlayers.length <= 1 && !arena.isGameOver) {
    arena.isGameOver = true;
    arena.winnerId = alivePlayers[0]?.id ?? null;
  }

  return { eliminatedIds, powerUpCollected };
}
