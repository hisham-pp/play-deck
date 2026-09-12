import type { BoardLayout } from '../../engine/board-layout';
import {
  globalTrackIndex,
  homeStretchIndex,
  isHomeStretchSteps,
  isTrackSteps,
} from '../../engine/board-layout';
import type { LudoColor, LudoPieceState } from '../../types/ludo.types';

export const BOARD_SIZE = 15;
export const BOARD_GRID_SIZE = 15;
export const CELL_SIZE = 0.52;
const LAYOUT_CLASSIC4 = 'classic4';

/** Exact span of the 15x15 playfield in world units. */
export const BOARD_PHYSICAL_SIZE = BOARD_GRID_SIZE * CELL_SIZE;
/** A base yard covers a 6x6 block of grid cells. */
export const BASE_YARD_SIZE = 6 * CELL_SIZE;
/** The victory hub covers the middle 3x3 block. */
export const CENTER_SIZE = 3 * CELL_SIZE;

export type Vec2 = [number, number];

export function gridToWorld(col: number, row: number): Vec2 {
  const half = (BOARD_GRID_SIZE - 1) / 2;
  return [(col - half) * CELL_SIZE, (row - half) * CELL_SIZE];
}

// 52-cell track path for classic 4-arm board (cols, rows on 15x15 grid)
const CLASSIC_TRACK_GRID: Vec2[] = [
  // Red Arm (left -> top)
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 5],
  [6, 4],
  [6, 3],
  [6, 2],
  [6, 1],
  [6, 0],
  [7, 0],
  // Green Arm (top -> right)
  [8, 0],
  [8, 1],
  [8, 2],
  [8, 3],
  [8, 4],
  [8, 5],
  [9, 6],
  [10, 6],
  [11, 6],
  [12, 6],
  [13, 6],
  [14, 6],
  [14, 7],
  // Yellow Arm (right -> bottom)
  [14, 8],
  [13, 8],
  [12, 8],
  [11, 8],
  [10, 8],
  [9, 8],
  [8, 9],
  [8, 10],
  [8, 11],
  [8, 12],
  [8, 13],
  [8, 14],
  [7, 14],
  // Blue Arm (bottom -> left)
  [6, 14],
  [6, 13],
  [6, 12],
  [6, 11],
  [6, 10],
  [6, 9],
  [5, 8],
  [4, 8],
  [3, 8],
  [2, 8],
  [1, 8],
  [0, 8],
  [0, 7],
  [0, 6],
];

export function trackCellPosition(layout: BoardLayout, globalIndex: number): Vec2 {
  if (layout.id === 'classic4') {
    const idx = ((globalIndex % 52) + 52) % 52;
    const [col, row] = CLASSIC_TRACK_GRID[idx];
    return gridToWorld(col, row);
  }

  // 6-arm radial layout
  const angle = (globalIndex / layout.trackLength) * Math.PI * 2 - Math.PI / 2;
  const radius = 3.2;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

export function homeStretchPosition(
  layout: BoardLayout,
  color: LudoColor,
  stretchIndex: number,
): Vec2 {
  if (layout.id === LAYOUT_CLASSIC4) {
    let col = 7;
    let row = 7;
    const step = Math.min(6, Math.max(1, stretchIndex));

    switch (color) {
      case 'red':
        col = step;
        row = 7;
        break;
      case 'green':
        col = 7;
        row = step;
        break;
      case 'yellow':
        col = 14 - step;
        row = 7;
        break;
      case 'blue':
        col = 7;
        row = 14 - step;
        break;
    }
    return gridToWorld(col, row);
  }

  // 6-arm radial home stretch
  const colorIdx = layout.colors.indexOf(color);
  const angle = (colorIdx / layout.colors.length) * Math.PI * 2 - Math.PI / 2;
  const radius = 2.8 * (1 - stretchIndex / 7);
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

export function homeCenterPosition(color: LudoColor, layout: BoardLayout): Vec2 {
  if (layout.id === LAYOUT_CLASSIC4) {
    let col = 7;
    let row = 7;
    switch (color) {
      case 'red':
        col = 6;
        row = 7;
        break;
      case 'green':
        col = 7;
        row = 6;
        break;
      case 'yellow':
        col = 8;
        row = 7;
        break;
      case 'blue':
        col = 7;
        row = 8;
        break;
    }
    return gridToWorld(col, row);
  }

  const colorIdx = layout.colors.indexOf(color);
  const angle = (colorIdx / layout.colors.length) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * 0.85, Math.sin(angle) * 0.85];
}

export function baseSlotPosition(layout: BoardLayout, color: LudoColor, pieceIndex: number): Vec2 {
  if (layout.id === LAYOUT_CLASSIC4) {
    const isCol2 = pieceIndex % 2 === 1;
    const isRow2 = pieceIndex >= 2;

    let baseCenterCol = 2.5;
    let baseCenterRow = 2.5;

    switch (color) {
      case 'red': // Top-Left
        baseCenterCol = 2.5;
        baseCenterRow = 2.5;
        break;
      case 'green': // Top-Right
        baseCenterCol = 11.5;
        baseCenterRow = 2.5;
        break;
      case 'yellow': // Bottom-Right
        baseCenterCol = 11.5;
        baseCenterRow = 11.5;
        break;
      case 'blue': // Bottom-Left
        baseCenterCol = 2.5;
        baseCenterRow = 11.5;
        break;
    }

    const col = baseCenterCol + (isCol2 ? 1 : -1);
    const row = baseCenterRow + (isRow2 ? 1 : -1);
    return gridToWorld(col, row);
  }

  // 6-arm radial base slots
  const colorIdx = layout.colors.indexOf(color);
  const angle = (colorIdx / layout.colors.length) * Math.PI * 2 - Math.PI / 2;
  const radius = 3.8;
  const cx = Math.cos(angle) * radius;
  const cz = Math.sin(angle) * radius;
  const dx = ((pieceIndex % 2) - 0.5) * 0.5;
  const dz = (Math.floor(pieceIndex / 2) - 0.5) * 0.5;
  return [cx + dx, cz + dz];
}

/**
 * Where a piece sits after exactly `steps` steps, independent of the location
 * the engine recorded. Walking a move one cell at a time needs the position of
 * squares the piece only passes through, which never appear in piece state.
 */
export function positionForSteps(
  layout: BoardLayout,
  color: LudoColor,
  pieceIndex: number,
  steps: number,
): Vec2 {
  if (steps <= 0) return baseSlotPosition(layout, color, pieceIndex);
  if (isTrackSteps(layout, steps)) {
    return trackCellPosition(layout, globalTrackIndex(layout, color, steps));
  }
  if (isHomeStretchSteps(layout, steps)) {
    return homeStretchPosition(layout, color, homeStretchIndex(layout, steps));
  }
  return homeCenterPosition(color, layout);
}

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
