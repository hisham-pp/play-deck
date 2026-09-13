import type { BoardLayout } from '../../engine/board-layout';
import {
  globalTrackIndex,
  homeStretchIndex,
  isHomeStretchSteps,
  isTrackSteps,
} from '../../engine/board-layout';
import type { LudoColor, LudoPieceState } from '../../types/ludo.types';
import { BOARD_PHYSICAL_SIZE, CELL_SIZE, TAU, gridToWorld, type Vec2 } from './board-metrics';
import {
  HEX_BOARD_RADIUS,
  hexBaseSlotPosition,
  hexHomeCenterPosition,
  hexHomeStretchPosition,
  hexTrackPosition,
  hexTrackRotation,
  hexYardCenter,
  hexYardRotation,
} from './hex-board-geometry';

export {
  BASE_YARD_SIZE,
  BOARD_GRID_SIZE,
  BOARD_PHYSICAL_SIZE,
  BOARD_SIZE,
  CELL_SIZE,
  CENTER_SIZE,
  gridToWorld,
} from './board-metrics';
export type { Vec2 } from './board-metrics';
export {
  HEX_BOARD_RADIUS,
  HEX_CENTER_RADIUS,
  HEX_TRACK_APOTHEM,
  HEX_TRACK_RADIUS,
  HEX_YARD_SIZE,
  hexCorridorRotation,
} from './hex-board-geometry';

const LAYOUT_CLASSIC4 = 'classic4';

/** Half-spacing of the 2x2 cluster finished pieces park in. */
const HOME_SLOT_SPREAD = 0.13;

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
  if (layout.id === LAYOUT_CLASSIC4) {
    const idx = ((globalIndex % 52) + 52) % 52;
    const [col, row] = CLASSIC_TRACK_GRID[idx];
    return gridToWorld(col, row);
  }
  return hexTrackPosition(layout, globalIndex);
}

/** Rotation-y for the track cell at `globalIndex`, so cells follow the path. */
export function trackCellRotation(layout: BoardLayout, globalIndex: number): number {
  if (layout.id === LAYOUT_CLASSIC4) return 0;
  return hexTrackRotation(layout, globalIndex);
}

export function homeStretchPosition(
  layout: BoardLayout,
  color: LudoColor,
  stretchIndex: number,
): Vec2 {
  if (layout.id !== LAYOUT_CLASSIC4) return hexHomeStretchPosition(layout, color, stretchIndex);

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

export function homeCenterPosition(color: LudoColor, layout: BoardLayout): Vec2 {
  if (layout.id !== LAYOUT_CLASSIC4) return hexHomeCenterPosition(layout, color);

  switch (color) {
    case 'green':
      return gridToWorld(7, 6);
    case 'yellow':
      return gridToWorld(8, 7);
    case 'blue':
      return gridToWorld(7, 8);
    case 'red':
    default:
      return gridToWorld(6, 7);
  }
}

/** Centre of a colour's base yard, on whichever board is in play. */
export function baseYardCenter(layout: BoardLayout, color: LudoColor): Vec2 {
  if (layout.id !== LAYOUT_CLASSIC4) return hexYardCenter(layout, color);

  switch (color) {
    case 'green':
      return gridToWorld(11.5, 2.5);
    case 'yellow':
      return gridToWorld(11.5, 11.5);
    case 'blue':
      return gridToWorld(2.5, 11.5);
    case 'red':
    default:
      return gridToWorld(2.5, 2.5);
  }
}

/** Rotation-y of a colour's base yard block. */
export function baseYardRotation(layout: BoardLayout, color: LudoColor): number {
  if (layout.id === LAYOUT_CLASSIC4) return 0;
  return hexYardRotation(layout.colors.indexOf(color));
}

/**
 * Resting spot for a finished piece. The hub marker is a single point, so
 * without fanning the four pieces out they all land on the same coordinate and
 * stack into one another.
 */
export function homeSlotPosition(layout: BoardLayout, color: LudoColor, pieceIndex: number): Vec2 {
  const [cx, cz] = homeCenterPosition(color, layout);
  const dx = (pieceIndex % 2 === 0 ? -1 : 1) * HOME_SLOT_SPREAD;
  const dz = (pieceIndex < 2 ? -1 : 1) * HOME_SLOT_SPREAD;
  return [cx + dx, cz + dz];
}

export function baseSlotPosition(layout: BoardLayout, color: LudoColor, pieceIndex: number): Vec2 {
  if (layout.id !== LAYOUT_CLASSIC4) return hexBaseSlotPosition(layout, color, pieceIndex);

  const [cx, cz] = baseYardCenter(layout, color);
  const dx = (pieceIndex % 2 === 1 ? 1 : -1) * CELL_SIZE;
  const dz = (pieceIndex >= 2 ? 1 : -1) * CELL_SIZE;
  return [cx + dx, cz + dz];
}

/** Half-extent of the board — drives the dice walls and the camera framing. */
export function boardExtent(layout: BoardLayout): number {
  return layout.id === LAYOUT_CLASSIC4 ? BOARD_PHYSICAL_SIZE / 2 : HEX_BOARD_RADIUS;
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
  return homeSlotPosition(layout, color, pieceIndex);
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

/**
 * Identifies the board square a piece stands on. Pieces sharing a key sit on
 * one square and have to be shrunk and spread to fit inside it.
 */
export function pieceCellKey(layout: BoardLayout, piece: LudoPieceState): string {
  switch (piece.location) {
    case 'track':
      return `track:${globalTrackIndex(layout, piece.color, piece.steps)}`;
    case 'home-stretch':
      return `stretch:${piece.color}:${homeStretchIndex(layout, piece.steps)}`;
    case 'home':
      return `home:${piece.color}`;
    case 'base':
    default:
      return `base:${piece.color}:${piece.pieceIndex}`;
  }
}

/** How much a piece shrinks so `count` pieces fit inside one square. */
export function stackScale(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 0.68;
  if (count === 3) return 0.56;
  return 0.48;
}

/** Where piece `index` of a `count`-piece stack sits inside its square. */
export function stackOffset(index: number, count: number): Vec2 {
  if (count <= 1) return [0, 0];
  if (count === 2) {
    return [(index === 0 ? -1 : 1) * CELL_SIZE * 0.21, 0];
  }
  const angle = (index / count) * TAU - Math.PI / 2;
  const radius = CELL_SIZE * 0.24;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}
