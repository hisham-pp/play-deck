'use client';

import { useMemo } from 'react';
import type { BoardLayout } from '../../engine/board-layout';
import { isSafeCell } from '../../engine/board-layout';
import { ludoColorTheme } from '../../utils/ludo-colors';
import {
  BASE_RADIUS,
  BOARD_SIZE,
  baseSlotPosition,
  homeCenterPosition,
  homeStretchPosition,
  trackCellPosition,
} from './board-geometry';

const CELL_SIZE = 0.42;
const SAFE_COLOR = '#f59e0b';
const NEUTRAL_CELL_COLOR = '#232f45';

interface LudoBoard3DProps {
  layout: BoardLayout;
}

export function LudoBoard3D({ layout }: LudoBoard3DProps) {
  const trackCells = useMemo(
    () =>
      Array.from({ length: layout.trackLength }, (_, i) => ({
        index: i,
        position: trackCellPosition(layout, i),
        safe: isSafeCell(layout, i),
      })),
    [layout],
  );

  const homeStretches = useMemo(
    () =>
      layout.colors.flatMap((color) =>
        Array.from({ length: layout.homeStretchLength }, (_, i) => ({
          color,
          position: homeStretchPosition(layout, color, i + 1),
        })),
      ),
    [layout],
  );

  return (
    <group>
      {/* Board base surface */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE * 2 + 1.2, 0.1, BOARD_SIZE * 2 + 1.2]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Shared track cells */}
      {trackCells.map((cell) => (
        <mesh
          key={cell.index}
          position={[cell.position[0], 0.02, cell.position[1]]}
          receiveShadow
        >
          <boxGeometry args={[CELL_SIZE, 0.06, CELL_SIZE]} />
          <meshStandardMaterial color={cell.safe ? SAFE_COLOR : NEUTRAL_CELL_COLOR} roughness={0.6} />
        </mesh>
      ))}

      {/* Home stretches, colored per player */}
      {homeStretches.map((cell, i) => {
        const theme = ludoColorTheme(cell.color);
        return (
          <mesh key={`${cell.color}-stretch-${i}`} position={[cell.position[0], 0.02, cell.position[1]]}>
            <boxGeometry args={[CELL_SIZE * 0.85, 0.06, CELL_SIZE * 0.85]} />
            <meshStandardMaterial color={theme.hex} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Home hub markers */}
      {layout.colors.map((color) => {
        const [x, z] = homeCenterPosition(color, layout);
        const theme = ludoColorTheme(color);
        return (
          <mesh key={`home-${color}`} position={[x, 0.03, z]}>
            <cylinderGeometry args={[0.32, 0.32, 0.08, 24]} />
            <meshStandardMaterial color={theme.hex} emissive={theme.hex} emissiveIntensity={0.15} />
          </mesh>
        );
      })}

      {/* Base yards */}
      {layout.colors.map((color) => {
        const theme = ludoColorTheme(color);
        const angle = (layout.colors.indexOf(color) / layout.colors.length) * Math.PI * 2 + Math.PI / layout.colors.length;
        const cx = Math.cos(angle) * BASE_RADIUS;
        const cz = Math.sin(angle) * BASE_RADIUS;
        return (
          <group key={`base-${color}`}>
            <mesh position={[cx, -0.02, cz]} receiveShadow>
              <boxGeometry args={[1.4, 0.06, 1.4]} />
              <meshStandardMaterial color={theme.hex} opacity={0.25} transparent roughness={0.8} />
            </mesh>
            {[0, 1, 2, 3].map((pieceIndex) => {
              const [sx, sz] = baseSlotPosition(layout, color, pieceIndex);
              return (
                <mesh key={pieceIndex} position={[sx, 0.02, sz]}>
                  <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
                  <meshStandardMaterial color={theme.hex} opacity={0.5} transparent />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
