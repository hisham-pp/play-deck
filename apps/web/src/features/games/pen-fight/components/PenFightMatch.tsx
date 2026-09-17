'use client';

import { RigidBody, type RapierRigidBody } from '@react-three/rapier';
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import {
  MAX_FLICK_SPEED,
  MAX_FLICK_SPIN,
  MIN_FLICK_SPEED,
  PEN_FRICTION,
  PEN_RESTITUTION,
  PEN_START_Y,
  PEN_START_Z,
  SPEED_PHYSICS_CONFIG,
} from '../engine/pen-fight-constants';
import { computeFlickSpin, speedOf } from '../engine/pen-fight-utils';
import { usePenFightAI } from '../hooks/use-pen-fight-ai';
import { usePenFightDragAim } from '../hooks/use-pen-fight-drag-aim';
import { usePenFightFollower, usePenFightHostSync } from '../hooks/use-pen-fight-host-sync';
import { usePenFightRoundResolution } from '../hooks/use-pen-fight-round-resolution';
import { usePenFightSound } from '../hooks/use-pen-fight-sound';
import type {
  FlickImpulse,
  PenFightOutcome,
  PenFightPlayerId,
  PenFightState,
  PenSyncPayload,
} from '../types/pen-fight.types';
import { PenFightAimIndicator } from './PenFightAimIndicator';
import { PenModel } from './PenModel';

export interface PenFightArenaHandle {
  resetPositions: () => void;
  performFlick: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => void;
  /** Snaps both pens onto an authoritative snapshot received from the other device. */
  applyPenSync: (payload: PenSyncPayload) => void;
}

interface PenFightMatchProps {
  state: PenFightState;
  hasOpponent?: boolean;
  isMyTurn?: boolean;
  /** True when this client owns the simulation: any offline mode, or the online host. */
  isAuthority?: boolean;
  onFlickTaken: () => void;
  onBeginSettling: () => void;
  onResolveRound: (winner: PenFightOutcome) => void;
  onLocalFlick?: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => void;
  onPenSync?: (payload: PenSyncPayload) => void;
}

const QUAT_IDENTITY = { x: 0, y: 0, z: 0, w: 1 };
const QUAT_180_Y = { x: 0, y: 1, z: 0, w: 0 };
const ZERO_VEC = { x: 0, y: 0, z: 0 };

const PEN_PHYSICS_PROPS = {
  colliders: 'hull' as const,
  friction: PEN_FRICTION,
  restitution: PEN_RESTITUTION,
  density: 2.2,
  ccd: true,
};

/** Aiming is open only on your own turn, and online only once an opponent is actually present. */
function canPlayerAim(state: PenFightState, hasOpponent: boolean, isMyTurn: boolean): boolean {
  if (state.phase !== 'aiming') return false;
  if (state.players[state.activePlayer].isAI) return false;
  if (state.mode !== 'online') return true;
  return hasOpponent && isMyTurn;
}

