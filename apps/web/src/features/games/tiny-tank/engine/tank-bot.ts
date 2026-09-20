import type {
  TankPlayer,
  ArenaBlock,
  PickupCrate,
  ProximityMine,
  TankInput,
  BotDifficulty,
  Vector2D,
} from '../types/tiny-tank.types';
import { vectorDistance, vectorSub, circleIntersectsAABB, clamp } from './tank-physics';

export function computeBotInput(
  bot: TankPlayer,
  allPlayers: TankPlayer[],
  blocks: ArenaBlock[],
  crates: PickupCrate[],
  mines: ProximityMine[],
  difficulty: BotDifficulty,
  _dt: number,
): TankInput {
  if (!bot.isAlive) {
    return {
      moveForward: false,
      moveBackward: false,
      turnLeft: false,
      turnRight: false,
      turretAngle: bot.turretAngle,
      fire: false,
    };
  }

  // Find nearest alive enemy
  const enemies = allPlayers.filter((p) => p.id !== bot.id && p.isAlive);
  let closestEnemy: TankPlayer | null = null;
  let minEnemyDist = Infinity;

  for (const enemy of enemies) {
    const dist = vectorDistance(bot.position, enemy.position);
    if (dist < minEnemyDist) {
      minEnemyDist = dist;
      closestEnemy = enemy;
    }
  }

  // Determine primary navigation target
  let targetPos: Vector2D = closestEnemy
    ? { ...closestEnemy.position }
    : { x: bot.position.x, y: bot.position.y };

  // If low on health or ammo, check for helpful crates
  const needsHealth = bot.health < 50;
  const needsAmmo = bot.ammo <= 1;

  if ((needsHealth || needsAmmo) && crates.length > 0) {
    let bestCrate: PickupCrate | null = null;
    let minCrateDist = Infinity;

    for (const crate of crates) {
      if (needsHealth && (crate.type === 'health' || crate.type === 'shield')) {
        const d = vectorDistance(bot.position, crate.position);
        if (d < minCrateDist) {
          minCrateDist = d;
          bestCrate = crate;
        }
      } else if (needsAmmo && (crate.type === 'ammo' || crate.type !== 'health')) {
        const d = vectorDistance(bot.position, crate.position);
        if (d < minCrateDist) {
          minCrateDist = d;
          bestCrate = crate;
        }
      }
    }

    if (bestCrate && minCrateDist < 450) {
      targetPos = { ...bestCrate.position };
    }
  }

  // Check danger from nearby armed mines
  const avoidVector: Vector2D = { x: 0, y: 0 };
  for (const mine of mines) {
    if (mine.isArmed) {
      const d = vectorDistance(bot.position, mine.position);
      if (d < 85) {
        avoidVector.x += (bot.position.x - mine.position.x) / (d + 1);
        avoidVector.y += (bot.position.y - mine.position.y) / (d + 1);
      }
    }
  }

  // Check obstacle proximity ahead
  const forwardX = Math.cos(bot.angle);
  const forwardY = Math.sin(bot.angle);
  const probeDist = 45;
  const probePos = {
    x: bot.position.x + forwardX * probeDist,
    y: bot.position.y + forwardY * probeDist,
  };

  let wallAhead = false;
  for (const b of blocks) {
    if (b.health <= 0) continue;
    const hit = circleIntersectsAABB(probePos.x, probePos.y, 18, b.x, b.y, b.width, b.height);
    if (hit.collides) {
      wallAhead = true;
      avoidVector.x += hit.normalX;
      avoidVector.y += hit.normalY;
      break;
    }
  }

  // Calculate desired heading
  let desiredDir = vectorSub(targetPos, bot.position);
  if (avoidVector.x !== 0 || avoidVector.y !== 0) {
    desiredDir = {
      x: desiredDir.x + avoidVector.x * 200,
      y: desiredDir.y + avoidVector.y * 200,
    };
  }

  const desiredAngle = Math.atan2(desiredDir.y, desiredDir.x);
  let angleDiff = desiredAngle - bot.angle;
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

  let turnLeft = false;
  let turnRight = false;
  let moveForward = false;
  let moveBackward = false;

  const turnThreshold = difficulty === 'easy' ? 0.35 : 0.15;

  if (angleDiff > turnThreshold) {
    turnRight = true;
  } else if (angleDiff < -turnThreshold) {
    turnLeft = true;
  }

  if (wallAhead) {
    // If obstacle is dead ahead, reverse or turn hard
    if (Math.abs(angleDiff) > 1.2) {
      turnRight = true;
    } else {
      moveBackward = true;
    }
  } else if (Math.abs(angleDiff) < 1.0) {
    // Keep reasonable distance from target in medium/hard
    if (closestEnemy && minEnemyDist < 100 && difficulty !== 'easy') {
      moveBackward = true;
    } else {
      moveForward = true;
    }
  }

  // Turret Aiming & Lead Calculation
  let turretAim = bot.turretAngle;
  let fire = false;

  if (closestEnemy) {
    const aimTarget = { ...closestEnemy.position };

    // Lead calculation on medium/hard
    if (difficulty !== 'easy') {
      const bulletSpeed = 380;
      const travelTime = minEnemyDist / bulletSpeed;
      aimTarget.x += closestEnemy.velocity.x * travelTime * (difficulty === 'hard' ? 0.9 : 0.5);
      aimTarget.y += closestEnemy.velocity.y * travelTime * (difficulty === 'hard' ? 0.9 : 0.5);
    }

    const aimDir = vectorSub(aimTarget, bot.position);
    const targetTurretAngle = Math.atan2(aimDir.y, aimDir.x);

    let aimDiff = targetTurretAngle - bot.turretAngle;
    while (aimDiff > Math.PI) aimDiff -= 2 * Math.PI;
    while (aimDiff < -Math.PI) aimDiff += 2 * Math.PI;

    const turretRotationRate = difficulty === 'hard' ? 6.0 : difficulty === 'medium' ? 4.2 : 2.5;
    turretAim += clamp(aimDiff, -turretRotationRate * 0.05, turretRotationRate * 0.05);

    // Fire condition
    const aimTolerance = difficulty === 'hard' ? 0.22 : 0.4;
    if (Math.abs(aimDiff) < aimTolerance && bot.reloadTimer <= 0 && minEnemyDist < 550) {
      fire = true;
    }
  }

  return {
    moveForward,
    moveBackward,
    turnLeft,
    turnRight,
    turretAngle: turretAim,
    fire,
  };
}
