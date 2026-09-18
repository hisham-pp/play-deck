import { DEFAULT_FLAPPY_CONFIG } from './flappy-physics';
import type { DifficultyConfig, FlappyEngineConfig } from './flappy-types';

/**
 * Computes progressive difficulty parameters based on the current score.
 * As score increases, scroll speed gradually accelerates and pipe gaps gently narrow.
 */
export function calculateDifficulty(
  score: number,
  config: FlappyEngineConfig = DEFAULT_FLAPPY_CONFIG,
): DifficultyConfig {
  // Speed scales from baseSpeed up to maxSpeed over 40 score points
  const progressRatio = Math.min(score / 40, 1);
  const speed = Math.round(
    config.baseSpeed + (config.maxSpeed - config.baseSpeed) * Math.pow(progressRatio, 0.8),
  );

  // Gap size scales down from baseGap (150px) to minGap (110px) over 30 score points
  const gapProgress = Math.min(score / 30, 1);
  const gapSize = Math.round(config.baseGap - (config.baseGap - config.minGap) * gapProgress);

  // Horizontal spacing scales slightly with speed to keep comfortable reaction time
  const spawnDistance = Math.round(230 + (speed - config.baseSpeed) * 0.2);

  // Score multiplier for higher difficulty runs
  const scoreMultiplier = score >= 30 ? 2 : 1;

  return {
    speed,
    gapSize,
    spawnDistance,
    scoreMultiplier,
  };
}

/**
 * Generates valid procedural vertical heights for a new pipe pair.
 * Ensures the gap is placed within fair playable vertical bounds.
 */
export function generatePipeHeights(
  worldHeight: number,
  groundHeight: number,
  ceilingHeight: number,
  gapSize: number,
  randomValue: number = Math.random(),
): { topHeight: number; bottomY: number } {
  const minTopHeight = 60;
  const playableHeight = worldHeight - groundHeight - ceilingHeight;
  const maxTopHeight = playableHeight - gapSize - 60;

  // Clamped safe height
  const topHeight = Math.round(
    ceilingHeight + minTopHeight + randomValue * (maxTopHeight - minTopHeight),
  );
  const bottomY = topHeight + gapSize;

  return { topHeight, bottomY };
}
