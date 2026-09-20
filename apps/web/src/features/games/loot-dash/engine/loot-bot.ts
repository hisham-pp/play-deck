import type {
  DashPlayer,
  LootItem,
  Trap,
  ObstacleBlock,
  DashInput,
  BotDifficulty,
  Vector2D,
} from '../types/loot-dash.types';
import {
  vectorDistance,
  vectorSub,
  vectorNormalize,
  circleIntersectsAABB,
  PLAYER_RADIUS,
} from './loot-physics';

export function computeLootBotInput(
  bot: DashPlayer,
  allPlayers: DashPlayer[],
  lootList: LootItem[],
  traps: Trap[],
  obstacles: ObstacleBlock[],
  difficulty: BotDifficulty,
): DashInput {
  if (!bot.isAlive || bot.stunTimer > 0) {
    return { moveX: 0, moveY: 0, activateTrap: false };
  }

  // 1. Thief Power-Up Target Selection
  if (bot.activePowerUp === 'thief') {
    const victims = allPlayers.filter((p) => p.id !== bot.id && p.isAlive && p.score > 0);
    let nearestVictim: DashPlayer | null = null;
    let minVictimDist = Infinity;

    for (const v of victims) {
      const d = vectorDistance(bot.position, v.position);
      if (d < minVictimDist) {
        minVictimDist = d;
        nearestVictim = v;
      }
    }

    if (nearestVictim && minVictimDist < 400) {
      const toVictim = vectorNormalize(vectorSub(nearestVictim.position, bot.position));
      return { moveX: toVictim.x, moveY: toVictim.y, activateTrap: false };
    }
  }

  // 2. Flee from nearby active thieves
  const dangerousThieves = allPlayers.filter(
    (p) => p.id !== bot.id && p.isAlive && p.activePowerUp === 'thief',
  );
  for (const thief of dangerousThieves) {
    const d = vectorDistance(bot.position, thief.position);
    if (d < 160 && bot.score > 0) {
      const awayDir = vectorNormalize(vectorSub(bot.position, thief.position));
      return { moveX: awayDir.x, moveY: awayDir.y, activateTrap: false };
    }
  }

  // 3. Loot Item Evaluation
  let bestTargetPos: Vector2D | null = null;
  let highestScore = -Infinity;

  for (const item of lootList) {
    const dist = vectorDistance(bot.position, item.position);
    const distanceCost = difficulty === 'hard' ? dist * 0.8 : dist;
    const itemValue = item.value;
    const score = itemValue * 10 - distanceCost;

    if (score > highestScore) {
      highestScore = score;
      bestTargetPos = item.position;
    }
  }

  // Default wander if no loot exists
  if (!bestTargetPos) {
    bestTargetPos = { x: 480, y: 320 };
  }

  // 4. Trap Hazard Avoidance
  const avoidVector: Vector2D = { x: 0, y: 0 };
  for (const trap of traps) {
    if (trap.isActive && trap.type !== 'slime') {
      const trapCenter = {
        x: trap.position.x + trap.width / 2,
        y: trap.position.y + trap.height / 2,
      };
      const d = vectorDistance(bot.position, trapCenter);
      if (d < 70) {
        avoidVector.x += (bot.position.x - trapCenter.x) / (d + 1);
        avoidVector.y += (bot.position.y - trapCenter.y) / (d + 1);
      }
    }
  }

  // 5. Obstacle Proximity Avoidance
  const probeDist = 32;
  const desiredDirRaw = vectorNormalize(vectorSub(bestTargetPos, bot.position));
  const probePos = {
    x: bot.position.x + desiredDirRaw.x * probeDist,
    y: bot.position.y + desiredDirRaw.y * probeDist,
  };

  for (const obs of obstacles) {
    const hit = circleIntersectsAABB(
      probePos.x,
      probePos.y,
      PLAYER_RADIUS,
      obs.x,
      obs.y,
      obs.width,
      obs.height,
    );
    if (hit.collides) {
      avoidVector.x += hit.normalX * 2.0;
      avoidVector.y += hit.normalY * 2.0;
      break;
    }
  }

  // 6. Combine Vectors
  let finalDir = {
    x: desiredDirRaw.x + avoidVector.x * 1.5,
    y: desiredDirRaw.y + avoidVector.y * 1.5,
  };

  if (vectorDistance({ x: 0, y: 0 }, finalDir) === 0) {
    finalDir = { x: 1, y: 0 };
  }

  const normalized = vectorNormalize(finalDir);

  // Chance/trigger to drop decoy trap if available
  const activateTrap =
    (difficulty === 'hard' || difficulty === 'medium') && bot.activePowerUp === 'decoy_drop';

  return {
    moveX: normalized.x,
    moveY: normalized.y,
    activateTrap,
  };
}
