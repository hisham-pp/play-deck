import type {
  AnagramDifficulty,
  AnagramPlayer,
  AnagramRoundResult,
  AnagramTeam,
} from '../types/anagram-sprint.types';
import {
  BASE_POINTS,
  MAX_SPEED_BONUS,
  MAX_STREAK_STEPS,
  PLACEMENT_MULTIPLIERS,
  STREAK_BONUS_PER_STEP,
} from './anagram-constants';

export interface ScoreInput {
  difficulty: AnagramDifficulty;
  /** 1 for the first seat home this round. */
  placement: number;
  elapsedMs: number;
  roundSeconds: number;
  /** The streak the seat will be on *after* this answer. */
  streak: number;
}

export interface ScoreBreakdown {
  base: number;
  speedBonus: number;
  streakBonus: number;
  points: number;
}

function placementMultiplier(placement: number): number {
  const index = Math.max(0, placement - 1);
  return PLACEMENT_MULTIPLIERS[Math.min(index, PLACEMENT_MULTIPLIERS.length - 1)];
}

/** The share of the clock still unspent, clamped to 0–1. */
export function remainingFraction(elapsedMs: number, roundSeconds: number): number {
  if (roundSeconds <= 0) return 0;
  const left = 1 - elapsedMs / (roundSeconds * 1000);
  return Math.min(1, Math.max(0, left));
}

/**
 * Three levers, deliberately: how hard the word was, how fast you were, and
 * how many you have strung together. Placement only scales the first, so a
 * late-but-instant answer still beats a slow one.
 */
export function scoreAnswer(input: ScoreInput): ScoreBreakdown {
  const base = Math.round(BASE_POINTS[input.difficulty] * placementMultiplier(input.placement));
  const speedBonus = Math.round(
    remainingFraction(input.elapsedMs, input.roundSeconds) * MAX_SPEED_BONUS,
  );
  const steps = Math.min(Math.max(0, input.streak - 1), MAX_STREAK_STEPS);
  const streakBonus = steps * STREAK_BONUS_PER_STEP;

  return { base, speedBonus, streakBonus, points: base + speedBonus + streakBonus };
}

export function teamScore(players: readonly AnagramPlayer[], team: AnagramTeam): number {
  return players
    .filter((player) => player.team === team)
    .reduce((total, player) => total + player.score, 0);
}

/** Seats ordered for the scoreboard: score first, then words solved, then name. */
export function rankPlayers(players: readonly AnagramPlayer[]): AnagramPlayer[] {
  return [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.solved !== a.solved) return b.solved - a.solved;
    return a.name.localeCompare(b.name);
  });
}

export function fastestResult(results: readonly AnagramRoundResult[]): AnagramRoundResult | null {
  return results.reduce<AnagramRoundResult | null>(
    (best, result) => (best === null || result.elapsedMs < best.elapsedMs ? result : best),
    null,
  );
}
