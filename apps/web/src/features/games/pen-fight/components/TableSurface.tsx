'use client';

import { RigidBody } from '@react-three/rapier';
import React, { useMemo } from 'react';
import { TABLE_DEPTH, TABLE_HEIGHT, TABLE_WIDTH } from '../engine/pen-fight-constants';
import { createTableTexture } from '../utils/create-table-texture';

export function TableSurface() {
  const texture = useMemo(
    () => (typeof document !== 'undefined' ? createTableTexture() : null),
    [],
  );

  const legHeight = 1.4;
  const legThickness = 0.12;
  const legY = -TABLE_HEIGHT / 2 - legHeight / 2;
  const legOffsetX = TABLE_WIDTH / 2 - 0.15;
  const legOffsetZ = TABLE_DEPTH / 2 - 0.18;

  const legPositions: [number, number, number][] = [
    [-legOffsetX, legY, legOffsetZ],
    [legOffsetX, legY, legOffsetZ],
    [-legOffsetX, legY, -legOffsetZ],
    [legOffsetX, legY, -legOffsetZ],
  ];

  return (
    <group>
      {/* Tabletop Physics Rigid Body */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.85} restitution={0.15}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[TABLE_WIDTH, TABLE_HEIGHT, TABLE_DEPTH]} />
          {texture ? (
            <meshStandardMaterial map={texture} roughness={0.72} metalness={0.04} />
          ) : (
            <meshStandardMaterial color="#7a4a2b" roughness={0.72} metalness={0.04} />
          )}
        </mesh>

        {/* Decorative Table Apron (Under-frame) */}
        <mesh receiveShadow position={[0, -TABLE_HEIGHT / 2 - 0.04, 0]}>
          <boxGeometry args={[TABLE_WIDTH - 0.1, 0.08, TABLE_DEPTH - 0.1]} />
          <meshStandardMaterial color="#4a2c18" roughness={0.8} metalness={0.02} />
        </mesh>
      </RigidBody>

      {/* Visual Table Legs (non-colliding decorative objects) */}
      {legPositions.map((pos, idx) => (
        <mesh key={idx} position={pos} castShadow receiveShadow>
          <boxGeometry args={[legThickness, legHeight, legThickness]} />
          <meshStandardMaterial color="#3d2313" roughness={0.78} metalness={0.05} />
        </mesh>
      ))}

      {/* Crossbar lower support frame */}
      <mesh position={[0, legY - 0.2, 0]} receiveShadow>
        <boxGeometry args={[TABLE_WIDTH - 0.25, 0.06, 0.06]} />
        <meshStandardMaterial color="#301b0e" roughness={0.8} />
      </mesh>
    </group>
  );
}