/** Physics bodies, drag-to-aim input, AI turns, and round resolution — rendered inside <Physics>. */
export const PenFightMatch = forwardRef<PenFightArenaHandle, PenFightMatchProps>(
  function PenFightMatch(
    {
      state,
      hasOpponent = true,
      isMyTurn = true,
      isAuthority = true,
      onFlickTaken,
      onBeginSettling,
      onResolveRound,
      onLocalFlick,
      onPenSync,
    },
    ref,
  ) {
    const p1Ref = useRef<RapierRigidBody | null>(null);
    const p2Ref = useRef<RapierRigidBody | null>(null);
    const sound = usePenFightSound();

    const speedConfig = SPEED_PHYSICS_CONFIG[state.speedMode || 'normal'];
    const penPhysicsProps = {
      ...PEN_PHYSICS_PROPS,
      linearDamping: speedConfig.linearDamping,
      angularDamping: speedConfig.angularDamping,
    };

    const { beginRound, resetRound } = usePenFightRoundResolution({
      p1Ref,
      p2Ref,
      onResolveRound,
      sound,
      isAuthority,
    });

    const { flushSync } = usePenFightHostSync({
      p1Ref,
      p2Ref,
      enabled: isAuthority && state.mode === 'online',
      onSync: onPenSync,
    });

    const performFlick = useCallback(
      (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => {
        const body = playerId === 'p1' ? p1Ref.current : p2Ref.current;
        if (!body) return;

        // Flicks are specified as a launch speed rather than a raw impulse, so the feel stays
        // the same whatever the pen's mass works out to. Mass comes from the collider, which is
        // identical on every device, so the impulse is too.
        const launchSpeed =
          (MIN_FLICK_SPEED + power * (MAX_FLICK_SPEED - MIN_FLICK_SPEED)) *
          speedConfig.speedMultiplier;
        const impulseMag = launchSpeed * body.mass();

        // Spin is derived from the flick itself rather than Math.random(): every device must
        // compute the identical impulse for the same flick, or the simulations drift apart.
        const spin = computeFlickSpin(direction, power);

        body.wakeUp();
        body.applyImpulse({ x: direction.x * impulseMag, y: 0, z: direction.z * impulseMag }, true);
        const angvel = body.angvel();
        body.setAngvel(
          { x: angvel.x, y: angvel.y + spin * MAX_FLICK_SPIN * (0.4 + power * 0.6), z: angvel.z },
          true,
        );

        beginRound();
        flushSync();
        sound.playFlick(power);
        onFlickTaken();
        onBeginSettling();
      },
      [beginRound, flushSync, onFlickTaken, onBeginSettling, sound, speedConfig.speedMultiplier],
    );

    const handleUserFlick = useCallback(
      (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => {
        performFlick(playerId, direction, power);
        onLocalFlick?.(playerId, direction, power);
      },
      [performFlick, onLocalFlick],
    );

    const resetPositions = useCallback(() => {
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;
      if (p1) {
        p1.setTranslation({ x: 0, y: PEN_START_Y, z: PEN_START_Z }, true);
        p1.setRotation(QUAT_180_Y, true);
        p1.setLinvel(ZERO_VEC, true);
        p1.setAngvel(ZERO_VEC, true);
      }
      if (p2) {
        p2.setTranslation({ x: 0, y: PEN_START_Y, z: -PEN_START_Z }, true);
        p2.setRotation(QUAT_IDENTITY, true);
        p2.setLinvel(ZERO_VEC, true);
        p2.setAngvel(ZERO_VEC, true);
      }
      resetRound();
      flushSync();
    }, [resetRound, flushSync]);

    /** Non-authority clients follow the host's snapshots instead of their own simulation. */
    const applyPenSync = usePenFightFollower(p1Ref, p2Ref);

    useImperativeHandle(ref, () => ({ resetPositions, performFlick, applyPenSync }), [
      resetPositions,
      performFlick,
      applyPenSync,
    ]);

    usePenFightAI({ state, p1Ref, p2Ref, onFlick: performFlick });

    const canAim = canPlayerAim(state, hasOpponent, isMyTurn);
    const { handlePointerDown, handlePointerMove, handlePointerUp, aimPreview } =
      usePenFightDragAim({
        canAim,
        activePlayer: state.activePlayer,
        playerColor: state.players[state.activePlayer].color,
        p1Ref,
        p2Ref,
        onFlick: handleUserFlick,
      });

    const handlePenCollision = useCallback(() => {
      const impact =
        speedOf(p1Ref.current?.linvel() ?? ZERO_VEC) + speedOf(p2Ref.current?.linvel() ?? ZERO_VEC);
      sound.playCollision(impact / 10);
    }, [sound]);

    return (
      <>
        <RigidBody
          ref={p1Ref}
          {...penPhysicsProps}
          position={[0, PEN_START_Y, PEN_START_Z]}
          rotation={[0, Math.PI, 0]}
          onCollisionEnter={(payload) => {
            if (payload.other.rigidBody === p2Ref.current) handlePenCollision();
          }}
        >
          <PenModel
            color={state.players.p1.color}
            highlight={canAim && state.activePlayer === 'p1'}
          />
        </RigidBody>

        <RigidBody
          ref={p2Ref}
          {...penPhysicsProps}
          position={[0, PEN_START_Y, -PEN_START_Z]}
          rotation={[0, 0, 0]}
        >
          <PenModel
            color={state.players.p2.color}
            highlight={canAim && state.activePlayer === 'p2'}
          />
        </RigidBody>

        {/* Invisible aiming plane — generously oversized so drags never leave it. */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, PEN_START_Y, 0]}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <planeGeometry args={[16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {aimPreview && <PenFightAimIndicator aimPreview={aimPreview} />}
      </>
    );
  },
);
