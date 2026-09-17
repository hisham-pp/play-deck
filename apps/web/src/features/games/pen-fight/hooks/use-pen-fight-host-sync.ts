'use client';

import { useFrame } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import { useCallback, useRef, type RefObject } from 'react';
import { PEN_SYNC_INTERVAL_MS, PEN_SYNC_TRAILING_FRAMES } from '../engine/pen-fight-constants';
import type { PenSyncPayload, PenTransform } from '../types/pen-fight.types';

interface UsePenFightHostSyncParams {
  p1Ref: RefObject<RapierRigidBody | null>;
  p2Ref: RefObject<RapierRigidBody | null>;
  /** Only the authority client (offline host, or the online host) broadcasts. */
  enabled: boolean;
  onSync?: (payload: PenSyncPayload) => void;
}

/** Copies a Rapier body's pose into plain numbers — Rapier reuses its return objects. */
function readPenTransform(body: RapierRigidBody): PenTransform {
  const t = body.translation();
  const r = body.rotation();
  const lv = body.linvel();
  const av = body.angvel();
  return {
    t: { x: t.x, y: t.y, z: t.z },
    r: { x: r.x, y: r.y, z: r.z, w: r.w },
    lv: { x: lv.x, y: lv.y, z: lv.z },
    av: { x: av.x, y: av.y, z: av.z },
  };
}

/** A backwards sequence jump larger than this means the host restarted, not a late packet. */
const SYNC_RESTART_TOLERANCE = 30;

function applyPenTransform(body: RapierRigidBody | null, next: PenTransform): void {
  if (!body) return;
  body.wakeUp();
  body.setTranslation(next.t, true);
  body.setRotation(next.r, true);
  body.setLinvel(next.lv, true);
  body.setAngvel(next.av, true);
}

/**
 * Streams authoritative pen poses to the other device while the pens are moving, plus a short
 * trailing burst once they stop so both arenas agree on the exact resting position.
 */
export function usePenFightHostSync({ p1Ref, p2Ref, enabled, onSync }: UsePenFightHostSyncParams) {
  const lastSentAtRef = useRef(0);
  const trailingRef = useRef(0);
  const seqRef = useRef(0);

  /** Forces the next frame to emit a snapshot (used right after a flick or a reset). */
  const flushSync = useCallback(() => {
    lastSentAtRef.current = 0;
    trailingRef.current = PEN_SYNC_TRAILING_FRAMES;
  }, []);

  useFrame(() => {
    if (!enabled || !onSync) return;
    const p1 = p1Ref.current;
    const p2 = p2Ref.current;
    if (!p1 || !p2) return;

    const moving = !p1.isSleeping() || !p2.isSleeping();
    if (moving) {
      trailingRef.current = PEN_SYNC_TRAILING_FRAMES;
    } else if (trailingRef.current > 0) {
      trailingRef.current -= 1;
    } else {
      return;
    }

    const now = performance.now();
    if (now - lastSentAtRef.current < PEN_SYNC_INTERVAL_MS) return;
    lastSentAtRef.current = now;

    seqRef.current += 1;
    onSync({
      seq: seqRef.current,
      p1: readPenTransform(p1),
      p2: readPenTransform(p2),
    });
  });

  return { flushSync };
}

/**
 * The follower side of the sync: snaps both pens onto the authority's snapshots, ignoring
 * packets that arrive out of order.
 */
export function usePenFightFollower(
  p1Ref: RefObject<RapierRigidBody | null>,
  p2Ref: RefObject<RapierRigidBody | null>,
) {
  const lastSeqRef = useRef(0);

  return useCallback(
    (payload: PenSyncPayload) => {
      // Drop stale packets, but accept a sequence that jumps far backwards: that means the host
      // reloaded and restarted its counter rather than a late-arriving snapshot.
      const isRestart = payload.seq <= lastSeqRef.current - SYNC_RESTART_TOLERANCE;
      if (payload.seq <= lastSeqRef.current && !isRestart) return;

      lastSeqRef.current = payload.seq;
      applyPenTransform(p1Ref.current, payload.p1);
      applyPenTransform(p2Ref.current, payload.p2);
    },
    [p1Ref, p2Ref],
  );
}
