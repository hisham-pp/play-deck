import type { BoardLayout } from '../../engine/board-layout';
import { globalTrackIndex, homeStretchIndex } from '../../engine/board-layout';
import type { LudoColor, LudoPieceState } from '../../types/ludo.types';

export const CELL_SIZE = 0.48;
export const BOARD_GRID_SIZE = 15;
export const BOARD_PHYSICAL_SIZE = BOARD_GRID_SIZE * CELL_SIZE; // ~7.2 units

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
  if (layout.id === 'classic4') {
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
  if (layout.id === 'classic4') {
    let col = 7;
    let row = 7;
    switch (color) {
      case 'red':
        col = 6.4;
        row = 7;
        break;
      case 'green':
        col = 7;
        row = 6.4;
        break;
      case 'yellow':
        col = 7.6;
        row = 7;
        break;
      case 'blue':
        col = 7;
        row = 7.6;
        break;
    }
    return gridToWorld(col, row);
  }

  const colorIdx = layout.colors.indexOf(color);
  const angle = (colorIdx / layout.colors.length) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * 0.4, Math.sin(angle) * 0.4];
}

export function baseSlotPosition(layout: BoardLayout, color: LudoColor, pieceIndex: number): Vec2 {
  if (layout.id === 'classic4') {
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
        baseCenterCol = 12.5;
        baseCenterRow = 2.5;
        break;
      case 'yellow': // Bottom-Right
        baseCenterCol = 12.5;
        baseCenterRow = 12.5;
        break;
      case 'blue': // Bottom-Left
        baseCenterCol = 2.5;
        baseCenterRow = 12.5;
        break;
    }

    const col = baseCenterCol + (isCol2 ? 0.7 : -0.7);
    const row = baseCenterRow + (isRow2 ? 0.7 : -0.7);
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
