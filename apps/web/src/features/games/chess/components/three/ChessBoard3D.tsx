'use client';

import { useMemo } from 'react';
import { squareShade } from '../../engine/chess-board';
import { BOARD_SIZE, FILES, TOTAL_SQUARES } from '../../engine/chess-constants';
import {
  BOARD_HALF,
  BOARD_SPAN,
  FRAME_WIDTH,
  SQUARE_HEIGHT,
  SLAB_HEIGHT,
  SQUARE_SIZE,
  squareToWorld,
} from './board-metrics';
import { labelTexture } from './board-textures';

const LIGHT_SQUARE = '#d7c3a1';
const DARK_SQUARE = '#3d4c6b';
const FRAME_COLOR = '#1b2334';
const SLAB_COLOR = '#0b0f19';

const SELECTED_COLOR = '#f59e0b';
const TARGET_COLOR = '#22d3ee';
const LAST_MOVE_COLOR = '#f59e0b';
const CHECK_COLOR = '#ef4444';
const CURSOR_COLOR = '#ffffff';
const FRAME_SINK = -0.015;

/** Height the markers float at, just clear of the square face. */
const MARKER_Y = SQUARE_HEIGHT / 2 + 0.012;

export interface BoardHighlights {
  selected: number | null;
  /** Squares the selected piece may move to. */
  targets: number[];
  /** Targets that would capture, drawn as a ring rather than a dot. */
  captures: number[];
  lastMove: { from: number; to: number } | null;
  /** The square of a king in check. */
  check: number | null;
  /** Where keyboard focus sits, drawn as an outline. */
  cursor: number | null;
}

function Frame() {
  const outer = BOARD_SPAN + FRAME_WIDTH * 2;

  return (
    <group>
      <mesh position={[0, -SLAB_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[outer + 0.3, SLAB_HEIGHT, outer + 0.3]} />
        <meshStandardMaterial color={SLAB_COLOR} roughness={0.72} metalness={0.28} />
      </mesh>
      {/* Sunk slightly so its top never shares a plane with the squares. */}
      <mesh position={[0, FRAME_SINK, 0]} receiveShadow>
        <boxGeometry args={[outer, SQUARE_HEIGHT, outer]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.5} metalness={0.36} />
      </mesh>
    </group>
  );
}

/** File letters and rank numbers painted around the frame. */
function Coordinates() {
  const labels = useMemo(() => {
    const offset = BOARD_HALF + FRAME_WIDTH / 2;
    const placed: { key: string; character: string; position: [number, number, number] }[] = [];

    for (let index = 0; index < BOARD_SIZE; index += 1) {
      const along = (index - (BOARD_SIZE - 1) / 2) * SQUARE_SIZE;
      const file = FILES[index];
      const rank = String(BOARD_SIZE - index);

      placed.push({ key: `file-near-${file}`, character: file, position: [along, 0.07, offset] });
      placed.push({ key: `file-far-${file}`, character: file, position: [along, 0.07, -offset] });
      placed.push({ key: `rank-left-${rank}`, character: rank, position: [-offset, 0.07, along] });
      placed.push({ key: `rank-right-${rank}`, character: rank, position: [offset, 0.07, along] });
    }

    return placed;
  }, []);

  return (
    <group>
      {labels.map(({ key, character, position }) => {
        const texture = labelTexture(character);
        if (!texture) return null;

        return (
          <mesh key={key} position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.4, 0.4]} />
            <meshBasicMaterial map={texture} transparent depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

interface SquaresProps {
  highlights: BoardHighlights;
  onSelect: (square: number) => void;
}

/** Tints a square when it belongs to the last move or holds a king in check. */
function squareTint(square: number, highlights: BoardHighlights): string | null {
  if (highlights.check === square) return CHECK_COLOR;
  if (highlights.selected === square) return SELECTED_COLOR;
  if (highlights.lastMove?.from === square || highlights.lastMove?.to === square) {
    return LAST_MOVE_COLOR;
  }
  return null;
}

function Squares({ highlights, onSelect }: SquaresProps) {
  return (
    <group>
      {Array.from({ length: TOTAL_SQUARES }, (_, square) => {
        const [x, z] = squareToWorld(square);
        const base = squareShade(square) === 'light' ? LIGHT_SQUARE : DARK_SQUARE;
        const tint = squareTint(square, highlights);

        return (
          <mesh
            key={square}
            position={[x, 0, z]}
            receiveShadow
            onClick={(event) => {
              event.stopPropagation();
              onSelect(square);
            }}
          >
            <boxGeometry args={[SQUARE_SIZE, SQUARE_HEIGHT, SQUARE_SIZE]} />
            <meshStandardMaterial
              color={tint ?? base}
              roughness={0.62}
              metalness={0.1}
              emissive={tint ?? '#000000'}
              emissiveIntensity={tint ? 0.42 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Move hints: a dot on an empty destination, a ring around one holding a piece
 * to be captured. Both are the conventions a chess player already reads.
 */
function MoveMarkers({ highlights }: { highlights: BoardHighlights }) {
  const captures = useMemo(() => new Set(highlights.captures), [highlights.captures]);

  return (
    <group>
      {highlights.targets.map((square) => {
        const [x, z] = squareToWorld(square);
        const isCapture = captures.has(square);

        return (
          <mesh key={square} position={[x, MARKER_Y, z]} rotation={[-Math.PI / 2, 0, 0]}>
            {isCapture ? (
              <ringGeometry args={[0.4, 0.47, 32]} />
            ) : (
              <circleGeometry args={[0.15, 24]} />
            )}
            <meshBasicMaterial color={TARGET_COLOR} transparent opacity={0.85} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

/** An outline showing where keyboard focus is, independent of selection. */
function Cursor({ square }: { square: number | null }) {
  if (square === null) return null;
  const [x, z] = squareToWorld(square);

  return (
    <mesh position={[x, MARKER_Y + 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.46, 0.5, 4, 1, Math.PI / 4]} />
      <meshBasicMaterial color={CURSOR_COLOR} transparent opacity={0.95} depthWrite={false} />
    </mesh>
  );
}

export interface ChessBoard3DProps {
  highlights: BoardHighlights;
  onSelectSquare: (square: number) => void;
}

export function ChessBoard3D({ highlights, onSelectSquare }: ChessBoard3DProps) {
  return (
    <group>
      <Frame />
      <Coordinates />
      <Squares highlights={highlights} onSelect={onSelectSquare} />
      <MoveMarkers highlights={highlights} />
      <Cursor square={highlights.cursor} />
    </group>
  );
}
