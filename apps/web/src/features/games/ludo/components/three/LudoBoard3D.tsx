'use client';

import { useMemo } from 'react';
import { isSafeCell, type BoardLayout } from '../../engine/board-layout';
import type { LudoColor } from '../../types/ludo.types';
import { ludoColorTheme } from '../../utils/ludo-colors';
import {
  BASE_YARD_SIZE,
  BOARD_PHYSICAL_SIZE,
  CELL_SIZE,
  CENTER_SIZE,
  HEX_BOARD_RADIUS,
  HEX_CENTER_RADIUS,
  HEX_YARD_SIZE,
  baseSlotPosition,
  baseYardCenter,
  baseYardRotation,
  hexCorridorRotation,
  homeCenterPosition,
  homeStretchPosition,
  trackCellPosition,
  trackCellRotation,
} from './board-geometry';

const COLOR_WHITE = '#ffffff';
const COLOR_SLAB = '#0b0f19';
const COLOR_FRAME = '#1e293b';
/** Deliberately darker than the white cells so every cell edge reads as a
 *  gridline instead of blending into the plate. */
const COLOR_SURFACE = '#8f9bb0';
const LAYOUT_CLASSIC4 = 'classic4';

/** Hexagon vertices point at the base yards, giving each yard the most room. */
const HEX_SLAB_THETA = Math.PI / 6;

interface LudoBoard3DProps {
  layout: BoardLayout;
}

function ClassicSlab() {
  return (
    <group>
      <mesh position={[0, -0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[BOARD_PHYSICAL_SIZE + 0.6, 0.24, BOARD_PHYSICAL_SIZE + 0.6]} />
        <meshStandardMaterial color={COLOR_SLAB} roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[BOARD_PHYSICAL_SIZE + 0.3, 0.04, BOARD_PHYSICAL_SIZE + 0.3]} />
        <meshStandardMaterial color={COLOR_FRAME} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <boxGeometry args={[BOARD_PHYSICAL_SIZE, 0.02, BOARD_PHYSICAL_SIZE]} />
        <meshStandardMaterial color={COLOR_SURFACE} roughness={0.55} />
      </mesh>
    </group>
  );
}

