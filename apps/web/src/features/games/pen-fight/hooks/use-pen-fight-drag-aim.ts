'use client';

import type { ThreeEvent } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { MIN_POWER_THRESHOLD, PEN_START_Y } from '../engine/pen-fight-constants';
import {
  computeAimPreview,
  computeFlickFromDrag,
  isWithinGrabRange,
} from '../engine/pen-fight-utils';
import type { FlickImpulse, PenFightPlayerId } from '../types/pen-fight.types';

interface UsePenFightDragAimParams {
  canAim: boolean;
  activePlayer: PenFightPlayerId;
  playerColor: string;
  p1Ref: RefObject<RapierRigidBody | null>;
  p2Ref: RefObject<RapierRigidBody | null>;
  onFlick: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => void;
}

interface DragState {
  playerId: PenFightPlayerId;
  anchor: THREE.Vector3;
  current: THREE.Vector3;
}

/** Returns the pen's anchor point if `point` is close enough to grab it, otherwise null. */
function resolveGrabAnchor(body: RapierRigidBody, point: THREE.Vector3): THREE.Vector3 | null {
  const penPos = body.translation();
  const anchor = new THREE.Vector3(penPos.x, PEN_START_Y, penPos.z);
  return isWithinGrabRange(anchor, point) ? anchor : null;
}

/** Applies the flick if the drag was pulled back far enough to count. */
function triggerFlickIfStrongEnough(
  drag: DragState,
  onFlick: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => void,
): void {
  const flick = computeFlickFromDrag(drag.anchor, drag.current);
  if (flick.power >= MIN_POWER_THRESHOLD) {
    onFlick(drag.playerId, flick.direction, flick.power);
  }
}

/** Ends the drag even if the pointer is released off-canvas. */
function useGlobalPointerUpFallback(active: boolean, onRelease: () => void): void {
  useEffect(() => {
    if (!active) return undefined;
    window.addEventListener('pointerup', onRelease);
    return () => window.removeEventListener('pointerup', onRelease);
  }, [active, onRelease]);
}

/** Slingshot-style pull-back aiming: grab your pen, drag back, release to flick. */
export function usePenFightDragAim({
  canAim,
  activePlayer,
  playerColor,
  p1Ref,
  p2Ref,
  onFlick,
}: UsePenFightDragAimParams) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const activeBodyRef = activePlayer === 'p1' ? p1Ref : p2Ref;

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!canAim) return;
      const body = activeBodyRef.current;
      if (!body) return;

      const anchor = resolveGrabAnchor(body, event.point);
      if (!anchor) return;

      event.stopPropagation();
      setDrag({ playerId: activePlayer, anchor, current: event.point.clone() });
    },
    [canAim, activePlayer, activeBodyRef],
  );

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!drag) return;
      event.stopPropagation();
      setDrag((prev) => (prev ? { ...prev, current: event.point.clone() } : prev));
    },
    [drag],
  );

  const releaseDrag = useCallback(() => {
    setDrag((prev) => {
      if (prev) triggerFlickIfStrongEnough(prev, onFlick);
      return null;
    });
  }, [onFlick]);

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!drag) return;
      event.stopPropagation();
      releaseDrag();
    },
    [drag, releaseDrag],
  );

  useGlobalPointerUpFallback(drag !== null, releaseDrag);

  const aimPreview = useMemo(() => {
    if (!drag) return null;
    return computeAimPreview(drag.anchor, drag.current, playerColor);
  }, [drag, playerColor]);

  return { handlePointerDown, handlePointerMove, handlePointerUp, aimPreview };
}
