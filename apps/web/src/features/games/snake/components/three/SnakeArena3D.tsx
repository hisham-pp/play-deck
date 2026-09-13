'use client';

import React, { useMemo } from 'react';
import { createBoardTexture } from './create-snake-textures';
import { ARENA_SPAN, PALETTE } from './snake-scene-config';

interface SnakeArena3DProps {
  gridSize: number;
}

const HALF = ARENA_SPAN / 2;
const BORDER = 0.3;

/**
 * A deliberately plain board: a flat grid panel with a thin border. All the
 * dimensionality in the scene belongs to the snake, which casts its shadow here.
 */
export function SnakeArena3D({ gridSize }: SnakeArena3DProps) {
  const texture = useMemo(() => createBoardTexture(), []);

  // One texture tile per grid cell, so the seams sit exactly on the play grid.
  useMemo(() => {
    texture.repeat.set(gridSize, gridSize);
    texture.needsUpdate = true;
  }, [texture, gridSize]);

  return (
    <group>
      {/* Play surface */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ARENA_SPAN, ARENA_SPAN]} />
        <meshStandardMaterial map={texture} color="#7d8aa0" roughness={0.95} metalness={0} />
      </mesh>

      {/* Flat border framing the playfield */}
      {[
        [0, -HALF - BORDER / 2, ARENA_SPAN + BORDER * 2, BORDER],
        [0, HALF + BORDER / 2, ARENA_SPAN + BORDER * 2, BORDER],
        [-HALF - BORDER / 2, 0, BORDER, ARENA_SPAN],
        [HALF + BORDER / 2, 0, BORDER, ARENA_SPAN],
      ].map(([x, z, width, depth]) => (
        <mesh key={`${x}:${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, z]}>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial
            color={PALETTE.wallTrim}
            emissive={PALETTE.wallTrim}
            emissiveIntensity={0.35}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
