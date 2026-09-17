import { SPEAKING_RELEASE_MS, SPEAKING_THRESHOLD } from '../voice.constants';

/** Root-mean-square of a time-domain buffer, normalised to roughly 0–1. */
export function computeRms(samples: Uint8Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const centered = (samples[i] - 128) / 128;
    sum += centered * centered;
  }
  return Math.sqrt(sum / samples.length);
}

export function isSpeakingLevel(level: number): boolean {
  return level >= SPEAKING_THRESHOLD;
}

/**
 * Speech has natural gaps between words. Latching the indicator on for a short
 * release window keeps the ring steady instead of strobing on every syllable.
 *
 * `lastSpokeAt` is a caller-owned scratch record, updated in place.
 */
export function resolveSpeaking(
  key: string,
  level: number,
  now: number,
  lastSpokeAt: Record<string, number>,
): boolean {
  if (isSpeakingLevel(level)) {
    lastSpokeAt[key] = now;
    return true;
  }
  const last = lastSpokeAt[key] ?? 0;
  return now - last < SPEAKING_RELEASE_MS;
}
