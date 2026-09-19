/**
 * Deterministic shuffling. Every peer builds the same match from the same seed,
 * so the room never has to broadcast the words themselves — only the seed.
 */

/** mulberry32: small, fast, and identical in every browser. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Rearranges a word's letters, retrying until the result is neither the word
 * back again nor `avoid` (the arrangement already on screen). Words whose
 * letters are all the same are handed back unchanged rather than spun forever.
 */
export function scrambleWord(word: string, random: () => number, avoid?: string): string {
  const letters = word.toLowerCase().split('');
  if (new Set(letters).size < 2) return word.toLowerCase();

  const rejected = new Set([word.toLowerCase(), avoid?.toLowerCase()].filter(Boolean));

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate = shuffle(letters, random).join('');
    if (!rejected.has(candidate)) return candidate;
  }

  // Fall back to a guaranteed change: swap the first two differing letters.
  const fallback = [...letters];
  const pivot = fallback.findIndex((letter) => letter !== fallback[0]);
  [fallback[0], fallback[pivot]] = [fallback[pivot], fallback[0]];
  return fallback.join('');
}

/** Powers the shuffle button — a fresh arrangement that is not the answer. */
export function reshuffle(answer: string, current: string, random: () => number): string {
  return scrambleWord(answer, random, current);
}

export function createSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
