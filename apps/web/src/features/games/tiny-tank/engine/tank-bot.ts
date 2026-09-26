import {
  PICKUP_AMMO,
  PICKUP_HEALTH,
  PICKUP_SHIELD,
  type ArenaBlock,
  type BotDifficulty,
  type PickupCrate,
  type ProximityMine,
  type TankInput,
  type TankPlayer,
  type Vector2D,
} from '../types/tiny-tank.types';
import { circleIntersectsAABB, clamp, vectorDistance, vectorSub } from './tank-physics';

const DIFF_EASY = 'easy' as const;
const DIFF_MEDIUM = 'medium' as const;
const DIFF_HARD = 'hard' as const;

function findClosestEnemy(
  bot: TankPlayer,
  allPlayers: TankPlayer[],
): { enemy: TankPlayer | null; dist: number } {
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

  return { enemy: closestEnemy, dist: minEnemyDist };
}

function findCrateTarget(bot: TankPlayer, crates: PickupCrate[]): Vector2D | null {
  const needsHealth = bot.health < 50;
  const needsAmmo = bot.ammo <= 1;
  if ((!needsHealth && !needsAmmo) || crates.length === 0) return null;

  let bestCrate: PickupCrate | null = null;
  let minCrateDist = Infinity;

  for (const crate of crates) {
    const isHealthCrate = crate.type === PICKUP_HEALTH || crate.type === PICKUP_SHIELD;
    const matchesNeed = needsHealth ? isHealthCrate : crate.type === PICKUP_AMMO || !isHealthCrate;
    if (matchesNeed) {
      const d = vectorDistance(bot.position, crate.position);
      if (d < minCrateDist) {
        minCrateDist = d;
        bestCrate = crate;
      }
    }
  }

  return bestCrate && minCrateDist < 450 ? { ...bestCrate.position } : null;
}

function computeAvoidanceVector(
  bot: TankPlayer,
  blocks: ArenaBlock[],
  mines: ProximityMine[],
): { vec: Vector2D; wallAhead: boolean } {
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

  const probeDist = 45;
  const probePos = {
    x: bot.position.x + Math.cos(bot.angle) * probeDist,
    y: bot.position.y + Math.sin(bot.angle) * probeDist,
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

  return { vec: avoidVector, wallAhead };
}

function normalizeAngleDiff(targetAngle: number, currentAngle: number): number {
  let diff = targetAngle - currentAngle;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
}

function computeMovement(
  bot: TankPlayer,
  targetPos: Vector2D,
  avoidVector: Vector2D,
  wallAhead: boolean,
  closestEnemy: TankPlayer | null,
  minEnemyDist: number,
  difficulty: BotDifficulty,
) {
  let desiredDir = vectorSub(targetPos, bot.position);
  if (avoidVector.x !== 0 || avoidVector.y !== 0) {
    desiredDir = {
      x: desiredDir.x + avoidVector.x * 200,
      y: desiredDir.y + avoidVector.y * 200,
    };
  }

  const angleDiff = normalizeAngleDiff(Math.atan2(desiredDir.y, desiredDir.x), bot.angle);
  const turnThreshold = difficulty === DIFF_EASY ? 0.35 : 0.15;

  let turnLeft = false;
  let turnRight = false;
  let moveForward = false;
  let moveBackward = false;

  if (angleDiff > turnThreshold) turnRight = true;
  else if (angleDiff < -turnThreshold) turnLeft = true;

  if (wallAhead) {
    if (Math.abs(angleDiff) > 1.2) turnRight = true;
    else moveBackward = true;
  } else if (Math.abs(angleDiff) < 1.0) {
    if (closestEnemy && minEnemyDist < 100 && difficulty !== DIFF_EASY) {
      moveBackward = true;
    } else {
      moveForward = true;
    }
  }

  return { moveForward, moveBackward, turnLeft, turnRight };
}

function computeTurretAim(
  bot: TankPlayer,
  closestEnemy: TankPlayer | null,
  minEnemyDist: number,
  difficulty: BotDifficulty,
): { turretAim: number; fire: boolean } {
  if (!closestEnemy) {
    return { turretAim: bot.turretAngle, fire: false };
  }

  const aimTarget = { ...closestEnemy.position };
  if (difficulty !== DIFF_EASY) {
    const bulletSpeed = 380;
    const travelTime = minEnemyDist / bulletSpeed;
    const leadFactor = difficulty === DIFF_HARD ? 0.9 : 0.5;
    aimTarget.x += closestEnemy.velocity.x * travelTime * leadFactor;
    aimTarget.y += closestEnemy.velocity.y * travelTime * leadFactor;
  }

  const aimDir = vectorSub(aimTarget, bot.position);
  const aimDiff = normalizeAngleDiff(Math.atan2(aimDir.y, aimDir.x), bot.turretAngle);

  const turretRotationRate =
    difficulty === DIFF_HARD ? 6.0 : difficulty === DIFF_MEDIUM ? 4.2 : 2.5;
  const turretAim =
    bot.turretAngle + clamp(aimDiff, -turretRotationRate * 0.05, turretRotationRate * 0.05);

  const aimTolerance = difficulty === DIFF_HARD ? 0.22 : 0.4;
  const fire = Math.abs(aimDiff) < aimTolerance && bot.reloadTimer <= 0 && minEnemyDist < 550;

  return { turretAim, fire };
}

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

  const { enemy: closestEnemy, dist: minEnemyDist } = findClosestEnemy(bot, allPlayers);
  const crateTarget = findCrateTarget(bot, crates);
  const targetPos =
    crateTarget ?? (closestEnemy ? { ...closestEnemy.position } : { ...bot.position });
  const { vec: avoidVector, wallAhead } = computeAvoidanceVector(bot, blocks, mines);

  const movement = computeMovement(
    bot,
    targetPos,
    avoidVector,
    wallAhead,
    closestEnemy,
    minEnemyDist,
    difficulty,
  );
  const { turretAim, fire } = computeTurretAim(bot, closestEnemy, minEnemyDist, difficulty);

  return {
    ...movement,
    turretAngle: turretAim,
    fire,
  };
}
