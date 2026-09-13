'use client';

import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { AdditiveBlending, DoubleSide, Group, Mesh, MeshBasicMaterial, PointLight } from 'three';
import type { Coordinate, SnakeGameStatus } from '../../types/snake.types';
import { cellSize, gridToWorldX, gridToWorldZ, PALETTE } from './snake-scene-config';

interface SnakeFood3DProps {
  food: Coordinate;
  gridSize: number;
  status: SnakeGameStatus;
}

const POP_DURATION = 0.55;

interface PopMark {
  id: number;
  x: number;
  z: number;
}

/** Expanding shockwave ring left behind where a pellet was swallowed. */
function FoodPop({ mark, cell }: { mark: PopMark; cell: number }) {
  const ringRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    elapsed.current = 0;
  }, [mark.id]);

  useFrame((_, delta) => {
    const ring = ringRef.current;
    if (!ring) return;
    elapsed.current += delta;
    const t = Math.min(1, elapsed.current / POP_DURATION);
    const scale = cell * (0.6 + t * 2.6);
    ring.scale.set(scale, scale, scale);
    ring.visible = t < 1;
    (ring.material as MeshBasicMaterial).opacity = (1 - t) * 0.75;
    if (lightRef.current) lightRef.current.intensity = (1 - t) * 6;
  });

  return (
    <group position={[mark.x, cell * 0.06, mark.z]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.5, 40]} />
        <meshBasicMaterial
          color={PALETTE.wallTrim}
          transparent
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight ref={lightRef} color={PALETTE.wallTrim} distance={cell * 6} decay={2} />
    </group>
  );
}

/** A glossy apple: the pellet the snake is chasing. */
export function SnakeFood3D({ food, gridSize, status }: SnakeFood3DProps) {
  const groupRef = useRef<Group>(null);
  const clock = useRef(0);
  const [pop, setPop] = useState<PopMark | null>(null);
  const previous = useRef(food);
  const popId = useRef(0);

  const cell = cellSize(gridSize);
  const isPlaced = food.x >= 0 && food.y >= 0;

  useEffect(() => {
    const before = previous.current;
    previous.current = food;
    if (before.x < 0 || (before.x === food.x && before.y === food.y)) return;
    popId.current += 1;
    setPop({
      id: popId.current,
      x: gridToWorldX(before.x, gridSize),
      z: gridToWorldZ(before.y, gridSize),
    });
  }, [food, gridSize]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || status === 'paused') return;
    clock.current += delta;
    group.rotation.y = clock.current * 0.7;
    group.position.y = cell * 0.42 + Math.sin(clock.current * 2.1) * cell * 0.06;
  });

  return (
    <group>
      {pop ? <FoodPop mark={pop} cell={cell} /> : null}

      {isPlaced ? (
        <group
          ref={groupRef}
          position={[gridToWorldX(food.x, gridSize), cell * 0.42, gridToWorldZ(food.y, gridSize)]}
        >
          <mesh castShadow scale={[cell * 0.72, cell * 0.66, cell * 0.72]}>
            <sphereGeometry args={[0.5, 26, 20]} />
            <meshPhysicalMaterial
              color={PALETTE.apple}
              roughness={0.26}
              metalness={0.03}
              clearcoat={1}
              clearcoatRoughness={0.14}
              sheen={0.4}
              sheenColor="#ff8080"
            />
          </mesh>

          {/* Stem */}
          <mesh castShadow position={[0, cell * 0.34, 0]} rotation={[0.18, 0, 0.12]}>
            <cylinderGeometry args={[cell * 0.025, cell * 0.035, cell * 0.24, 8]} />
            <meshStandardMaterial color={PALETTE.appleStem} roughness={0.85} />
          </mesh>

          {/* Leaf */}
          <mesh
            castShadow
            position={[cell * 0.14, cell * 0.4, 0]}
            rotation={[0, 0.5, -0.5]}
            scale={[cell * 0.26, cell * 0.04, cell * 0.14]}
          >
            <sphereGeometry args={[0.5, 12, 8]} />
            <meshStandardMaterial color={PALETTE.appleLeaf} roughness={0.6} side={DoubleSide} />
          </mesh>

          <pointLight
            color="#ff5a5a"
            intensity={cell * 1.6}
            distance={cell * 5}
            decay={2}
            position={[0, cell * 0.1, 0]}
          />
        </group>
      ) : null}
    </group>
  );
}
