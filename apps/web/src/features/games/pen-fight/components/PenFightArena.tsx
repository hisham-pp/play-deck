'use client';

import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import React, { forwardRef } from 'react';
import { PCFShadowMap, type PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import '@/lib/three-patch';
import {
  PHYSICS_SOLVER_ITERATIONS,
  PHYSICS_TIME_STEP,
  WORLD_GRAVITY,
} from '../engine/pen-fight-constants';
import type {
  FlickImpulse,
  PenFightOutcome,
  PenFightPlayerId,
  PenFightState,
  PenSyncPayload,
} from '../types/pen-fight.types';
import { ArenaLighting } from './ArenaLighting';
import { BackgroundScoreboard } from './BackgroundScoreboard';
import { PenFightMatch, type PenFightArenaHandle } from './PenFightMatch';
import { TableSurface } from './TableSurface';

export type { PenFightArenaHandle };

interface PenFightArenaProps {
  state: PenFightState;
  role?: 'host' | 'guest' | null;
  hasOpponent?: boolean;
  isMyTurn?: boolean;
  isAuthority?: boolean;
  onFlickTaken: () => void;
  onBeginSettling: () => void;
  onResolveRound: (winner: PenFightOutcome) => void;
  onLocalFlick?: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => void;
  onPenSync?: (payload: PenSyncPayload) => void;
}

/** Full-viewport 3D canvas hosting the physics arena — kept intentionally thin. */
export const PenFightArena = forwardRef<PenFightArenaHandle, PenFightArenaProps>(
  function PenFightArena(props, ref) {
    const isGuest = props.state.mode === 'online' && props.role === 'guest';
    const cameraPos: [number, number, number] = isGuest ? [0, 2.3, -3.8] : [0, 2.3, 3.8];

    return (
      <Canvas shadows={{ type: PCFShadowMap }} dpr={[1, 2]} className="h-full w-full touch-none">
        <PerspectiveCamera
          makeDefault
          position={cameraPos}
          fov={48}
          onUpdate={(camera: ThreePerspectiveCamera) => camera.lookAt(0, 0.1, 0)}
        />
        <ArenaLighting />
        <BackgroundScoreboard state={props.state} flipped={isGuest} />
        {/* Fixed step so every device integrates the simulation identically. */}
        <Physics
          gravity={[0, WORLD_GRAVITY, 0]}
          timeStep={PHYSICS_TIME_STEP}
          numSolverIterations={PHYSICS_SOLVER_ITERATIONS}
        >
          <TableSurface />
          <PenFightMatch ref={ref} {...props} />
        </Physics>
      </Canvas>
    );
  },
);
