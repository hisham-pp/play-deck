'use client';

import { useMemo } from 'react';
import type { BoardLayout } from '../../engine/board-layout';
import { ludoColorTheme } from '../../utils/ludo-colors';
import {
  CELL_SIZE,
  baseSlotPosition,
  gridToWorld,
  homeCenterPosition,
  homeStretchPosition,
  trackCellPosition,
} from './board-geometry';

interface LudoBoard3DProps {
  layout: BoardLayout;
}

export function LudoBoard3D({ layout }: LudoBoard3DProps) {
  // Shared 52 track cell rendering data
  const trackCells = useMemo(() => {
    return Array.from({ length: layout.trackLength }, (_, i) => {
      const isSafe = isSafeCell(layout, i);
      const pos = trackCellPosition(layout, i);
      let cellColor = '#ffffff';

      // Check if entry cell for a color
      const entryColorIndex = layout.entryOffsets.indexOf(i);
      if (entryColorIndex !== -1) {
        const color = layout.colors[entryColorIndex];
        cellColor = ludoColorTheme(color).hex;
      }

      return { index: i, position: pos, isSafe, isEntry: entryColorIndex !== -1, cellColor };
    });
  }, [layout]);

  // Home stretch cells (5 cells per color)
  const homeStretches = useMemo(() => {
    return layout.colors.flatMap((color) =>
      Array.from({ length: layout.homeStretchLength }, (_, i) => ({
        color,
        position: homeStretchPosition(layout, color, i + 1),
      })),
    );
  }, [layout]);

  return (
    <group>
      {/* Main Board Base Slab */}
      <mesh position={[0, -0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[7.6, 0.24, 7.6]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Raised Outer Border Frame */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[7.4, 0.04, 7.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Inner Playing Surface */}
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <boxGeometry args={[7.2, 0.02, 7.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>

      {/* Corner Base Yards (6x6 Grid Areas) */}
      {layout.colors.map((color) => {
        const theme = ludoColorTheme(color);
        let baseCol = 2.5;
        let baseRow = 2.5;

        switch (color) {
          case 'red':
            baseCol = 2.5;
            baseRow = 2.5;
            break;
          case 'green':
            baseCol = 12.5;
            baseRow = 2.5;
            break;
          case 'yellow':
            baseCol = 12.5;
            baseRow = 12.5;
            break;
          case 'blue':
            baseCol = 2.5;
            baseRow = 12.5;
            break;
        }

        const [bx, bz] = gridToWorld(baseCol, baseRow);

        return (
          <group key={`base-yard-${color}`}>
            {/* Outer Base Color Block */}
            <mesh position={[bx, 0.02, bz]} receiveShadow>
              <boxGeometry args={[2.88, 0.03, 2.88]} />
              <meshStandardMaterial color={theme.hex} roughness={0.4} />
            </mesh>

            {/* Inner White Recessed Area */}
            <mesh position={[bx, 0.036, bz]} receiveShadow>
              <boxGeometry args={[2.16, 0.01, 2.16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>

            {/* 4 Circular Piece Slots */}
            {[0, 1, 2, 3].map((slotIdx) => {
              const [sx, sz] = baseSlotPosition(layout, color, slotIdx);
              return (
                <group key={slotIdx}>
                  <mesh position={[sx, 0.042, sz]}>
                    <cylinderGeometry args={[0.22, 0.22, 0.015, 24]} />
                    <meshStandardMaterial color={theme.hex} roughness={0.3} />
                  </mesh>
                  <mesh position={[sx, 0.045, sz]}>
                    <cylinderGeometry args={[0.17, 0.17, 0.012, 24]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.1} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Shared Track Tiles (52 Cells) */}
      {trackCells.map((cell) => (
        <group key={`track-${cell.index}`}>
          <mesh position={[cell.position[0], 0.02, cell.position[1]]} receiveShadow>
            <boxGeometry args={[CELL_SIZE * 0.94, 0.025, CELL_SIZE * 0.94]} />
            <meshStandardMaterial
              color={cell.isEntry ? cell.cellColor : '#ffffff'}
              roughness={0.3}
              metalness={cell.isEntry ? 0.2 : 0}
            />
          </mesh>

          {/* Safe Cell Golden Star Marker */}
          {cell.isSafe && !cell.isEntry && (
            <mesh position={[cell.position[0], 0.035, cell.position[1]]}>
              <cylinderGeometry args={[0.14, 0.14, 0.01, 5]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.6} />
            </mesh>
          )}
        </group>
      ))}

      {/* Home Stretches */}
      {homeStretches.map((cell, i) => {
        const theme = ludoColorTheme(cell.color);
        return (
          <mesh
            key={`stretch-${cell.color}-${i}`}
            position={[cell.position[0], 0.025, cell.position[1]]}
            receiveShadow
          >
            <boxGeometry args={[CELL_SIZE * 0.94, 0.025, CELL_SIZE * 0.94]} />
            <meshStandardMaterial color={theme.hex} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Center Victory Target (3x3 Center Area) */}
      <mesh position={[0, 0.028, 0]} receiveShadow>
        <boxGeometry args={[CELL_SIZE * 2.8, 0.03, CELL_SIZE * 2.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>

      {/* Center 4 Triangles */}
      {layout.colors.map((color) => {
        const [cx, cz] = homeCenterPosition(color, layout);
        const theme = ludoColorTheme(color);
        return (
          <mesh key={`center-tri-${color}`} position={[cx, 0.045, cz]}>
            <cylinderGeometry args={[0.32, 0.32, 0.01, 24]} />
            <meshStandardMaterial
              color={theme.hex}
              emissive={theme.hex}
              emissiveIntensity={0.2}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}
