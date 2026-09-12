'use client';

import { useEffect, useRef } from 'react';
import type { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import { RigidBody } from '@react-three/rapier';

interface LudoDice3DProps {
  rolling: boolean;
  targetValue: number | null;
  onRollComplete?: () => void;
  onRollDice?: () => void;
}

export function LudoDice3D({
  rolling,
  targetValue,
  onRollComplete,
  onRollDice,
}: LudoDice3DProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const isRollingRef = useRef(false);
  const quietFramesRef = useRef(0);

  useEffect(() => {
    if (rolling && targetValue && !isRollingRef.current && bodyRef.current) {
      isRollingRef.current = true;
      quietFramesRef.current = 0;

      // Apply physics impulse + random torque for real tumble
      bodyRef.current.wakeUp();
      bodyRef.current.setTranslation({ x: 0, y: 2.2, z: 0 }, true);
      bodyRef.current.setLinvel(
        {
          x: (Math.random() - 0.5) * 3,
          y: 4 + Math.random() * 2,
          z: (Math.random() - 0.5) * 3,
        },
        true,
      );
      bodyRef.current.setAngvel(
        {
          x: (Math.random() - 0.5) * 30,
          y: (Math.random() - 0.5) * 30,
          z: (Math.random() - 0.5) * 30,
        },
        true,
      );
    }
  }, [rolling, targetValue]);

  useFrame(() => {
    if (!isRollingRef.current || !bodyRef.current) return;

    const linvel = bodyRef.current.linvel();
    const angvel = bodyRef.current.angvel();
    const speed = Math.hypot(linvel.x, linvel.y, linvel.z);
    const rotSpeed = Math.hypot(angvel.x, angvel.y, angvel.z);

    if (speed < 0.1 && rotSpeed < 0.2) {
      quietFramesRef.current += 1;
      if (quietFramesRef.current >= 10) {
        isRollingRef.current = false;
        quietFramesRef.current = 0;

        if (onRollComplete) {
          onRollComplete();
        }
      }
    } else {
      quietFramesRef.current = 0;
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders="cuboid"
      restitution={0.65}
      friction={0.4}
      position={[0, 0.8, 0]}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e) => {
          if (onRollDice) {
            e.stopPropagation();
            onRollDice();
          }
        }}
        onPointerOver={(e) => {
          if (onRollDice) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}