function HexSlab() {
  return (
    <group>
      <mesh position={[0, -0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry
          args={[HEX_BOARD_RADIUS + 0.3, HEX_BOARD_RADIUS + 0.3, 0.24, 6, 1, false, HEX_SLAB_THETA]}
        />
        <meshStandardMaterial color={COLOR_SLAB} roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <cylinderGeometry
          args={[
            HEX_BOARD_RADIUS + 0.15,
            HEX_BOARD_RADIUS + 0.15,
            0.04,
            6,
            1,
            false,
            HEX_SLAB_THETA,
          ]}
        />
        <meshStandardMaterial color={COLOR_FRAME} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <cylinderGeometry
          args={[HEX_BOARD_RADIUS, HEX_BOARD_RADIUS, 0.02, 6, 1, false, HEX_SLAB_THETA]}
        />
        <meshStandardMaterial color={COLOR_SURFACE} roughness={0.55} />
      </mesh>
    </group>
  );
}

interface BaseYardProps {
  layout: BoardLayout;
  color: LudoColor;
  yardSize: number;
  innerSize: number;
}

function BaseYard({ layout, color, yardSize, innerSize }: BaseYardProps) {
  const theme = ludoColorTheme(color);
  const [bx, bz] = baseYardCenter(layout, color);
  const rotation = baseYardRotation(layout, color);

  return (
    <group>
      <group position={[bx, 0, bz]} rotation={[0, rotation, 0]}>
        {/* Outer colour block */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[yardSize, 0.03, yardSize]} />
          <meshStandardMaterial color={theme.hex} roughness={0.4} />
        </mesh>
        {/* Inner recessed area */}
        <mesh position={[0, 0.036, 0]} receiveShadow>
          <boxGeometry args={[innerSize, 0.01, innerSize]} />
          <meshStandardMaterial color={COLOR_WHITE} roughness={0.2} />
        </mesh>
      </group>

      {/* Slots are placed in world space so they always match where pieces park. */}
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
              <meshStandardMaterial color={COLOR_WHITE} roughness={0.1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function LudoBoard3D({ layout }: LudoBoard3DProps) {
  const isClassic = layout.id === LAYOUT_CLASSIC4;

  const trackCells = useMemo(() => {
    return Array.from({ length: layout.trackLength }, (_, i) => {
      const entryColorIndex = layout.entryOffsets.indexOf(i);
      const entryColor = entryColorIndex === -1 ? null : layout.colors[entryColorIndex];

      return {
        index: i,
        position: trackCellPosition(layout, i),
        rotation: trackCellRotation(layout, i),
        isSafe: isSafeCell(layout, i),
        isEntry: entryColor !== null,
        cellColor: entryColor ? ludoColorTheme(entryColor).hex : COLOR_WHITE,
      };
    });
  }, [layout]);

  const homeStretches = useMemo(() => {
    return layout.colors.flatMap((color, colorIdx) =>
      Array.from({ length: layout.homeStretchLength }, (_, i) => ({
        color,
        colorIdx,
        position: homeStretchPosition(layout, color, i + 1),
        // Corridors run inward along the vertex their colour's side starts at.
        rotation: isClassic ? 0 : hexCorridorRotation(colorIdx),
      })),
    );
  }, [layout, isClassic]);

  return (
    <group>
      {isClassic ? <ClassicSlab /> : <HexSlab />}

      {layout.colors.map((color) => (
        <BaseYard
          key={`base-yard-${color}`}
          layout={layout}
          color={color}
          yardSize={isClassic ? BASE_YARD_SIZE : HEX_YARD_SIZE}
          innerSize={isClassic ? 4 * CELL_SIZE : 2.7 * CELL_SIZE}
        />
      ))}

      {trackCells.map((cell) => (
        <group
          key={`track-${cell.index}`}
          position={[cell.position[0], 0, cell.position[1]]}
          rotation={[0, cell.rotation, 0]}
        >
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[CELL_SIZE * 0.94, 0.025, CELL_SIZE * 0.94]} />
            <meshStandardMaterial
              color={cell.isEntry ? cell.cellColor : COLOR_WHITE}
              roughness={0.3}
              metalness={cell.isEntry ? 0.2 : 0}
            />
          </mesh>

          {/* Safe cell golden star marker */}
          {cell.isSafe && !cell.isEntry && (
            <mesh position={[0, 0.035, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.01, 5]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.6} />
            </mesh>
          )}
        </group>
      ))}

      {homeStretches.map((cell, i) => {
        const theme = ludoColorTheme(cell.color);
        return (
          <mesh
            key={`stretch-${cell.color}-${i}`}
            position={[cell.position[0], 0.025, cell.position[1]]}
            rotation={[0, cell.rotation, 0]}
            receiveShadow
          >
            <boxGeometry args={[CELL_SIZE * 0.94, 0.025, CELL_SIZE * 0.94]} />
            <meshStandardMaterial color={theme.hex} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Victory hub */}
      {isClassic ? (
        <mesh position={[0, 0.028, 0]} receiveShadow>
          <boxGeometry args={[CENTER_SIZE, 0.03, CENTER_SIZE]} />
          <meshStandardMaterial color={COLOR_WHITE} roughness={0.2} />
        </mesh>
      ) : (
        <mesh position={[0, 0.028, 0]} receiveShadow>
          <cylinderGeometry args={[HEX_CENTER_RADIUS, HEX_CENTER_RADIUS, 0.03, 6]} />
          <meshStandardMaterial color={COLOR_WHITE} roughness={0.2} />
        </mesh>
      )}

      {layout.colors.map((color) => {
        const [cx, cz] = homeCenterPosition(color, layout);
        const theme = ludoColorTheme(color);
        return (
          <mesh key={`center-tri-${color}`} position={[cx, 0.045, cz]}>
            <cylinderGeometry args={[isClassic ? 0.2 : 0.13, isClassic ? 0.2 : 0.13, 0.01, 24]} />
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
