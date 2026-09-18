import type { ShadowCast, ShadowTagRunner, TagEvent, Vec2 } from '../types/shadow-tag.types';
import { closestParamOnSegment, distance, lerp, pointAt } from './geometry';
import { PLAYER_RADIUS, SHADOW_MIN_OPACITY, TAG_GRACE_MS, TAG_REACH } from './shadow-tag-constants';

/**
 * A shadow is a tapered capsule: narrow at the caster's feet, broad at the tip.
 * Contact is measured against the width at the closest point, not a single
 * radius, so the far end really is the easier thing to step on.
 */
export function shadowContactPoint(cast: ShadowCast, point: Vec2, reach: number): Vec2 | null {
  if (cast.opacity < SHADOW_MIN_OPACITY) return null;
  const t = closestParamOnSegment(cast.from, cast.to, point);
  const nearest = pointAt(cast.from, cast.to, t);
  const width = lerp(cast.nearRadius, cast.farRadius, t);
  return distance(nearest, point) <= width + reach ? nearest : null;
}

export interface TagResolution {
  event: TagEvent;
  /** Applied by the caller so offline and online paths share one code path. */
  apply: () => void;
}

function markTag(
  tagger: ShadowTagRunner,
  victim: ShadowTagRunner,
  elapsedMs: number,
  points: number,
): void {
  tagger.tags += 1;
  tagger.score += points;
  victim.timesTagged += 1;
  tagger.immuneUntilMs = elapsedMs + TAG_GRACE_MS;
  victim.immuneUntilMs = elapsedMs + TAG_GRACE_MS;
}

export interface ResolveTagOptions {
  itRunner: ShadowTagRunner;
  runners: ShadowTagRunner[];
  casts: ShadowCast[];
  elapsedMs: number;
  tagPoints: number;
}

/**
 * Finds the first runner whose shadow (or body) the "it" player is touching.
 * Immunity covers both sides of a fresh tag, so nobody can bounce the mark back
 * and forth on the spot.
 */
export function resolveTag({
  itRunner,
  runners,
  casts,
  elapsedMs,
  tagPoints,
}: ResolveTagOptions): TagResolution | null {
  if (itRunner.immuneUntilMs > elapsedMs) return null;

  for (const victim of runners) {
    if (victim.id === itRunner.id || !victim.connected) continue;
    if (victim.immuneUntilMs > elapsedMs) continue;

    let contact: Vec2 | null =
      distance(victim.pos, itRunner.pos) <= PLAYER_RADIUS * 2 ? { ...victim.pos } : null;

    if (!contact) {
      for (const cast of casts) {
        if (cast.playerId !== victim.id) continue;
        contact = shadowContactPoint(cast, itRunner.pos, PLAYER_RADIUS + TAG_REACH);
        if (contact) break;
      }
    }

    if (!contact) continue;

    const event: TagEvent = {
      taggerId: itRunner.id,
      victimId: victim.id,
      atMs: elapsedMs,
      at: contact,
    };
    return {
      event,
      apply: () => markTag(itRunner, victim, elapsedMs, tagPoints),
    };
  }

  return null;
}
