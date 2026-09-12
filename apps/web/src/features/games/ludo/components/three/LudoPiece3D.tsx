'use client';

import { useRef, useState } from 'react';
import type { Group } from 'three';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import type { BoardLayout } from '../../engine/board-layout';
import type { LudoPieceState } from '../../types/ludo.types';
import { ludoColorTheme } from '../../utils/ludo-colors';
import { piecePosition } from './board-geometry';

interface LudoPiece3DProps {
  layout: BoardLayout;
  piece: LudoPieceState;
  isLegalMove: boolean;
  onSelectPiece?: (pieceId: string) => void;
}

export function LudoPiece3D({
  layout,
  piece,
  isLegalMove,
  onSelectPiece,
}: LudoPiece3DProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const targetPos = piecePosition(layout, piece);
  const targetY = isLegalMove ? 0.22 : 0.12;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const current = groupRef.current.position;
    const target = new Vector3(targetPos[0], targetY, targetPos[1]);

    // Smooth lerp position towards target cell
    current.lerp(target, Math.min(1, delta * 14));

    if (isLegalMove) {
      // Floating animation for selectable pieces
      groupRef.current.position.y = targetY + Math.sin(Date.now() * 0.007) * 0.05;
    }
  });

  const theme = ludoColorTheme(piece.color);
  const scale = hovered && isLegalMove ? 1.2 : 1.0;

  return (
    <group
      ref={groupRef}
      position={[targetPos[0], targetY, targetPos[1]]}
      scale={[scale, scale, scale]}
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
      {/* Pawn Base Ring */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.21, 0.08, 20]} />
        <meshStandardMaterial
          color={theme.hex}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Pawn Tapered Body */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.16, 0.28, 20]} />
        <meshStandardMaterial
          color={theme.hex}
          roughness={0.2}
          metalness={0.25}
        />
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
            <meshBasicMaterial color="#f59e0b" side={2} transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
}
