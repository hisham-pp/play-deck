/**
 * A tiny seeded generator. The host and every guest build the same floor plan
 * from the same match seed, so nobody has to broadcast the shaft's behaviour.
 */
export interface ElevatorRng {
  next: () => number;
  int: (minInclusive: number, maxInclusive: number) => number;
  float: (min: number, max: number) => number;
  chance: (probability: number) => boolean;
  pick: <T>(items: readonly T[]) => T;
}

/** Turns any match id into a 32-bit seed. */
export function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function createRng(seed: number | string): ElevatorRng {
  let state = (typeof seed === 'string' ? hashSeed(seed) : seed) >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const float = (min: number, max: number) => min + next() * (max - min);
  const int = (min: number, max: number) => Math.floor(float(min, max + 1));

  return {
    next,
    float,
    int,
    chance: (probability: number) => next() < probability,
    pick: <T>(items: readonly T[]): T =>
      items[Math.min(items.length - 1, int(0, items.length - 1))],
  };
}

/** A fresh, printable match seed. */
export function createMatchSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}
