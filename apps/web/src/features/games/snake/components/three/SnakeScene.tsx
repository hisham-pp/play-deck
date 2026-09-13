'use client';

import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  type PerspectiveCamera as ThreePerspectiveCamera,
} from 'three';
import '@/lib/three-patch';
import type { Coordinate, Direction, SnakeGameStatus } from '../../types/snake.types';
import { ARENA_SPAN, PALETTE } from './snake-scene-config';
import { Snake3D } from './Snake3D';
import { SnakeArena3D } from './SnakeArena3D';
import { SnakeFood3D } from './SnakeFood3D';

export interface SnakeSceneProps {
  snake: Coordinate[];
  food: Coordinate;
  gridSize: number;
  direction: Direction;
  status: SnakeGameStatus;
  speedMs: number;
}

/** Fixed rig: near top-down so the board reads flat and never moves. */
const CAMERA_POSITION: [number, number, number] = [0, 86, 20];

function SceneLighting() {
  return (
    <>
      <color attach="background" args={[PALETTE.background]} />

      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#b9d3ff', '#1c2740', 0.6]} />

      <directionalLight
        position={[16, 15, 6]}
        intensity={2.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-ARENA_SPAN * 0.75}
        shadow-camera-right={ARENA_SPAN * 0.75}
        shadow-camera-top={ARENA_SPAN * 0.75}
        shadow-camera-bottom={-ARENA_SPAN * 0.75}
        shadow-camera-near={2}
        shadow-camera-far={56}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-radius={3}
      />

      {/* Cool rim light to separate the snake from the board */}
      <directionalLight position={[-13, 10, -12]} intensity={1} color="#8fb6ff" />
    </>
  );
}

export default function SnakeScene({
  snake,
  food,
  gridSize,
  direction,
  status,
  speedMs,
}: SnakeSceneProps) {
  return (
    <Canvas
      shadows={{ type: PCFSoftShadowMap }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      className="h-full w-full touch-none"
    >
      <PerspectiveCamera
        makeDefault
        position={CAMERA_POSITION}
        fov={14}
        near={40}
        far={140}
        onUpdate={(camera: ThreePerspectiveCamera) => camera.lookAt(0, 0, 0)}
      />
      <SceneLighting />

      <SnakeArena3D gridSize={gridSize} />
      <SnakeFood3D food={food} gridSize={gridSize} status={status} />
      <Snake3D
        snake={snake}
        gridSize={gridSize}
        direction={direction}
        status={status}
        speedMs={speedMs}
      />
    </Canvas>
  );
}
