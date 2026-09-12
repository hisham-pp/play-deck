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

  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.85} restitution={0.15}>
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[TABLE_WIDTH, TABLE_HEIGHT, TABLE_DEPTH]} />
        {texture ? (
          <meshStandardMaterial map={texture} roughness={0.72} metalness={0.04} />
        ) : (
          <meshStandardMaterial color="#7a4a2b" roughness={0.72} metalness={0.04} />
        )}
      </mesh>
    </RigidBody>
  );
}
