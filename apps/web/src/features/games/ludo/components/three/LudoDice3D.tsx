'use client';

import { useFrame } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useCallback, useEffect, useRef } from 'react';
import { Euler, Quaternion, Vector3, type Mesh } from 'three';

interface LudoDice3DProps {
  rolling: boolean;
  targetValue: number | null;
  onRollComplete?: () => void;
  onRollDice?: () => void;
}

const DIE_SIZE = 0.55;
const MAX_ROLL_MS = 2600;
const ALIGN_MS = 340;
const QUIET_FRAMES = 10;
const UP = new Vector3(0, 1, 0);
const ZERO = { x: 0, y: 0, z: 0 };
const PIP_RADIUS = 0.05;
const FACE_OFFSET = DIE_SIZE / 2;
const PIP_SPREAD = 0.12;

const S = PIP_SPREAD;
const PIP_GRID: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [
    [-S, -S],
    [S, S],
  ],
  3: [
    [-S, -S],
    [0, 0],
    [S, S],
  ],
  4: [
    [-S, -S],
    [-S, S],
    [S, -S],
    [S, S],
  ],
  5: [
    [-S, -S],
    [-S, S],
    [0, 0],
    [S, -S],
    [S, S],
  ],
  6: [
    [-S, -S],
    [-S, 0],
    [-S, S],
    [S, -S],
    [S, 0],
    [S, S],
  ],
};

// Opposite faces sum to seven, as on a real die.
const FACES: { axis: 'x' | 'y' | 'z'; dir: 1 | -1; value: number }[] = [
  { axis: 'y', dir: 1, value: 1 },
  { axis: 'y', dir: -1, value: 6 },
  { axis: 'x', dir: 1, value: 2 },
  { axis: 'x', dir: -1, value: 5 },
  { axis: 'z', dir: 1, value: 3 },
  { axis: 'z', dir: -1, value: 4 },
];

/**
 * Euler rotation that brings the face carrying `value` to point up (+Y),
 * so the settled die reads the same number the engine rolled.
 */
const FACE_UP_ROTATION: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  6: [Math.PI, 0, 0],
  2: [0, 0, Math.PI / 2],
  5: [0, 0, -Math.PI / 2],
  3: [-Math.PI / 2, 0, 0],
  4: [Math.PI / 2, 0, 0],
};

function pipPosition(
  axis: 'x' | 'y' | 'z',
  dir: 1 | -1,
  u: number,
  v: number,
): [number, number, number] {
  const d = FACE_OFFSET * dir;
  if (axis === 'x') return [d, u, v];
  if (axis === 'y') return [u, d, v];
  return [u, v, d];
}

function DiePips() {
  return (
    <>
      {FACES.map(({ axis, dir, value }) =>
        PIP_GRID[value].map(([u, v], i) => (
          <mesh key={`${axis}${dir}-${i}`} position={pipPosition(axis, dir, u, v)}>
            <sphereGeometry args={[PIP_RADIUS, 12, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
        )),
      )}
    </>
  );
}

function throwDie(body: RapierRigidBody) {
  body.wakeUp();
  body.setTranslation({ x: 0, y: 2.2, z: 0 }, true);
  body.setLinvel(
    { x: (Math.random() - 0.5) * 3, y: 4 + Math.random() * 2, z: (Math.random() - 0.5) * 3 },
    true,
  );
  body.setAngvel(
    {
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 30,
    },
    true,
  );
}

/**
 * Orientation that shows `value` face-up, keeping the yaw the die already has so
 * only its tilt changes and the correction reads as the die settling over.
 */
function restingRotation(from: Quaternion, value: number | null): Quaternion {
  const [rx, ry, rz] = FACE_UP_ROTATION[value ?? 1] ?? FACE_UP_ROTATION[1];
  const face = new Quaternion().setFromEuler(new Euler(rx, ry, rz));
  const yaw = new Euler().setFromQuaternion(from, 'YXZ').y;
  return new Quaternion().setFromAxisAngle(UP, yaw).multiply(face);
}

function isAtRest(body: RapierRigidBody): boolean {
  const linvel = body.linvel();
  const angvel = body.angvel();
  return (
    Math.hypot(linvel.x, linvel.y, linvel.z) < 0.1 && Math.hypot(angvel.x, angvel.y, angvel.z) < 0.2
  );
}

/** Advances the settle rotation one frame; returns true once it has finished. */
function stepAlign(
  body: RapierRigidBody,
  align: { from: Quaternion; to: Quaternion; start: number },
): boolean {
  const t = Math.min(1, (performance.now() - align.start) / ALIGN_MS);
  const eased = 1 - Math.pow(1 - t, 3);

  body.setLinvel(ZERO, true);
  body.setAngvel(ZERO, true);
  body.setRotation(new Quaternion().slerpQuaternions(align.from, align.to, eased), true);

  return t >= 1;
}

export function LudoDice3D({ rolling, targetValue, onRollComplete, onRollDice }: LudoDice3DProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const isRollingRef = useRef(false);
  const quietFramesRef = useRef(0);
  const alignRef = useRef<{ from: Quaternion; to: Quaternion; start: number } | null>(null);

  // Physics decides where the die lands, never which number it shows.
  const beginAlign = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    quietFramesRef.current = 0;

    const r = body.rotation();
    const from = new Quaternion(r.x, r.y, r.z, r.w);
    alignRef.current = { from, to: restingRotation(from, targetValue), start: performance.now() };
  }, [targetValue]);

  useEffect(() => {
    if (!rolling || !targetValue || isRollingRef.current || !bodyRef.current) return;

    isRollingRef.current = true;
    quietFramesRef.current = 0;
    alignRef.current = null;
    throwDie(bodyRef.current);

    // A die wedged against a wall can stay jittery forever; the turn must not
    // stay blocked waiting on physics that never goes quiet.
    const bailout = setTimeout(() => {
      if (isRollingRef.current && !alignRef.current) beginAlign();
    }, MAX_ROLL_MS);
    return () => clearTimeout(bailout);
  }, [rolling, targetValue, beginAlign]);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    const align = alignRef.current;
    if (align) {
      if (stepAlign(body, align)) {
        alignRef.current = null;
        isRollingRef.current = false;
        onRollComplete?.();
      }
      return;
    }

    if (!isRollingRef.current) return;

    if (isAtRest(body)) {
      quietFramesRef.current += 1;
      if (quietFramesRef.current >= QUIET_FRAMES) beginAlign();
    } else {
      quietFramesRef.current = 0;
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      restitution={0.45}
      friction={0.7}
      position={[0, 0.8, 0]}
    >
      <CuboidCollider args={[DIE_SIZE / 2, DIE_SIZE / 2, DIE_SIZE / 2]} />
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
        <boxGeometry args={[DIE_SIZE, DIE_SIZE, DIE_SIZE]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.18}
          roughness={0.3}
          metalness={0.25}
        />
        <DiePips />
      </mesh>
    </RigidBody>
  );
}
