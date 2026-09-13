'use client';

import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import type { Group, Mesh, Vector3 } from 'three';
import type { Coordinate, Direction, SnakeGameStatus } from '../../types/snake.types';
import { createSnakeSkinTextures } from './create-snake-textures';
import { writeSpine } from './snake-body-geometry';
import { createSnakeMotion } from './snake-motion';
import { cellSize, DIRECTION_YAW } from './snake-scene-config';
import { createSnakeTubeGeometry, createTubeScratch, writeSnakeTube } from './snake-tube';
import { SnakeHeadParts } from './SnakeHeadParts';

interface Snake3DProps {
  snake: Coordinate[];
  gridSize: number;
  direction: Direction;
  status: SnakeGameStatus;
  speedMs: number;
}

const TONGUE_PERIOD = 1.45;
const TONGUE_FLICK = 0.3;

/** Shortest-path angle interpolation, so a left turn never spins 270 degrees. */
function lerpAngle(from: number, to: number, t: number): number {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * t;
}

interface HeadFrame {
  cell: number;
  sink: number;
  yawTarget: number;
  delta: number;
  clock: number;
  deadMix: number;
  dead: boolean;
}

/** Drives the head group's pose and the periodic tongue flick. */
function poseHead(head: Group, tongue: Group | null, yaw: number, frame: HeadFrame): number {
  const nextYaw = lerpAngle(yaw, frame.yawTarget, Math.min(1, frame.delta * 14));
  head.position.y =
    frame.cell * 0.33 + Math.sin(frame.clock * 3.1) * frame.cell * 0.015 - frame.sink;
  head.rotation.set(frame.deadMix * 0.5, nextYaw, frame.deadMix * 0.35);

  if (tongue) {
    const phase = frame.clock % TONGUE_PERIOD;
    const flick =
      frame.dead || phase > TONGUE_FLICK ? 0 : Math.sin((phase / TONGUE_FLICK) * Math.PI);
    tongue.visible = flick > 0.03;
    tongue.scale.set(1, 1, flick);
    tongue.rotation.y = Math.sin(frame.clock * 22) * 0.12 * flick;
  }

  return nextYaw;
}

/**
 * The snake itself: a continuous scaled tube skinned over the spline through the
 * interpolated engine path, capped by a hand-modelled head.
 */
export function Snake3D({ snake, gridSize, direction, status, speedMs }: Snake3DProps) {
  const skin = useMemo(() => createSnakeSkinTextures(), []);
  const geometry = useMemo(() => createSnakeTubeGeometry(), []);
  const scratch = useRef(createTubeScratch());
  const motion = useRef(createSnakeMotion(snake));
  const anim = useRef<{
    clock: number;
    deadMix: number;
    yaw: number;
    spinePool: Vector3[];
  }>({ clock: 0, deadMix: 0, yaw: DIRECTION_YAW.RIGHT, spinePool: [] });
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Group>(null);
  const tongueRef = useRef<Group>(null);

  const cell = cellSize(gridSize);
  const isDead = status === 'game-over';

  useFrame((_, rawDelta) => {
    const head = headRef.current;
    if (!head) return;

    const state = anim.current;
    const delta = Math.min(rawDelta, 0.1);
    if (status !== 'paused') state.clock += delta;
    state.deadMix += ((isDead ? 1 : 0) - state.deadMix) * Math.min(1, delta * 4);

    motion.current.sync(snake);
    const path = motion.current.advance(delta, speedMs, status === 'playing');
    const spine = writeSpine(path, gridSize, state.spinePool);
    if (spine.length < 2) return;

    const sink = state.deadMix * cell * 0.1;
    writeSnakeTube(geometry, scratch.current, {
      spine,
      cell,
      time: state.clock,
      sink,
      deadMix: state.deadMix,
    });

    // The head rides the exact spine tip so turns stay aligned with the grid.
    head.position.x = spine[0].x;
    head.position.z = spine[0].z;
    state.yaw = poseHead(head, tongueRef.current, state.yaw, {
      cell,
      sink,
      yawTarget: DIRECTION_YAW[direction],
      delta,
      clock: state.clock,
      deadMix: state.deadMix,
      dead: isDead,
    });
  });

  return (
    <group>
      <mesh ref={bodyRef} geometry={geometry} castShadow receiveShadow frustumCulled={false}>
        <meshPhysicalMaterial
          map={skin.map}
          normalMap={skin.normalMap}
          normalScale={[0.7, 0.7]}
          vertexColors
          roughness={0.45}
          metalness={0.05}
          clearcoat={0.45}
          clearcoatRoughness={0.35}
        />
      </mesh>

      <group ref={headRef}>
        <SnakeHeadParts
          cell={cell}
          skinMap={skin.map}
          skinNormalMap={skin.normalMap}
          dead={isDead}
          tongueRef={tongueRef}
        />
      </group>
    </group>
  );
}
