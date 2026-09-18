import type { WordChainPlayer } from '../types/word-chain.types';
import {
  BASE_WORD_POINTS,
  POINTS_PER_EXTRA_LETTER,
  SPEED_BONUS_POINTS,
  SPEED_BONUS_THRESHOLD,
  SURVIVAL_POINTS,
} from './word-chain-constants';

export interface WordScore {
  readonly points: number;
  readonly isSpeedBonus: boolean;
}

/** True when the answer landed inside the opening fraction of the clock. */
export function isSpeedAnswer(elapsedMs: number, turnSeconds: number): boolean {
  if (turnSeconds <= 0) return false;
  return elapsedMs <= turnSeconds * 1000 * SPEED_BONUS_THRESHOLD;
}

/**
 * Longer words are worth more, and answering quickly is worth a flat bonus —
 * so a fast short word and a slow long one can score the same.
 */
export function scoreWord(
  word: string,
  minLength: number,
  elapsedMs: number,
  turnSeconds: number,
): WordScore {
  const extraLetters = Math.max(0, word.length - minLength);
  const isSpeedBonus = isSpeedAnswer(elapsedMs, turnSeconds);
  const points =
    BASE_WORD_POINTS +
    extraLetters * POINTS_PER_EXTRA_LETTER +
    (isSpeedBonus ? SPEED_BONUS_POINTS : 0);

  return { points, isSpeedBonus };
}

/** Awarded to everyone still alive when the game ends. */
export function survivalBonus(player: WordChainPlayer): number {
  return player.eliminated ? 0 : player.lives * SURVIVAL_POINTS;
}

export function applySurvivalBonuses(players: WordChainPlayer[]): WordChainPlayer[] {
  return players.map((player) => ({ ...player, score: player.score + survivalBonus(player) }));
}

/** Every player tied for the top score. */
export function topScorers(players: readonly WordChainPlayer[]): string[] {
  if (players.length === 0) return [];
  const best = Math.max(...players.map((player) => player.score));
  return players.filter((player) => player.score === best).map((player) => player.id);
}
