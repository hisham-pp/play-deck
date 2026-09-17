import type { DifficultyLevel, RunicCard } from '../types/runic-memory.types';
import { GRID_CONFIGS, RUNES } from './runic-memory-constants';

/**
 * Deterministic PRNG (Mulberry32) ensures identical shuffles across online multiplayer peers.
 */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffles an array using the Fisher-Yates algorithm and a PRNG generator.
 */
export function seededShuffle<T>(array: T[], randomFn: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates a balanced runic deck based on difficulty level and random seed.
 */
export function createRunicDeck(difficulty: DifficultyLevel, seed?: number): RunicCard[] {
  const config = GRID_CONFIGS[difficulty] || GRID_CONFIGS.apprentice;
  const actualSeed = typeof seed === 'number' ? seed : Math.floor(Math.random() * 1000000);
  const rng = mulberry32(actualSeed);

  // Pick required number of unique runes
  const shuffledRunes = seededShuffle(RUNES, rng);
  const selectedRunes = shuffledRunes.slice(0, config.pairsCount);

  // Duplicate to form pairs
  const cardsRaw: Array<{ runeId: string; pairId: number }> = [];
  selectedRunes.forEach((rune) => {
    cardsRaw.push({ runeId: rune.id, pairId: 1 });
    cardsRaw.push({ runeId: rune.id, pairId: 2 });
  });

  // Shuffle the paired cards across the grid
  const shuffledCards = seededShuffle(cardsRaw, rng);

  return shuffledCards.map((item, index) => {
    const rune = RUNES.find((r) => r.id === item.runeId)!;
    return {
      id: `rune-card-${index}-${rune.id}-${item.pairId}`,
      index,
      runeId: rune.id,
      rune,
      isFlipped: false,
      isMatched: false,
    };
  });
}
