import type { BoardLayout } from '../../engine/board-layout';
import { globalTrackIndex, homeStretchIndex } from '../../engine/board-layout';
import type { LudoColor, LudoPieceState } from '../../types/ludo.types';

export const BOARD_SIZE = 6; // half-extent of the track loop, in world units
export const BASE_RADIUS = BOARD_SIZE + 1.6;

export type Vec2 = [number, number];

/**
 * Maps t in [0, 1) to a point on a rounded-square perimeter of half-extent
 * `size`, walked clockwise starting at the top-left corner. This gives every
 * board layout (4 arms or 6) a single, generic "loop track" shape instead of
 * hand-placing coordinates per layout.
 */
export function loopPosition(t: number, size: number): Vec2 {
  const perimeter = 8 * size;
  const d = ((t % 1) + 1) % 1 * perimeter;

  if (d < 2 * size) return [-size + d, -size];
  if (d < 4 * size) return [size, -size + (d - 2 * size)];
  if (d < 6 * size) return [size - (d - 4 * size), size];
  return [-size, size - (d - 6 * size)];
}

export function trackCellPosition(layout: BoardLayout, globalIndex: number): Vec2 {
  const t = globalIndex / layout.trackLength;
  return loopPosition(t, BOARD_SIZE);
}

function colorEntryIndex(layout: BoardLayout, color: LudoColor): number {
  return layout.entryOffsets[layout.colors.indexOf(color)];
}

export function homeStretchPosition(layout: BoardLayout, color: LudoColor, stretchIndex: number): Vec2 {
  const [ex, ez] = trackCellPosition(layout, colorEntryIndex(layout, color));
  const frac = stretchIndex / (layout.homeStretchLength + 1);
  return [ex * (1 - frac), ez * (1 - frac)];
}

export function homeCenterPosition(color: LudoColor, layout: BoardLayout): Vec2 {
  const colorIndex = layout.colors.indexOf(color);
  const angle = (colorIndex / layout.colors.length) * Math.PI * 2;
  const r = 0.5;
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

export function baseSlotPosition(layout: BoardLayout, color: LudoColor, pieceIndex: number): Vec2 {
  const colorIndex = layout.colors.indexOf(color);
  const angle = (colorIndex / layout.colors.length) * Math.PI * 2 + Math.PI / layout.colors.length;
  const cx = Math.cos(angle) * BASE_RADIUS;
  const cz = Math.sin(angle) * BASE_RADIUS;
  const col = pieceIndex % 2;
  const row = Math.floor(pieceIndex / 2);
  const spacing = 0.55;
  return [cx + (col - 0.5) * spacing, cz + (row - 0.5) * spacing];
}

/** World-space (x, z) position for any piece in any location, for a given layout. */
export function piecePosition(layout: BoardLayout, piece: LudoPieceState): Vec2 {
  switch (piece.location) {
    case 'base':
      return baseSlotPosition(layout, piece.color, piece.pieceIndex);
    case 'track':
      return trackCellPosition(layout, globalTrackIndex(layout, piece.color, piece.steps));
    case 'home-stretch':
      return homeStretchPosition(layout, piece.color, homeStretchIndex(layout, piece.steps));
    case 'home':
    default:
      return homeCenterPosition(piece.color, layout);
  }
}

export function allTrackCellPositions(layout: BoardLayout): Vec2[] {
  return Array.from({ length: layout.trackLength }, (_, i) => trackCellPosition(layout, i));
}
