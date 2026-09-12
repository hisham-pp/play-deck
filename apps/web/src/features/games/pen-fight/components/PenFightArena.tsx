'use client';

import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import React, { forwardRef } from 'react';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import type { PenFightOutcome, PenFightState } from '../types/pen-fight.types';
import { ArenaLighting } from './ArenaLighting';
import { BackgroundScoreboard } from './BackgroundScoreboard';
import { PenFightMatch, type PenFightArenaHandle } from './PenFightMatch';
import { TableSurface } from './TableSurface';

export type { PenFightArenaHandle };

interface PenFightArenaProps {
  state: PenFightState;
  onFlickTaken: () => void;
  onBeginSettling: () => void;
  onResolveRound: (winner: PenFightOutcome) => void;
}

/** Full-viewport 3D canvas hosting the physics arena — kept intentionally thin. */
export const PenFightArena = forwardRef<PenFightArenaHandle, PenFightArenaProps>(
  function PenFightArena(props, ref) {
    return (
      <Canvas shadows dpr={[1, 2]} className="h-full w-full touch-none">
        <PerspectiveCamera
          makeDefault
          position={[0, 2.3, 3.8]}
          fov={48}
          onUpdate={(camera: ThreePerspectiveCamera) => camera.lookAt(0, 0.1, 0)}
        />
        <ArenaLighting />
        <BackgroundScoreboard state={props.state} />
        <Physics gravity={[0, -9.81, 0]}>
          <TableSurface />
          <PenFightMatch ref={ref} {...props} />
        </Physics>
      </Canvas>
    );
  },
);
