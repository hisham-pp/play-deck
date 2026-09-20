import type {
  HazardCoil,
  MagnetAction,
  MagnetArenaState,
  MagnetPlayer,
  MetallicAnchor,
  TargetOrb,
  Vector2D,
} from '../types/magnet-mayhem.types';
import {
  ATTRACT_RANGE,
  HAZARD_RADIUS,
  PLAYER_RADIUS,
  REPEL_RANGE,
  vecDist,
  vecLength,
  vecNormalize,
  vecSub,
} from './magnet-physics';

export interface BotDecision {
  aimAngle: number;
  action: MagnetAction;
}

/**
 * Computes AI decision for a bot magnet player.
 */
export function evaluateBotInput(bot: MagnetPlayer, state: MagnetArenaState): BotDecision {
  if (bot.stunnedTimer > 0) {
    return { aimAngle: bot.aimAngle, action: 'idle' };
  }

  // Energy check - if low, save energy to recharge
  if (bot.energy < 18) {
    return { aimAngle: bot.aimAngle, action: 'idle' };
  }

  // 1. Tactical REPEL: check if nearby opponents can be blasted away or into hazards
  const repelCandidate = findRepelCandidate(bot, state.players, state.hazards);
  if (repelCandidate) {
    const angleToRival = Math.atan2(
      repelCandidate.position.y - bot.position.y,
      repelCandidate.position.x - bot.position.x,
    );
    return {
      aimAngle: angleToRival,
      action: 'repel',
    };
  }

  // 2. Target Orb Evaluation: Pick highest scoring accessible target
  const bestTarget = selectBestTarget(bot.position, state.targets, state.hazards);
  if (!bestTarget) {
    // No target active, seek center anchor
    const centerAnchor = state.anchors[0];
    if (centerAnchor && bot.energy > 40) {
      const angle = Math.atan2(centerAnchor.y - bot.position.y, centerAnchor.x - bot.position.x);
      return { aimAngle: angle, action: 'attract' };
    }
    return { aimAngle: bot.aimAngle, action: 'idle' };
  }

  const distToTarget = vecDist(bot.position, { x: bestTarget.x, y: bestTarget.y });
  const angleToTarget = Math.atan2(bestTarget.y - bot.position.y, bestTarget.x - bot.position.x);

  // If reasonably close to target orb, pull target toward magnet
  if (distToTarget <= ATTRACT_RANGE * 0.75) {
    return {
      aimAngle: angleToTarget,
      action: 'attract',
    };
  }

  // If target is far, find if an intermediate anchor offers a slingshot vector
  const bestAnchor = findSlingshotAnchor(bot, bestTarget, state.anchors, state.hazards);
  if (bestAnchor) {
    const angleToAnchor = Math.atan2(bestAnchor.y - bot.position.y, bestAnchor.x - bot.position.x);
    return {
      aimAngle: angleToAnchor,
      action: 'attract',
    };
  }

  // Default: aim toward target
  return {
    aimAngle: angleToTarget,
    action: bot.energy > 30 ? 'attract' : 'idle',
  };
}

/**
 * Checks if a rival is close enough that a repel blast disrupts them advantageously.
 */
function findRepelCandidate(
  bot: MagnetPlayer,
  players: MagnetPlayer[],
  hazards: HazardCoil[],
): MagnetPlayer | null {
  for (const rival of players) {
    if (rival.id === bot.id) continue;
    const dist = vecDist(bot.position, rival.position);
    if (dist > REPEL_RANGE * 0.85) continue;

    // Repel if rival is near a hazard (blast them into danger!)
    for (const hazard of hazards) {
      const distToHazard = vecDist(rival.position, { x: hazard.x, y: hazard.y });
      if (distToHazard < HAZARD_RADIUS * 3.5) {
        return rival;
      }
    }

    // Or repel if rival is very close and higher or equal score
    if (dist < REPEL_RANGE * 0.5) {
      return rival;
    }
  }

  return null;
}

/**
 * Selects highest utility target based on tier, score value, and distance.
 */
function selectBestTarget(
  botPos: Vector2D,
  targets: TargetOrb[],
  hazards: HazardCoil[],
): TargetOrb | null {
  let bestTarget: TargetOrb | null = null;
  let maxUtility = -Infinity;

  for (const target of targets) {
    if (target.isCollected) continue;

    const dist = vecDist(botPos, { x: target.x, y: target.y });

    // Penalize targets dangerously close to hazard coils
    let hazardPenalty = 0;
    for (const hazard of hazards) {
      const d = vecDist({ x: target.x, y: target.y }, { x: hazard.x, y: hazard.y });
      if (d < HAZARD_RADIUS + 30) {
        hazardPenalty += 50;
      }
    }

    const tierMultiplier = target.tier === 'star' ? 3.5 : target.tier === 'gold' ? 2.0 : 1.0;
    const utility = (target.value * tierMultiplier * 100) / (dist + 60) - hazardPenalty;

    if (utility > maxUtility) {
      maxUtility = utility;
      bestTarget = target;
    }
  }

  return bestTarget;
}

/**
 * Finds an anchor that can pull the bot in the general direction of the target.
 */
function findSlingshotAnchor(
  bot: MagnetPlayer,
  target: TargetOrb,
  anchors: MetallicAnchor[],
  hazards: HazardCoil[],
): MetallicAnchor | null {
  const toTarget = vecSub({ x: target.x, y: target.y }, bot.position);
  const targetDir = vecNormalize(toTarget);

  let bestAnchor: MetallicAnchor | null = null;
  let bestScore = -Infinity;

  for (const anchor of anchors) {
    const toAnchor = vecSub({ x: anchor.x, y: anchor.y }, bot.position);
    const distToAnchor = vecLength(toAnchor);

    if (distToAnchor > ATTRACT_RANGE || distToAnchor < anchor.radius + PLAYER_RADIUS + 10) {
      continue;
    }

    // Check if anchor is near hazards
    let nearHazard = false;
    for (const hazard of hazards) {
      if (
        vecDist({ x: anchor.x, y: anchor.y }, { x: hazard.x, y: hazard.y }) <
        HAZARD_RADIUS + 40
      ) {
        nearHazard = true;
        break;
      }
    }
    if (nearHazard) continue;

    const anchorDir = vecNormalize(toAnchor);
    const alignment = anchorDir.x * targetDir.x + anchorDir.y * targetDir.y;

    // We want anchors in the forward quadrant (alignment > 0.1)
    if (alignment > 0.1) {
      const score = alignment * 100 - distToAnchor * 0.1;
      if (score > bestScore) {
        bestScore = score;
        bestAnchor = anchor;
      }
    }
  }

  return bestAnchor;
}
