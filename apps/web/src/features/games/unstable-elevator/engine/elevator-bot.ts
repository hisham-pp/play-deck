import { CLAW_RANGE } from './elevator-constants';
import type { ElevatorShape } from './elevator-objects';
import type { ElevatorRng } from './elevator-rng';

export type BotSkill = 'clumsy' | 'steady' | 'expert';

export interface BotPlacement {
  x: number;
  angle: number;
  /** How long the bot mimes lining the drop up, in milliseconds. */
  thinkMs: number;
}

/** Columns the surface is sampled into when hunting for a landing spot. */
export const BOT_PROFILE_COLUMNS = 48;

interface SkillProfile {
  /** Metres of random error added to the chosen drop point. */
  jitter: number;
  /** Weight on keeping the tower low versus merely flat. */
  lowness: number;
  thinkMs: [number, number];
}

const SKILLS: Record<BotSkill, SkillProfile> = {
  clumsy: { jitter: 0.85, lowness: 0.2, thinkMs: [700, 1500] },
  steady: { jitter: 0.38, lowness: 0.5, thinkMs: [900, 1900] },
  expert: { jitter: 0.12, lowness: 0.75, thinkMs: [1100, 2200] },
};

/** Spread of a surface window: low is flat, high is a staircase. */
function unevenness(profile: number[], from: number, to: number): number {
  let min = Infinity;
  let max = -Infinity;
  for (let i = from; i <= to; i += 1) {
    if (profile[i] < min) min = profile[i];
    if (profile[i] > max) max = profile[i];
  }
  return max - min;
}

function windowAverage(profile: number[], from: number, to: number): number {
  let total = 0;
  for (let i = from; i <= to; i += 1) total += profile[i];
  return total / (to - from + 1);
}

/**
 * Picks where a bot drops. It slides the object's footprint across the tower
 * and scores each window on how flat it is and how low it sits — the same two
 * things a human is squinting at.
 */
export function planBotPlacement(
  profile: number[],
  shape: ElevatorShape,
  skill: BotSkill,
  rng: ElevatorRng,
): BotPlacement {
  const config = SKILLS[skill];
  const columnWidth = (CLAW_RANGE * 2) / profile.length;
  const span = Math.max(1, Math.round(shape.width / columnWidth));

  let bestScore = Infinity;
  let bestCentre = 0;

  for (let from = 0; from + span - 1 < profile.length; from += 1) {
    const to = from + span - 1;
    const score = unevenness(profile, from, to) + windowAverage(profile, from, to) * config.lowness;
    if (score < bestScore) {
      bestScore = score;
      bestCentre = ((from + to) / 2 + 0.5) * columnWidth - CLAW_RANGE;
    }
  }

  const jitter = rng.float(-config.jitter, config.jitter);
  const [minThink, maxThink] = config.thinkMs;

  return {
    x: Math.max(-CLAW_RANGE, Math.min(CLAW_RANGE, bestCentre + jitter)),
    // Bots keep cargo square on; a rotated drop is a human flourish.
    angle: 0,
    thinkMs: Math.round(rng.float(minThink, maxThink)),
  };
}
