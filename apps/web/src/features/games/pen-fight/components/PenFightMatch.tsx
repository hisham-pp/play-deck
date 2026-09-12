'use client';

import { RigidBody, type RapierRigidBody } from '@react-three/rapier';
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import {
  MAX_FLICK_IMPULSE,
  MIN_FLICK_IMPULSE,
  PEN_START_Y,
  PEN_START_Z,
} from '../engine/pen-fight-constants';
import { speedOf } from '../engine/pen-fight-utils';
import { usePenFightAI } from '../hooks/use-pen-fight-ai';
import { usePenFightDragAim } from '../hooks/use-pen-fight-drag-aim';
import { usePenFightRoundResolution } from '../hooks/use-pen-fight-round-resolution';
import { usePenFightSound } from '../hooks/use-pen-fight-sound';
import type {
  FlickImpulse,
  PenFightOutcome,
  PenFightPlayerId,
  PenFightState,
} from '../types/pen-fight.types';
import { PenFightAimIndicator } from './PenFightAimIndicator';
import { PenModel } from './PenModel';

export interface PenFightArenaHandle {
  resetPositions: () => void;
}

interface PenFightMatchProps {
  state: PenFightState;
  onFlickTaken: () => void;
  onBeginSettling: () => void;
  onResolveRound: (winner: PenFightOutcome) => void;
}

const QUAT_IDENTITY = { x: 0, y: 0, z: 0, w: 1 };
const QUAT_180_Y = { x: 0, y: 1, z: 0, w: 0 };
const ZERO_VEC = { x: 0, y: 0, z: 0 };

const PEN_PHYSICS_PROPS = {
  colliders: 'hull' as const,
  friction: 0.9,
  restitution: 0.12,
  linearDamping: 0.65,
  angularDamping: 0.8,
  density: 2.2,
  ccd: true,
};

/** Physics bodies, drag-to-aim input, AI turns, and round resolution — rendered inside <Physics>. */
export const PenFightMatch = forwardRef<PenFightArenaHandle, PenFightMatchProps>(
  function PenFightMatch({ state, onFlickTaken, onBeginSettling, onResolveRound }, ref) {
    const p1Ref = useRef<RapierRigidBody | null>(null);
    const p2Ref = useRef<RapierRigidBody | null>(null);
    const sound = usePenFightSound();

    const { beginRound, resetRound } = usePenFightRoundResolution({
      p1Ref,
      p2Ref,
      onResolveRound,
      sound,
    });

    const performFlick = useCallback(
      (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => {
        const body = playerId === 'p1' ? p1Ref.current : p2Ref.current;
        if (!body) return;

        const impulseMag = MIN_FLICK_IMPULSE + power * (MAX_FLICK_IMPULSE - MIN_FLICK_IMPULSE);
        body.wakeUp();
        body.applyImpulse({ x: direction.x * impulseMag, y: 0, z: direction.z * impulseMag }, true);
        body.applyTorqueImpulse({ x: 0, y: (Math.random() - 0.5) * impulseMag * 0.5, z: 0 }, true);

        beginRound();
        sound.playFlick(power);
        onFlickTaken();
        onBeginSettling();
      },
      [beginRound, onFlickTaken, onBeginSettling, sound],
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
    }, [resetRound]);

    useImperativeHandle(ref, () => ({ resetPositions }), [resetPositions]);

    usePenFightAI({ state, p1Ref, p2Ref, onFlick: performFlick });

    const canAim = state.phase === 'aiming' && !state.players[state.activePlayer].isAI;
    const { handlePointerDown, handlePointerMove, handlePointerUp, aimPreview } =
      usePenFightDragAim({
        canAim,
        activePlayer: state.activePlayer,
        playerColor: state.players[state.activePlayer].color,
        p1Ref,
        p2Ref,
        onFlick: performFlick,
      });

    const handlePenCollision = useCallback(() => {
      const impact =
        speedOf(p1Ref.current?.linvel() ?? ZERO_VEC) + speedOf(p2Ref.current?.linvel() ?? ZERO_VEC);
      sound.playCollision(impact / 6);
    }, [sound]);

    return (
      <>
        <RigidBody
          ref={p1Ref}
          {...PEN_PHYSICS_PROPS}
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
          {...PEN_PHYSICS_PROPS}
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
