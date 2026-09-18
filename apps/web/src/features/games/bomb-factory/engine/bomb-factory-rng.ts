/** Deterministic 32-bit PRNG, so every client derives the same public setup from one seed. */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Randomness for a seat's own dossier. It is deliberately *not* seeded: nobody
 * else may be able to reproduce the facts a seat draws for itself.
 */
export function createPrivateRandom(): () => number {
  const crypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (!crypto?.getRandomValues) return Math.random;
  return () => {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / 4294967296;
  };
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function randomInt(
  random: () => number,
  minInclusive: number,
  maxInclusive: number,
): number {
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(random() * span);
}

export function newSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

let attemptCounter = 0;

/** Attempt ids only need to be unique inside one room, never guessable. */
export function newAttemptId(seatId: string): string {
  attemptCounter += 1;
  return `${seatId}:${Date.now().toString(36)}:${attemptCounter}`;
}
