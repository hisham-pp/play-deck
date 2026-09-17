'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Group, MeshStandardMaterial, Vector3 } from 'three';
import type { ChessPiece } from '../../types/chess.types';
import { PIECE_BASE_Y, pieceFacing, squareToWorld } from './board-metrics';
import { ChessPieceMesh } from './ChessPieceMesh';

const WHITE_COLOR = '#f2e9d8';
const BLACK_COLOR = '#242a38';
const SELECTED_EMISSIVE = '#f59e0b';
const CHECK_EMISSIVE = '#ef4444';

/** How quickly a piece slides to a new square, as a share of the gap per frame. */
const GLIDE_RATE = 12;
/** A moving piece lifts off the board so it reads as travelling over it. */
const LIFT_HEIGHT = 0.35;
const ARRIVAL_DISTANCE = 0.02;

export interface ChessPiece3DProps {
  piece: ChessPiece;
  square: number;
  isSelected: boolean;
  /** The king of the side that is currently in check. */
  isChecked: boolean;
  onSelect: (square: number) => void;
}

function usePieceMaterial(piece: ChessPiece, isSelected: boolean, isChecked: boolean) {
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: piece.color === 'w' ? WHITE_COLOR : BLACK_COLOR,
        roughness: piece.color === 'w' ? 0.42 : 0.36,
        metalness: piece.color === 'w' ? 0.08 : 0.32,
      }),
    [piece.color],
  );

  useEffect(() => {
    if (isChecked) {
      material.emissive.set(CHECK_EMISSIVE);
      material.emissiveIntensity = 0.55;
    } else if (isSelected) {
      material.emissive.set(SELECTED_EMISSIVE);
      material.emissiveIntensity = 0.45;
    } else {
      material.emissiveIntensity = 0;
    }
  }, [material, isSelected, isChecked]);

  useEffect(() => () => material.dispose(), [material]);

  return material;
}

/**
 * One piece on the board.
 *
 * The piece animates towards whatever square the engine says it occupies
 * rather than being told to play an animation, so a move, an undo and a
 * position loaded from a FEN all settle the same way.
 */
export function ChessPiece3D({
  piece,
  square,
  isSelected,
  isChecked,
  onSelect,
}: ChessPiece3DProps) {
  const groupRef = useRef<Group>(null);
  const material = usePieceMaterial(piece, isSelected, isChecked);

  const [targetX, targetZ] = squareToWorld(square);
  const target = useMemo(() => new Vector3(targetX, PIECE_BASE_Y, targetZ), [targetX, targetZ]);

  // Start on the right square instead of gliding in from the origin.
  useEffect(() => {
    const group = groupRef.current;
    if (group && group.position.lengthSq() === 0) group.position.copy(target);
  }, [target]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const distance = group.position.distanceTo(target);
    if (distance < ARRIVAL_DISTANCE) {
      group.position.copy(target);
      return;
    }

    group.position.lerp(target, Math.min(1, delta * GLIDE_RATE));
    // Arc the piece over anything standing between the two squares.
    group.position.y = PIECE_BASE_Y + Math.min(distance, 1) * LIFT_HEIGHT;
  });

  return (
    <group
      ref={groupRef}
      rotation={[0, pieceFacing(piece.color), 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(square);
      }}
    >
      <ChessPieceMesh type={piece.type} material={material} />
    </group>
  );
}
