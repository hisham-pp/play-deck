'use client';

import React from 'react';
import { PEN_LENGTH, PEN_RADIUS } from '../engine/pen-fight-constants';

interface PenModelProps {
  color: string;
  highlight?: boolean;
}

const BODY_LENGTH = PEN_LENGTH * 0.62;
const GRIP_LENGTH = PEN_LENGTH * 0.16;
const NIB_LENGTH = PEN_LENGTH * 0.22;

/**
 * A stylized-but-physically-proportioned pen: barrel + rubber grip + metal nib + pocket clip.
 * Built from primitives (no external assets) so materials stay crisp under the arena lighting.
 */
export function PenModel({ color, highlight = false }: PenModelProps) {
  const halfLength = PEN_LENGTH / 2;
  const nibCenterZ = halfLength - NIB_LENGTH / 2;
  const gripCenterZ = halfLength - NIB_LENGTH - GRIP_LENGTH / 2;
  const bodyCenterZ = gripCenterZ - GRIP_LENGTH / 2 - BODY_LENGTH / 2;
  const capCenterZ = bodyCenterZ - BODY_LENGTH / 2 - 0.015;

  return (
    <group>
      {/* Barrel */}
      <mesh castShadow receiveShadow position={[0, 0, bodyCenterZ]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[PEN_RADIUS, PEN_RADIUS * 1.08, BODY_LENGTH, 20]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.25}
          roughness={0.3}
          clearcoat={0.7}
          clearcoatRoughness={0.2}
          emissive={highlight ? color : '#000000'}
          emissiveIntensity={highlight ? 0.22 : 0}
        />
      </mesh>

      {/* Rubber grip */}
      <mesh castShadow receiveShadow position={[0, 0, gripCenterZ]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[PEN_RADIUS * 1.12, PEN_RADIUS * 1.05, GRIP_LENGTH, 20]} />
        <meshStandardMaterial color="#14181f" roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Metal nib cone */}
      <mesh castShadow receiveShadow position={[0, 0, nibCenterZ]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[PEN_RADIUS * 0.92, NIB_LENGTH, 20]} />
        <meshStandardMaterial color="#d7dbe2" metalness={0.9} roughness={0.22} />
      </mesh>

      {/* Back cap */}
      <mesh castShadow receiveShadow position={[0, 0, capCenterZ]}>
        <sphereGeometry args={[PEN_RADIUS * 1.02, 16, 16]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.25}
          roughness={0.3}
          clearcoat={0.7}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Pocket clip */}
      <mesh
        castShadow
        position={[0, PEN_RADIUS * 1.15, bodyCenterZ - BODY_LENGTH * 0.12]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <boxGeometry args={[PEN_RADIUS * 0.55, BODY_LENGTH * 0.5, PEN_RADIUS * 0.22]} />
        <meshStandardMaterial color="#d7dbe2" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
}
