'use client';

import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Group } from 'three';
import { Vector3 } from 'three';
import type { BoardLayout } from '../../engine/board-layout';
import type { LudoPieceState } from '../../types/ludo.types';
import { ludoColorTheme } from '../../utils/ludo-colors';
import {
  baseSlotPosition,
  piecePosition,
  positionForSteps,
  stackOffset,
  stackScale,
} from './board-geometry';
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
 * Walks a piece square by square along its own track path without teleporting.
 * Also smoothly animates captured pieces back to their yard after a slight delay
 * so the attacking piece lands before the victim retreats.
 */
function usePieceAnimation(
  layout: BoardLayout,
  piece: LudoPieceState,
  groupRef: RefObject<Group | null>,
) {
  const walkRef = useRef<Vector3[]>([]);
  const legFromRef = useRef(new Vector3());
  const legStartRef = useRef(0);
  const prevStepsRef = useRef(piece.steps);
  const prevLocationRef = useRef(piece.location);
  const captureAnimRef = useRef<{
    fromPos: Vector3;
    toPos: Vector3;
    startTime: number;
    delayMs: number;
  } | null>(null);

  // Initialize group position on mount
  useEffect(() => {
    const group = groupRef.current;
    if (group) {
      const [initX, initZ] = piecePosition(layout, piece);
      group.position.set(initX, REST_Y, initZ);
      legFromRef.current.set(initX, REST_Y, initZ);
    }
  }, []);

  useEffect(() => {
    const previousSteps = prevStepsRef.current;
    const previousLocation = prevLocationRef.current;
    prevStepsRef.current = piece.steps;
    prevLocationRef.current = piece.location;

    const group = groupRef.current;
    if (!group) return;

    // Case 1: Piece moved forward
    if (piece.steps > previousSteps) {
      captureAnimRef.current = null;
      const [startX, startZ] =
        previousSteps === 0
          ? baseSlotPosition(layout, piece.color, piece.pieceIndex)
          : positionForSteps(layout, piece.color, piece.pieceIndex, previousSteps);

      // Lock current visual position to previous step to prevent any flash/teleportation
      group.position.set(startX, REST_Y, startZ);
      legFromRef.current.set(startX, REST_Y, startZ);

      const legs: Vector3[] = [];
      for (let step = previousSteps + 1; step <= piece.steps; step += 1) {
        const [x, z] = positionForSteps(layout, piece.color, piece.pieceIndex, step);
        legs.push(new Vector3(x, REST_Y, z));
      }
      walkRef.current = legs;
      legStartRef.current = performance.now();
      return;
    }

    // Case 2: Piece was captured (moved from track to base with steps = 0)
    if (piece.location === 'base' && (previousLocation === 'track' || previousSteps > 0)) {
      walkRef.current = [];
      const [fromX, fromZ] = positionForSteps(layout, piece.color, piece.pieceIndex, previousSteps);
      const [toX, toZ] = baseSlotPosition(layout, piece.color, piece.pieceIndex);

      group.position.set(fromX, REST_Y, fromZ);
      captureAnimRef.current = {
        fromPos: new Vector3(fromX, REST_Y, fromZ),
        toPos: new Vector3(toX, REST_Y, toZ),
        startTime: performance.now(),
        delayMs: 380, // Wait for attacking piece to land before flying back to base
      };
      return;
    }

    // Reset or other: clear queue
    walkRef.current = [];
    captureAnimRef.current = null;
  }, [piece.steps, piece.location, piece.color, piece.pieceIndex, layout, groupRef]);

  return useCallback((group: Group) => {
    const now = performance.now();

    // Check if capture retreat animation is active
    if (captureAnimRef.current) {
      const { fromPos, toPos, startTime, delayMs } = captureAnimRef.current;
      const elapsed = now - startTime;
      if (elapsed < delayMs) {
        group.position.copy(fromPos);
        return true;
      }
      const animT = Math.min(1, (elapsed - delayMs) / 320);
      group.position.lerpVectors(fromPos, toPos, animT);
      group.position.y = REST_Y + Math.sin(animT * Math.PI) * 0.35; // high arc retreat
      if (animT >= 1) {
        captureAnimRef.current = null;
      }
      return true;
    }

    // Check if step-by-step walk is active
    const walk = walkRef.current;
    if (walk.length === 0) return false;

    const to = walk[0];
    const t = Math.min(1, (now - legStartRef.current) / HOP_MS);

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
  const advanceAnimation = usePieceAnimation(layout, piece, groupRef);

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
    if (advanceAnimation(group)) return;

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
