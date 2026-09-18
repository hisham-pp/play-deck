export interface RandomResult {
  seed: number;
  value: number;
}

/**
 * Pure mulberry32 step: takes a seed, returns the next seed alongside a value
 * in [0, 1). Keeping randomness threaded through state (rather than calling
 * `Math.random`) makes every match replayable from its seed in tests.
 */
export function nextRandom(seed: number): RandomResult {
  const nextSeed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(nextSeed ^ (nextSeed >>> 15), 1 | nextSeed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { seed: nextSeed, value };
}

export interface RandomIntResult {
  seed: number;
  value: number;
}

/** Integer in [0, maxExclusive). */
export function nextRandomInt(seed: number, maxExclusive: number): RandomIntResult {
  const roll = nextRandom(seed);
  return { seed: roll.seed, value: Math.floor(roll.value * Math.max(1, maxExclusive)) };
}

export interface WeightedPickResult<T> {
  seed: number;
  value: T;
}

/**
 * Picks one entry proportionally to its weight. Zero-weight entries are never
 * selected, which is how the deck suppresses cards that make no sense yet
 * (a multiplier on an empty pot, a steal with nothing to steal).
 */
export function pickWeighted<T>(
  seed: number,
  entries: Array<{ value: T; weight: number }>,
): WeightedPickResult<T> {
  const usable = entries.filter((entry) => entry.weight > 0);
  const total = usable.reduce((sum, entry) => sum + entry.weight, 0);
  const roll = nextRandom(seed);

  let cursor = roll.value * total;
  for (const entry of usable) {
    cursor -= entry.weight;
    if (cursor <= 0) return { seed: roll.seed, value: entry.value };
  }

  return { seed: roll.seed, value: usable[usable.length - 1].value };
}

export function createSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) | 0;
}
