import {
  BLOCK_BARREL,
  BLOCK_BRICK,
  PICKUP_AMMO,
  PICKUP_HEALTH,
  WEAPON_HOMING,
  WEAPON_RUBBER,
  type ArenaBlock,
  type ExplosionEffect,
  type PickupCrate,
  type Projectile,
  type TankPlayer,
  type TinyTankMatchStats,
  type Vector2D,
} from '../types/tiny-tank.types';
import {
  TANK_RADIUS,
  circleIntersectsAABB,
  reflectVector,
  updateProjectilePhysics,
  vectorDistance,
  vectorNormalize,
} from './tank-physics';
export * from './tank-weapons';

function damageBrick(
  b: ArenaBlock,
  p: Projectile,
  crates: PickupCrate[],
  onExplosion: (pos: Vector2D) => void,
) {
  b.health -= p.damage;
  if (b.health <= 0) {
    onExplosion({ x: b.x + 20, y: b.y + 20 });
    if (Math.random() < 0.25) {
      crates.push({
        id: `crate-drop-${Date.now()}`,
        type: Math.random() < 0.5 ? PICKUP_AMMO : PICKUP_HEALTH,
        position: { x: b.x + 20, y: b.y + 20 },
        radius: 14,
        pulseTimer: 0,
      });
    }
  }
}

function detonateBarrel(
  b: ArenaBlock,
  explosions: ExplosionEffect[],
  players: TankPlayer[],
  onBarrelBoom: (pos: Vector2D) => void,
  onTankDestroyed: (pos: Vector2D) => void,
) {
  b.health = 0;
  onBarrelBoom({ x: b.x + 20, y: b.y + 20 });
  explosions.push({
    id: `exp-barrel-${Date.now()}`,
    position: { x: b.x + 20, y: b.y + 20 },
    maxRadius: 95,
    currentRadius: 10,
    duration: 0.45,
    age: 0,
    color: '#f97316',
  });

  for (const victim of players) {
    if (!victim.isAlive) continue;
    const d = vectorDistance(victim.position, { x: b.x + 20, y: b.y + 20 });
    if (d < 95) {
      const splashDmg = Math.round(65 * (1 - d / 95));
      victim.health -= splashDmg;
      if (victim.health <= 0) {
        victim.isAlive = false;
        onTankDestroyed(victim.position);
      }
    }
  }
}

function handleBlockCollision(
  p: Projectile,
  arenaBlocks: ArenaBlock[],
  crates: PickupCrate[],
  explosions: ExplosionEffect[],
  players: TankPlayer[],
  onRicochet: (pos: Vector2D) => void,
  onExplosion: (pos: Vector2D) => void,
  onBarrelBoom: (pos: Vector2D) => void,
  onTankDestroyed: (pos: Vector2D) => void,
): boolean {
  for (let bi = 0; bi < arenaBlocks.length; bi++) {
    const b = arenaBlocks[bi];
    if (b.health <= 0) continue;

    const coll = circleIntersectsAABB(
      p.position.x,
      p.position.y,
      p.radius,
      b.x,
      b.y,
      b.width,
      b.height,
    );
    if (!coll.collides) continue;

    if (p.bouncesRemaining > 0) {
      p.bouncesRemaining -= 1;
      p.velocity = reflectVector(p.velocity, coll.normalX, coll.normalY);
      p.position.x += coll.normalX * (coll.depth + 1);
      p.position.y += coll.normalY * (coll.depth + 1);
      onRicochet(p.position);
      return false;
    }

    if (b.type === BLOCK_BRICK) {
      damageBrick(b, p, crates, onExplosion);
    } else if (b.type === BLOCK_BARREL) {
      detonateBarrel(b, explosions, players, onBarrelBoom, onTankDestroyed);
    }
    return true;
  }
  return false;
}

function handleTankHit(
  p: Projectile,
  target: TankPlayer,
  stats: Record<string, TinyTankMatchStats>,
  explosions: ExplosionEffect[],
  onHit: (pos: Vector2D) => void,
  onTankDestroyed: (pos: Vector2D) => void,
) {
  onHit(p.position);
  let remainingDmg = p.damage;
  if (target.shield > 0) {
    if (target.shield >= remainingDmg) {
      target.shield -= remainingDmg;
      remainingDmg = 0;
    } else {
      remainingDmg -= target.shield;
      target.shield = 0;
    }
  }

  target.health -= remainingDmg;
  target.invulnerableTimer = 0.15;

  if (p.weapon === WEAPON_RUBBER) {
    const knockDir = vectorNormalize(p.velocity);
    target.velocity.x += knockDir.x * 380;
    target.velocity.y += knockDir.y * 380;
  }

  if (stats[p.shooterId]) {
    stats[p.shooterId].shotsHit += 1;
    stats[p.shooterId].damageDealt += p.damage;
  }

  if (target.health <= 0) {
    target.isAlive = false;
    onTankDestroyed(target.position);
    explosions.push({
      id: `exp-tank-${target.id}`,
      position: { ...target.position },
      maxRadius: 75,
      currentRadius: 10,
      duration: 0.5,
      age: 0,
      color: '#ef4444',
    });

    if (stats[p.shooterId]) {
      stats[p.shooterId].kills += 1;
      stats[p.shooterId].score += 100;
    }
  }
}

function findHomingTarget(p: Projectile, players: TankPlayer[]): Vector2D | null {
  if (p.weapon !== WEAPON_HOMING) return null;
  const enemies = players.filter((pl) => pl.id !== p.shooterId && pl.isAlive);
  let closestD = Infinity;
  let targetPos: Vector2D | null = null;
  for (const e of enemies) {
    const d = vectorDistance(p.position, e.position);
    if (d < closestD) {
      closestD = d;
      targetPos = e.position;
    }
  }
  return targetPos;
}

export function updateProjectiles(
  projectiles: Projectile[],
  arenaBlocks: ArenaBlock[],
  players: TankPlayer[],
  crates: PickupCrate[],
  explosions: ExplosionEffect[],
  stats: Record<string, TinyTankMatchStats>,
  dt: number,
  callbacks: {
    onHit: (pos: Vector2D) => void;
    onRicochet: (pos: Vector2D) => void;
    onExplosion: (pos: Vector2D) => void;
    onBarrelBoom: (pos: Vector2D) => void;
    onTankDestroyed: (pos: Vector2D) => void;
  },
): Projectile[] {
  const remainingProjectiles: Projectile[] = [];

  for (let p of projectiles) {
    const targetPos = findHomingTarget(p, players);
    p = updateProjectilePhysics(p, targetPos, dt);
    if (p.lifetime <= 0) continue;

    const hitBlock = handleBlockCollision(
      p,
      arenaBlocks,
      crates,
      explosions,
      players,
      callbacks.onRicochet,
      callbacks.onExplosion,
      callbacks.onBarrelBoom,
      callbacks.onTankDestroyed,
    );

    if (hitBlock) {
      callbacks.onHit(p.position);
      continue;
    }

    let hitTank = false;
    for (const target of players) {
      if (!target.isAlive || target.id === p.shooterId || target.invulnerableTimer > 0) continue;

      if (vectorDistance(p.position, target.position) < p.radius + TANK_RADIUS) {
        hitTank = true;
        handleTankHit(p, target, stats, explosions, callbacks.onHit, callbacks.onTankDestroyed);
        break;
      }
    }

    if (!hitTank) {
      remainingProjectiles.push(p);
    }
  }

  return remainingProjectiles;
}
