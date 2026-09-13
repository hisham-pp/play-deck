'use client';

import React from 'react';
import type { Group, Texture } from 'three';
import { PALETTE } from './snake-scene-config';

interface SnakeHeadPartsProps {
  /** World size of one grid cell — every feature is expressed as a fraction. */
  cell: number;
  skinMap: Texture;
  skinNormalMap: Texture;
  dead: boolean;
  tongueRef: React.Ref<Group>;
}

/**
 * The head is modelled by hand out of squashed primitives — cranium, snout,
 * brow ridges, slit pupils, nostrils and a flicking forked tongue. It is built
 * facing -Z so the parent group can simply `lookAt` the travel direction.
 */
export function SnakeHeadParts({
  cell,
  skinMap,
  skinNormalMap,
  dead,
  tongueRef,
}: SnakeHeadPartsProps) {
  const hideColor = dead ? PALETTE.dead : '#4aa96c';
  const eyeColor = dead ? '#3b1f22' : '#f7c948';

  return (
    <group>
      {/* Cranium */}
      <mesh castShadow scale={[cell * 0.84, cell * 0.62, cell * 1.18]}>
        <sphereGeometry args={[0.5, 24, 18]} />
        <meshStandardMaterial
          map={skinMap}
          normalMap={skinNormalMap}
          normalScale={[0.8, 0.8]}
          color={hideColor}
          roughness={0.38}
          metalness={0.08}
        />
      </mesh>

      {/* Snout, narrower and dipped slightly down */}
      <mesh
        castShadow
        position={[0, -cell * 0.03, -cell * 0.5]}
        scale={[cell * 0.52, cell * 0.42, cell * 0.6]}
      >
        <sphereGeometry args={[0.5, 20, 14]} />
        <meshStandardMaterial
          map={skinMap}
          normalMap={skinNormalMap}
          color={hideColor}
          roughness={0.36}
          metalness={0.08}
        />
      </mesh>

      {/* Mouth line */}
      <mesh
        position={[0, -cell * 0.17, -cell * 0.32]}
        scale={[cell * 0.74, cell * 0.05, cell * 0.8]}
      >
        <sphereGeometry args={[0.5, 16, 10]} />
        <meshStandardMaterial color="#10201a" roughness={0.55} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Brow ridge */}
          <mesh
            castShadow
            position={[side * cell * 0.27, cell * 0.2, -cell * 0.12]}
            scale={[cell * 0.3, cell * 0.14, cell * 0.42]}
          >
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshStandardMaterial color={hideColor} roughness={0.42} metalness={0.06} />
          </mesh>

          {/* Eyeball */}
          <mesh position={[side * cell * 0.31, cell * 0.11, -cell * 0.22]}>
            <sphereGeometry args={[cell * 0.115, 20, 16]} />
            <meshStandardMaterial
              color={eyeColor}
              roughness={0.12}
              metalness={0.25}
              emissive={eyeColor}
              emissiveIntensity={dead ? 0.02 : 0.35}
            />
          </mesh>

          {/* Vertical slit pupil */}
          <mesh position={[side * cell * 0.39, cell * 0.11, -cell * 0.25]} scale={[0.35, 1, 0.5]}>
            <sphereGeometry args={[cell * 0.062, 12, 12]} />
            <meshStandardMaterial color="#05080a" roughness={0.05} metalness={0.1} />
          </mesh>

          {/* Nostril */}
          <mesh position={[side * cell * 0.12, cell * 0.02, -cell * 0.73]}>
            <sphereGeometry args={[cell * 0.032, 8, 8]} />
            <meshStandardMaterial color="#0b1410" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Forked tongue — flicked by the parent via the forwarded ref */}
      <group ref={tongueRef} position={[0, -cell * 0.14, -cell * 0.72]}>
        <mesh position={[0, 0, -cell * 0.16]} scale={[cell * 0.05, cell * 0.04, cell * 0.34]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#e0396b" roughness={0.3} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * cell * 0.055, 0, -cell * 0.38]}
            rotation={[0, side * 0.34, 0]}
            scale={[cell * 0.035, cell * 0.03, cell * 0.18]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#e0396b" roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
