/**
 * Bomber Arena Game Engine
 * Pure TypeScript, framework-agnostic implementation of classic top-down grid bomber mechanics.
 */

export const GRID_WIDTH = 13;
export const GRID_HEIGHT = 11;
export const BOMB_FUSE_MS = 2500;
export const EXPLOSION_DURATION_MS = 500;
export const BASE_PLAYER_SPEED = 2.8; // tiles per second
export const PLAYER_COLLISION_RADIUS = 0.32;

export type TileType = 'empty' | 'solid_wall' | 'destructible_block';

export type PowerUpType = 'extra_bomb' | 'blast_range' | 'speed_up' | 'shield';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  tileX: number;
  tileY: number;
}

export interface Bomb {
  id: string;
  ownerId: string;
  tileX: number;
  tileY: number;
  plantedAt: number;
  fuseMs: number;
  blastRange: number;
  exploded: boolean;
}

export interface FlameCell {
  tileX: number;
  tileY: number;
  isCenter: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface ActiveExplosion {
  id: string;
  bombId: string;
  ownerId: string;
  createdAt: number;
  expiresAt: number;
  cells: FlameCell[];
}

export interface BomberPlayer {
  id: string;
  name: string;
  color: string;
  isAi: boolean;
  x: number; // floating tile coordinates
  y: number;
  alive: boolean;
  maxBombs: number;
  blastRange: number;
  speed: number;
  hasShield: boolean;
  score: number;
  kills: number;
  facing: 'up' | 'down' | 'left' | 'right';
  invulnerableUntil: number;
}

export type ArenaGameStatus = 'waiting' | 'playing' | 'round_over' | 'match_over';

export interface BomberArenaState {
  grid: TileType[][]; // [y][x]
  players: BomberPlayer[];
  bombs: Bomb[];
  explosions: ActiveExplosion[];
  powerUps: PowerUp[];
  status: ArenaGameStatus;
  winnerId: string | null;
  round: number;
  maxRounds: number;
  elapsedTimeMs: number;
  roundTimerMs: number;
}

export interface PlayerAction {
  moveX: number; // -1, 0, 1
  moveY: number; // -1, 0, 1
  placeBomb: boolean;
}

export const SPAWN_POSITIONS: { x: number; y: number }[] = [
  { x: 1, y: 1 }, // Top-left
  { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 }, // Bottom-right
  { x: GRID_WIDTH - 2, y: 1 }, // Top-right
  { x: 1, y: GRID_HEIGHT - 2 }, // Bottom-left
];

export const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

/**
 * Creates the initial arena grid with indestructible pillars and random destructible crates.
 */
export function createArenaGrid(seed = 12345): TileType[][] {
  const grid: TileType[][] = [];

  // Simple pseudo-random generator for deterministic testing
  let s = seed;
  const nextRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Safe zones around spawns that must stay clear of destructible blocks
  const safeCoords = new Set<string>();
  for (const pos of SPAWN_POSITIONS) {
    safeCoords.add(`${pos.x},${pos.y}`);
    safeCoords.add(`${pos.x + 1},${pos.y}`);
    safeCoords.add(`${pos.x - 1},${pos.y}`);
    safeCoords.add(`${pos.x},${pos.y + 1}`);
    safeCoords.add(`${pos.x},${pos.y - 1}`);
  }

  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      // Outer boundaries are solid walls
      if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
        row.push('solid_wall');
      }
      // Fixed internal pillar checkerboard
      else if (x % 2 === 0 && y % 2 === 0) {
        row.push('solid_wall');
      }
      // Keep spawn corners and immediate adjacent tiles clear
      else if (safeCoords.has(`${x},${y}`)) {
        row.push('empty');
      }
      // Fill ~65% of remaining tiles with destructible blocks
      else if (nextRandom() < 0.65) {
        row.push('destructible_block');
      } else {
        row.push('empty');
      }
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Initialize a new Bomber Arena game state.
 */
export function createInitialBomberState(
  playerConfigs: { name: string; isAi: boolean }[] = [
    { name: 'Player 1', isAi: false },
    { name: 'NitroBot', isAi: true },
    { name: 'BlastBot', isAi: true },
    { name: 'SparkBot', isAi: true },
  ],
  maxRounds = 3,
): BomberArenaState {
  const grid = createArenaGrid(Date.now() % 100000);
  const players: BomberPlayer[] = playerConfigs.slice(0, 4).map((cfg, idx) => {
    const spawn = SPAWN_POSITIONS[idx] || SPAWN_POSITIONS[0];
    return {
      id: `p${idx + 1}`,
      name: cfg.name,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
      isAi: cfg.isAi,
      x: spawn.x + 0.5,
      y: spawn.y + 0.5,
      alive: true,
      maxBombs: 1,
      blastRange: 2,
      speed: BASE_PLAYER_SPEED,
      hasShield: false,
      score: 0,
      kills: 0,
      facing: idx === 0 ? 'down' : idx === 1 ? 'up' : 'down',
      invulnerableUntil: 0,
    };
  });

  return {
    grid,
    players,
    bombs: [],
    explosions: [],
    powerUps: [],
    status: 'playing',
    winnerId: null,
    round: 1,
    maxRounds,
    elapsedTimeMs: 0,
    roundTimerMs: 120000, // 2 minutes per round
  };
}

/**
 * Check if a tile coordinate is blocked by walls, blocks, or active bombs.
 */
export function isTileBlocked(
  tileX: number,
  tileY: number,
  grid: TileType[][],
  bombs: Bomb[],
  ignoreBombId?: string,
): boolean {
  if (tileX < 0 || tileX >= GRID_WIDTH || tileY < 0 || tileY >= GRID_HEIGHT) {
    return true;
  }
  const cell = grid[tileY]?.[tileX];
  if (cell === 'solid_wall' || cell === 'destructible_block') {
    return true;
  }
  // Check if tile has a bomb
  const hasBomb = bombs.some(
    (b) => !b.exploded && b.tileX === tileX && b.tileY === tileY && b.id !== ignoreBombId,
  );
  return hasBomb;
}

/**
 * Validates whether a player at (x, y) collides with blocked tiles.
 */
export function checkPlayerCollision(
  newX: number,
  newY: number,
  radius: number,
  grid: TileType[][],
  bombs: Bomb[],
  allowedBombTile?: { x: number; y: number } | null,
): boolean {
  const minTileX = Math.floor(newX - radius);
  const maxTileX = Math.floor(newX + radius);
  const minTileY = Math.floor(newY - radius);
  const maxTileY = Math.floor(newY + radius);

  for (let ty = minTileY; ty <= maxTileY; ty++) {
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      if (allowedBombTile && tx === allowedBombTile.x && ty === allowedBombTile.y) {
        // Player is currently stepping off the bomb they just planted
        continue;
      }
      if (isTileBlocked(tx, ty, grid, bombs)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Calculates flame explosion cells in 4 cardinal directions.
 */
export function computeExplosionCells(
  bomb: Bomb,
  grid: TileType[][],
  existingBombs: Bomb[],
): {
  cells: FlameCell[];
  destroyedBlocks: { x: number; y: number }[];
  triggeredBombs: Bomb[];
} {
  const cells: FlameCell[] = [{ tileX: bomb.tileX, tileY: bomb.tileY, isCenter: true }];
  const destroyedBlocks: { x: number; y: number }[] = [];
  const triggeredBombs: Bomb[] = [];

  const directions: { dir: 'up' | 'down' | 'left' | 'right'; dx: number; dy: number }[] = [
    { dir: 'up', dx: 0, dy: -1 },
    { dir: 'down', dx: 0, dy: 1 },
    { dir: 'left', dx: -1, dy: 0 },
    { dir: 'right', dx: 1, dy: 0 },
  ];

  for (const { dir, dx, dy } of directions) {
    for (let step = 1; step <= bomb.blastRange; step++) {
      const tx = bomb.tileX + dx * step;
      const ty = bomb.tileY + dy * step;

      // Solid wall stops flames completely without penetration
      if (tx < 0 || tx >= GRID_WIDTH || ty < 0 || ty >= GRID_HEIGHT) break;
      const tile = grid[ty]?.[tx];
      if (tile === 'solid_wall') break;

      cells.push({ tileX: tx, tileY: ty, isCenter: false, direction: dir });

      // Destructible block stops flame after destroying the block
      if (tile === 'destructible_block') {
        destroyedBlocks.push({ x: tx, y: ty });
        break;
      }

      // Check if another bomb is in the blast line (chain reaction)
      const chainedBomb = existingBombs.find(
        (b) => !b.exploded && b.tileX === tx && b.tileY === ty && b.id !== bomb.id,
      );
      if (chainedBomb) {
        triggeredBombs.push(chainedBomb);
      }
    }
  }

  return { cells, destroyedBlocks, triggeredBombs };
}

/**
 * Advances the Bomber Arena game state by delta time in milliseconds.
 */
export function stepBomberGame(
  state: BomberArenaState,
  actions: Record<string, PlayerAction>,
  deltaMs: number,
  now = Date.now(),
): BomberArenaState {
  if (state.status !== 'playing') {
    return state;
  }

  const dtSec = Math.min(deltaMs / 1000, 0.1);
  const nextElapsedTime = state.elapsedTimeMs + deltaMs;
  const nextRoundTimer = Math.max(0, state.roundTimerMs - deltaMs);

  const grid = state.grid.map((row) => [...row]);
  let powerUps = [...state.powerUps];
  let bombs = [...state.bombs];
  const explosions = state.explosions.filter((e) => now < e.expiresAt);
  const players = state.players.map((p) => ({ ...p }));

  // 1. Process Bomb Detonations & Chain Reactions
  const bombsToDetonate: Bomb[] = [];
  for (const bomb of bombs) {
    if (!bomb.exploded && now - bomb.plantedAt >= bomb.fuseMs) {
      bombsToDetonate.push(bomb);
    }
  }

  const detonatedBombIds = new Set<string>();

  while (bombsToDetonate.length > 0) {
    const bomb = bombsToDetonate.shift()!;
    if (detonatedBombIds.has(bomb.id)) continue;
    detonatedBombIds.add(bomb.id);
    bomb.exploded = true;

    const { cells, destroyedBlocks, triggeredBombs } = computeExplosionCells(bomb, grid, bombs);

    explosions.push({
      id: `exp_${bomb.id}_${now}`,
      bombId: bomb.id,
      ownerId: bomb.ownerId,
      createdAt: now,
      expiresAt: now + EXPLOSION_DURATION_MS,
      cells,
    });

    // Destroy blocks and roll for powerups
    for (const block of destroyedBlocks) {
      grid[block.y][block.x] = 'empty';
      // 40% chance to drop powerup
      const rand = ((block.x * 37 + block.y * 19 + now) % 100) / 100;
      if (rand < 0.45) {
        const types: PowerUpType[] = ['extra_bomb', 'blast_range', 'speed_up', 'shield'];
        const typeIdx = Math.floor(((block.x * 13 + block.y * 7 + now) % 100) / 25);
        powerUps.push({
          id: `pu_${block.x}_${block.y}_${now}`,
          type: types[typeIdx % types.length],
          tileX: block.x,
          tileY: block.y,
        });
      }
    }

    // Chain-trigger adjacent bombs
    for (const chained of triggeredBombs) {
      if (!detonatedBombIds.has(chained.id)) {
        bombsToDetonate.push(chained);
      }
    }
  }

  // Remove detonated bombs
  bombs = bombs.filter((b) => !detonatedBombIds.has(b.id));

  // 2. Process Player Movement & Actions
  for (const player of players) {
    if (!player.alive) continue;

    const action = actions[player.id] || { moveX: 0, moveY: 0, placeBomb: false };

    // Facing direction
    if (action.moveY < -0.3) player.facing = 'up';
    else if (action.moveY > 0.3) player.facing = 'down';
    else if (action.moveX < -0.3) player.facing = 'left';
    else if (action.moveX > 0.3) player.facing = 'right';

    // Move player with sliding collision detection along axes
    const moveDist = player.speed * dtSec;
    const currentTileX = Math.floor(player.x);
    const currentTileY = Math.floor(player.y);

    // If standing on a bomb, allow moving away without self-collision
    const onBomb = bombs.find((b) => b.tileX === currentTileX && b.tileY === currentTileY);
    const allowedBombTile = onBomb ? { x: currentTileX, y: currentTileY } : null;

    let targetX = player.x;
    let targetY = player.y;

    if (action.moveX !== 0) {
      const stepX = Math.sign(action.moveX) * moveDist;
      const canMoveX = !checkPlayerCollision(
        player.x + stepX,
        player.y,
        PLAYER_COLLISION_RADIUS,
        grid,
        bombs,
        allowedBombTile,
      );
      if (canMoveX) {
        targetX += stepX;
      }
    }

    if (action.moveY !== 0) {
      const stepY = Math.sign(action.moveY) * moveDist;
      const canMoveY = !checkPlayerCollision(
        targetX,
        player.y + stepY,
        PLAYER_COLLISION_RADIUS,
        grid,
        bombs,
        allowedBombTile,
      );
      if (canMoveY) {
        targetY += stepY;
      }
    }

    player.x = targetX;
    player.y = targetY;

    // Bomb Placement
    if (action.placeBomb) {
      const pTileX = Math.floor(player.x);
      const pTileY = Math.floor(player.y);
      const activePlayerBombs = bombs.filter((b) => b.ownerId === player.id).length;

      const tileAlreadyHasBomb = bombs.some((b) => b.tileX === pTileX && b.tileY === pTileY);

      if (activePlayerBombs < player.maxBombs && !tileAlreadyHasBomb) {
        bombs.push({
          id: `bomb_${player.id}_${now}_${bombs.length}`,
          ownerId: player.id,
          tileX: pTileX,
          tileY: pTileY,
          plantedAt: now,
          fuseMs: BOMB_FUSE_MS,
          blastRange: player.blastRange,
          exploded: false,
        });
      }
    }

    // 3. Power-Up Pickups
    const pTileX = Math.floor(player.x);
    const pTileY = Math.floor(player.y);
    const pickupIdx = powerUps.findIndex((pu) => pu.tileX === pTileX && pu.tileY === pTileY);

    if (pickupIdx !== -1) {
      const pu = powerUps[pickupIdx];
      powerUps.splice(pickupIdx, 1);
      player.score += 50;

      if (pu.type === 'extra_bomb') {
        player.maxBombs = Math.min(5, player.maxBombs + 1);
      } else if (pu.type === 'blast_range') {
        player.blastRange = Math.min(6, player.blastRange + 1);
      } else if (pu.type === 'speed_up') {
        player.speed = Math.min(4.5, player.speed + 0.4);
      } else if (pu.type === 'shield') {
        player.hasShield = true;
      }
    }
  }

  // 4. Check Explosion Collisions with Players & Power-ups
  for (const exp of explosions) {
    for (const cell of exp.cells) {
      // Destroy power-ups caught in flame
      powerUps = powerUps.filter((pu) => !(pu.tileX === cell.tileX && pu.tileY === cell.tileY));

      // Damage players caught in flame
      for (const player of players) {
        if (!player.alive) continue;
        if (now < player.invulnerableUntil) continue;

        const pMinX = player.x - PLAYER_COLLISION_RADIUS;
        const pMaxX = player.x + PLAYER_COLLISION_RADIUS;
        const pMinY = player.y - PLAYER_COLLISION_RADIUS;
        const pMaxY = player.y + PLAYER_COLLISION_RADIUS;

        // Cell bounding box
        const cMinX = cell.tileX;
        const cMaxX = cell.tileX + 1;
        const cMinY = cell.tileY;
        const cMaxY = cell.tileY + 1;

        const overlaps = pMinX < cMaxX && pMaxX > cMinX && pMinY < cMaxY && pMaxY > cMinY;

        if (overlaps) {
          if (player.hasShield) {
            player.hasShield = false;
            player.invulnerableUntil = now + 1200; // temporary invulnerability
          } else {
            player.alive = false;
            // Award kill to bomb owner if different
            if (exp.ownerId !== player.id) {
              const killer = players.find((p) => p.id === exp.ownerId);
              if (killer) {
                killer.kills += 1;
                killer.score += 200;
              }
            }
          }
        }
      }
    }
  }

  // 5. Evaluate Round / Match End
  const alivePlayers = players.filter((p) => p.alive);
  let status: ArenaGameStatus = state.status;
  let winnerId: string | null = state.winnerId;

  if (alivePlayers.length <= 1 || nextRoundTimer <= 0) {
    status = 'round_over';
    if (alivePlayers.length === 1) {
      winnerId = alivePlayers[0].id;
      alivePlayers[0].score += 500;
    } else {
      winnerId = null; // Draw
    }
  }

  return {
    ...state,
    grid,
    players,
    bombs,
    explosions,
    powerUps,
    status,
    winnerId,
    elapsedTimeMs: nextElapsedTime,
    roundTimerMs: nextRoundTimer,
  };
}

/**
 * Intelligent AI bot controller.
 * Evaluates safe paths, danger avoidance from active bombs/flames, powerup collection, and tactical bombing.
 */
export function getBotAction(
  bot: BomberPlayer,
  state: BomberArenaState,
  _now = Date.now(),
): PlayerAction {
  if (!bot.alive || state.status !== 'playing') {
    return { moveX: 0, moveY: 0, placeBomb: false };
  }

  const botTileX = Math.floor(bot.x);
  const botTileY = Math.floor(bot.y);

  // 1. Identify danger tiles (active explosions and potential bomb blast zones)
  const dangerTiles = new Set<string>();

  for (const exp of state.explosions) {
    for (const cell of exp.cells) {
      dangerTiles.add(`${cell.tileX},${cell.tileY}`);
    }
  }

  for (const bomb of state.bombs) {
    const { cells } = computeExplosionCells(bomb, state.grid, state.bombs);
    for (const cell of cells) {
      dangerTiles.add(`${cell.tileX},${cell.tileY}`);
    }
  }

  const isCurrentTileDangerous = dangerTiles.has(`${botTileX},${botTileY}`);

  // Cardinal directions
  const directions: { dx: number; dy: number }[] = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  // If in danger, urgently seek the nearest non-dangerous empty tile
  if (isCurrentTileDangerous) {
    for (const { dx, dy } of directions) {
      const tx = botTileX + dx;
      const ty = botTileY + dy;
      if (!isTileBlocked(tx, ty, state.grid, state.bombs) && !dangerTiles.has(`${tx},${ty}`)) {
        return { moveX: dx, moveY: dy, placeBomb: false };
      }
    }
    // If adjacent tiles are also dangerous, just step toward any open tile
    for (const { dx, dy } of directions) {
      const tx = botTileX + dx;
      const ty = botTileY + dy;
      if (!isTileBlocked(tx, ty, state.grid, state.bombs)) {
        return { moveX: dx, moveY: dy, placeBomb: false };
      }
    }
  }

  // 2. Safe State: Seek Power-ups if available
  if (state.powerUps.length > 0) {
    let closestPu: PowerUp | null = null;
    let minDist = Infinity;
    for (const pu of state.powerUps) {
      const dist = Math.abs(pu.tileX - botTileX) + Math.abs(pu.tileY - botTileY);
      if (dist < minDist && !dangerTiles.has(`${pu.tileX},${pu.tileY}`)) {
        minDist = dist;
        closestPu = pu;
      }
    }

    if (closestPu) {
      const dx = Math.sign(closestPu.tileX - botTileX);
      const dy = Math.sign(closestPu.tileY - botTileY);
      if (dx !== 0 && !isTileBlocked(botTileX + dx, botTileY, state.grid, state.bombs)) {
        return { moveX: dx, moveY: 0, placeBomb: false };
      }
      if (dy !== 0 && !isTileBlocked(botTileX, botTileY + dy, state.grid, state.bombs)) {
        return { moveX: 0, moveY: dy, placeBomb: false };
      }
    }
  }

  // 3. Tactical Bomb Placement:
  // If adjacent to a destructible block or an enemy player, place a bomb if an escape route exists!
  let adjacentDestructible = false;
  let adjacentEnemy = false;

  for (const { dx, dy } of directions) {
    const tx = botTileX + dx;
    const ty = botTileY + dy;
    if (state.grid[ty]?.[tx] === 'destructible_block') {
      adjacentDestructible = true;
    }
    const enemyNear = state.players.some(
      (p) => p.id !== bot.id && p.alive && Math.floor(p.x) === tx && Math.floor(p.y) === ty,
    );
    if (enemyNear) {
      adjacentEnemy = true;
    }
  }

  const activeBombs = state.bombs.filter((b) => b.ownerId === bot.id).length;
  if ((adjacentDestructible || adjacentEnemy) && activeBombs < bot.maxBombs) {
    // Check if bot can escape after placing bomb
    let hasEscapeRoute = false;
    for (const { dx, dy } of directions) {
      const tx = botTileX + dx;
      const ty = botTileY + dy;
      if (!isTileBlocked(tx, ty, state.grid, state.bombs)) {
        hasEscapeRoute = true;
        break;
      }
    }

    if (hasEscapeRoute && Math.random() < 0.35) {
      return { moveX: 0, moveY: 0, placeBomb: true };
    }
  }

  // 4. Default wandering / hunting
  // Move toward nearest opponent
  const opponents = state.players.filter((p) => p.id !== bot.id && p.alive);
  if (opponents.length > 0) {
    const target = opponents[0];
    const dx = Math.sign(target.x - bot.x);
    const dy = Math.sign(target.y - bot.y);

    if (
      dx !== 0 &&
      !isTileBlocked(botTileX + dx, botTileY, state.grid, state.bombs) &&
      !dangerTiles.has(`${botTileX + dx},${botTileY}`)
    ) {
      return { moveX: dx, moveY: 0, placeBomb: false };
    }
    if (
      dy !== 0 &&
      !isTileBlocked(botTileX, botTileY + dy, state.grid, state.bombs) &&
      !dangerTiles.has(`${botTileX},${botTileY + dy}`)
    ) {
      return { moveX: 0, moveY: dy, placeBomb: false };
    }
  }

  // Random wander step if available
  const validSteps = directions.filter(
    ({ dx, dy }) =>
      !isTileBlocked(botTileX + dx, botTileY + dy, state.grid, state.bombs) &&
      !dangerTiles.has(`${botTileX + dx},${botTileY + dy}`),
  );

  if (validSteps.length > 0) {
    const pick = validSteps[Math.floor(Math.random() * validSteps.length)];
    return { moveX: pick.dx, moveY: pick.dy, placeBomb: false };
  }

  return { moveX: 0, moveY: 0, placeBomb: false };
}
