'use client';

import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Group } from 'three';
import { Vector3 } from 'three';
import type { BoardLayout } from '../../engine/board-layout';
import type { LudoPieceState } from '../../types/ludo.types';
import { ludoColorTheme } from '../../utils/ludo-colors';
import { piecePosition, positionForSteps, stackOffset, stackScale } from './board-geometry';
import { numberBadgeTexture } from './piece-number-texture';

interface LudoPiece3DProps {
  layout: BoardLayout;
  piece: LudoPieceState;
  isLegalMove: boolean;
  /** 1-based hotkey for this piece this turn, or null when it cannot move. */
  moveNumber?: number | null;
  /** Position of this piece within the pieces sharing its square. */
  stackIndex?: number;
  /** How many pieces share this piece's square. */
  stackCount?: number;
  onSelectPiece?: (pieceId: string) => void;
}

const REST_Y = 0.12;
const HOP_MS = 140;
const HOP_HEIGHT = 0.16;
const BADGE_ACCENT = '#fbbf24';
const BADGE_SIZE = 0.42;

/**
 * Walks a piece square by square along its own track path. A move of N advances
 * through N squares, and the squares in between never appear in piece state, so
 * they are queued here — otherwise the piece slides diagonally across the board.
 */
function usePieceWalk(
  layout: BoardLayout,
  piece: LudoPieceState,
  groupRef: RefObject<Group | null>,
) {
  const walkRef = useRef<Vector3[]>([]);
  const legFromRef = useRef(new Vector3());
  const legStartRef = useRef(0);
  const prevStepsRef = useRef(piece.steps);

  useEffect(() => {
    const previous = prevStepsRef.current;
    prevStepsRef.current = piece.steps;

    const group = groupRef.current;
    if (!group || piece.steps <= previous) {
      // Captured or reset: let the idle lerp carry it straight back to base.
      walkRef.current = [];
      return;
    }

    const legs: Vector3[] = [];
    for (let step = previous + 1; step <= piece.steps; step += 1) {
      const [x, z] = positionForSteps(layout, piece.color, piece.pieceIndex, step);
      legs.push(new Vector3(x, REST_Y, z));
    }
    walkRef.current = legs;
    legFromRef.current.copy(group.position);
    legStartRef.current = performance.now();
  }, [piece.steps, piece.color, piece.pieceIndex, layout, groupRef]);

  return useCallback((group: Group) => {
    const walk = walkRef.current;
    if (walk.length === 0) return false;

    const to = walk[0];
    const t = Math.min(1, (performance.now() - legStartRef.current) / HOP_MS);

    group.position.lerpVectors(legFromRef.current, to, t);
    group.position.y = REST_Y + Math.sin(t * Math.PI) * HOP_HEIGHT;

    if (t >= 1) {
      legFromRef.current.copy(to);
      walk.shift();
      legStartRef.current = performance.now();
    }
    return true;
  }, []);
}

export function LudoPiece3D({
  layout,
  piece,
  isLegalMove,
  moveNumber = null,
  stackIndex = 0,
  stackCount = 1,
  onSelectPiece,
}: LudoPiece3DProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const targetPos = piecePosition(layout, piece);
  const targetY = isLegalMove ? 0.22 : REST_Y;
  const advanceWalk = usePieceWalk(layout, piece, groupRef);

  // Pieces sharing a square shrink and spread so the stack stays inside the cell.
  const shrink = stackScale(stackCount);
  const [offsetX, offsetZ] = stackOffset(stackIndex, stackCount);

  const badgeTexture = useMemo(
    () => (moveNumber === null ? null : numberBadgeTexture(moveNumber, BADGE_ACCENT)),
    [moveNumber],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (advanceWalk(group)) return;

    const target = new Vector3(targetPos[0], targetY, targetPos[1]);
    group.position.lerp(target, Math.min(1, delta * 14));

    if (isLegalMove) {
      // Floating animation for selectable pieces
      group.position.y = targetY + Math.sin(Date.now() * 0.007) * 0.05;
    }
  });

  const theme = ludoColorTheme(piece.color);
  const scale = shrink * (hovered && isLegalMove ? 1.2 : 1.0);

  return (
    <group
      ref={groupRef}
      position={[targetPos[0], targetY, targetPos[1]]}
      onClick={(e) => {
        if (isLegalMove && onSelectPiece) {
          e.stopPropagation();
          onSelectPiece(piece.id);
        }
      }}
      onPointerOver={(e) => {
        if (isLegalMove) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <group position={[offsetX, 0, offsetZ]} scale={[scale, scale, scale]}>
        {/* Pawn Base Ring */}
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.21, 0.08, 20]} />
          <meshStandardMaterial color={theme.hex} roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Pawn Tapered Body */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.16, 0.28, 20]} />
          <meshStandardMaterial color={theme.hex} roughness={0.2} metalness={0.25} />
        </mesh>

        {/* Pawn Neck Ring */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.5} />
        </mesh>

        {/* Pawn Head Sphere */}
        <mesh position={[0, 0.48, 0]} castShadow>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial
            color={theme.hex}
            roughness={0.15}
            metalness={0.3}
            emissive={isLegalMove ? theme.hex : '#000000'}
            emissiveIntensity={isLegalMove ? 0.35 : 0}
          />
        </mesh>

        {/* Top Knob */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.4} />
        </mesh>

        {/* Legal Move Glowing Selection Ring */}
        {isLegalMove && (
          <group position={[0, -0.06, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.24, 0.34, 32]} />
              <meshBasicMaterial color={BADGE_ACCENT} side={2} transparent opacity={0.85} />
            </mesh>
          </group>
        )}
      </group>

      {/* Move number: the piece says which key moves it, so no separate list of
          buttons is needed to tell the pieces apart. */}
      {badgeTexture && (
        <Billboard position={[offsetX, 0.68 * shrink + 0.34, offsetZ]}>
          <mesh renderOrder={10}>
            <planeGeometry args={[BADGE_SIZE, BADGE_SIZE]} />
            <meshBasicMaterial
              map={badgeTexture}
              transparent
              toneMapped={false}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  );
}
