import type {
  Vector2D,
  DashPlayer,
  ObstacleBlock,
  DashInput,
  LootItem,
} from '../types/loot-dash.types';

export const PLAYER_RADIUS = 16;
export const BASE_SPEED = 220;
export const BOOST_SPEED = 360;
export const SLOW_SPEED = 110;
export const MAGNET_RADIUS = 180;
export const MAGNET_SPEED = 340;

export function vectorAdd(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vectorSub(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vectorScale(v: Vector2D, factor: number): Vector2D {
  return { x: v.x * factor, y: v.y * factor };
}

export function vectorLength(v: Vector2D): number {
  return Math.hypot(v.x, v.y);
}

export function vectorDistance(a: Vector2D, b: Vector2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function vectorNormalize(v: Vector2D): Vector2D {
  const len = vectorLength(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function circleIntersectsAABB(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): { collides: boolean; normalX: number; normalY: number; depth: number } {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);

  const distX = cx - closestX;
  const distY = cy - closestY;
  const distanceSq = distX * distX + distY * distY;

  if (distanceSq >= r * r) {
    return { collides: false, normalX: 0, normalY: 0, depth: 0 };
  }

  const distance = Math.sqrt(distanceSq);
  if (distance === 0) {
    const distLeft = cx - rx;
    const distRight = rx + rw - cx;
    const distTop = cy - ry;
    const distBottom = ry + rh - cy;
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft)
      return { collides: true, normalX: -1, normalY: 0, depth: r + distLeft };
    if (minDist === distRight)
      return { collides: true, normalX: 1, normalY: 0, depth: r + distRight };
    if (minDist === distTop) return { collides: true, normalX: 0, normalY: -1, depth: r + distTop };
    return { collides: true, normalX: 0, normalY: 1, depth: r + distBottom };
  }

  return {
    collides: true,
    normalX: distX / distance,
    normalY: distY / distance,
    depth: r - distance,
  };
}

export function updatePlayerPhysics(
  player: DashPlayer,
  input: DashInput,
  obstacles: ObstacleBlock[],
  arenaWidth: number,
  arenaHeight: number,
  dt: number,
): DashPlayer {
  if (!player.isAlive) return player;

  // Stunned: cannot move
  if (player.stunTimer > 0) {
    return {
      ...player,
      velocity: { x: player.velocity.x * 0.8, y: player.velocity.y * 0.8 },
      stunTimer: Math.max(0, player.stunTimer - dt),
      slowTimer: Math.max(0, player.slowTimer - dt),
      invulnerableTimer: Math.max(0, player.invulnerableTimer - dt),
      powerUpTimeRemaining: Math.max(0, player.powerUpTimeRemaining - dt),
    };
  }

  // Calculate speed based on active power-up or slow effects
  let targetSpeed = BASE_SPEED;
  if (player.activePowerUp === 'speed') {
    targetSpeed = BOOST_SPEED;
  } else if (player.slowTimer > 0) {
    targetSpeed = SLOW_SPEED;
  }

  const inputVec = vectorNormalize({ x: input.moveX, y: input.moveY });
  const desiredVel = vectorScale(inputVec, targetSpeed);

  // Velocity smoothing
  const accelRate = 14;
  let velX = player.velocity.x + (desiredVel.x - player.velocity.x) * clamp(accelRate * dt, 0, 1);
  let velY = player.velocity.y + (desiredVel.y - player.velocity.y) * clamp(accelRate * dt, 0, 1);

  // Update angle if moving
  let newAngle = player.angle;
  if (vectorLength(inputVec) > 0.1) {
    newAngle = Math.atan2(inputVec.y, inputVec.x);
  }

  // Position candidate
  let newPosX = player.position.x + velX * dt;
  let newPosY = player.position.y + velY * dt;

  // Arena boundary clamp
  newPosX = clamp(newPosX, PLAYER_RADIUS + 8, arenaWidth - PLAYER_RADIUS - 8);
  newPosY = clamp(newPosY, PLAYER_RADIUS + 8, arenaHeight - PLAYER_RADIUS - 8);

  // Obstacle collisions
  for (const obs of obstacles) {
    const hit = circleIntersectsAABB(
      newPosX,
      newPosY,
      PLAYER_RADIUS,
      obs.x,
      obs.y,
      obs.width,
      obs.height,
    );

    if (hit.collides) {
      newPosX += hit.normalX * hit.depth;
      newPosY += hit.normalY * hit.depth;

      // Bumper obstacle bounce
      if (obs.type === 'bumper') {
        velX = hit.normalX * 380;
        velY = hit.normalY * 380;
      } else {
        const dot = velX * hit.normalX + velY * hit.normalY;
        if (dot < 0) {
          velX -= hit.normalX * dot;
          velY -= hit.normalY * dot;
        }
      }
    }
  }

  // Power-up countdown
  const nextPowerUpTime = Math.max(0, player.powerUpTimeRemaining - dt);
  const activePowerUp = nextPowerUpTime > 0 ? player.activePowerUp : null;

  return {
    ...player,
    position: { x: newPosX, y: newPosY },
    velocity: { x: velX, y: velY },
    angle: newAngle,
    activePowerUp,
    powerUpTimeRemaining: nextPowerUpTime,
    stunTimer: Math.max(0, player.stunTimer - dt),
    slowTimer: Math.max(0, player.slowTimer - dt),
    invulnerableTimer: Math.max(0, player.invulnerableTimer - dt),
  };
}

export function resolvePlayerBumps(players: DashPlayer[]): {
  updatedPlayers: DashPlayer[];
  steals: { thiefId: string; victimId: string; amount: number }[];
} {
  const updated = players.map((p) => ({
    ...p,
    position: { ...p.position },
    velocity: { ...p.velocity },
  }));
  const steals: { thiefId: string; victimId: string; amount: number }[] = [];

  for (let i = 0; i < updated.length; i++) {
    for (let j = i + 1; j < updated.length; j++) {
      const p1 = updated[i];
      const p2 = updated[j];
      if (!p1.isAlive || !p2.isAlive) continue;

      const dist = vectorDistance(p1.position, p2.position);
      const minDist = PLAYER_RADIUS * 2;

      if (dist < minDist && dist > 0.001) {
        const overlap = (minDist - dist) * 0.5;
        const nx = (p1.position.x - p2.position.x) / dist;
        const ny = (p1.position.y - p2.position.y) / dist;

        // Position push apart
        p1.position.x += nx * overlap;
        p1.position.y += ny * overlap;
        p2.position.x -= nx * overlap;
        p2.position.y -= ny * overlap;

        // Elastic impulse push
        const bumpForce = 220;
        p1.velocity.x += nx * bumpForce;
        p1.velocity.y += ny * bumpForce;
        p2.velocity.x -= nx * bumpForce;
        p2.velocity.y -= ny * bumpForce;

        // Check Thief Gloves
        if (p1.activePowerUp === 'thief' && p2.score > 0 && p2.invulnerableTimer <= 0) {
          const stolen = Math.min(25, p2.score);
          p2.score -= stolen;
          p1.score += stolen;
          p1.stealsCount += 1;
          p2.invulnerableTimer = 1.0;
          steals.push({ thiefId: p1.id, victimId: p2.id, amount: stolen });
        } else if (p2.activePowerUp === 'thief' && p1.score > 0 && p1.invulnerableTimer <= 0) {
          const stolen = Math.min(25, p1.score);
          p1.score -= stolen;
          p2.score += stolen;
          p2.stealsCount += 1;
          p1.invulnerableTimer = 1.0;
          steals.push({ thiefId: p2.id, victimId: p1.id, amount: stolen });
        }
      }
    }
  }

  return { updatedPlayers: updated, steals };
}

export function updateLootMagnets(
  lootList: LootItem[],
  players: DashPlayer[],
  dt: number,
): LootItem[] {
  return lootList.map((item) => {
    let nearestMagnetPlayer: DashPlayer | null = null;
    let minDist = MAGNET_RADIUS;

    for (const p of players) {
      if (p.isAlive && p.activePowerUp === 'magnet') {
        const d = vectorDistance(p.position, item.position);
        if (d < minDist) {
          minDist = d;
          nearestMagnetPlayer = p;
        }
      }
    }

    if (nearestMagnetPlayer) {
      const pullDir = vectorNormalize(vectorSub(nearestMagnetPlayer.position, item.position));
      const pullDist = MAGNET_SPEED * dt;
      return {
        ...item,
        position: {
          x: item.position.x + pullDir.x * pullDist,
          y: item.position.y + pullDir.y * pullDist,
        },
      };
    }

    return item;
  });
}
