import type { BoardLayout } from '../../engine/board-layout';
import type { LudoColor } from '../../types/ludo.types';
import { CELL_SIZE, TAU, yRotationForAngle, type Vec2 } from './board-metrics';

/**
 * Extended 6-arm board.
 *
 * The 6-player board is a regular hexagon. Each colour owns one side, and that
 * side carries exactly its 9 track cells, so the 54-cell ring closes on the
 * perimeter at uniform CELL_SIZE spacing. A colour's entry square sits at the
 * start of its own side (a hexagon vertex), which is also where its home
 * corridor dives inward toward the hub — so a full lap ends one square short of
 * where it began, exactly as the cross board behaves.
 *
 * Base yards sit just outside the ring, centred on their own colour's side,
 * keeping a player's yard, entry square and home corridor together.
 */

/** Circumradius of the track hexagon. Side length equals circumradius, so one
 *  side spans exactly `cellsPerArm` cells at CELL_SIZE spacing. */
export const HEX_TRACK_RADIUS = 9 * CELL_SIZE;
/** Centre to the middle of a hexagon side. */
export const HEX_TRACK_APOTHEM = (HEX_TRACK_RADIUS * Math.sqrt(3)) / 2;
/** A hex base yard covers a 4x4 block of cells, holding 2x2 piece slots. */
export const HEX_YARD_SIZE = 4 * CELL_SIZE;
/** How far out the yards sit, measured along their own side's outward normal. */
export const HEX_YARD_RADIUS = HEX_TRACK_APOTHEM + HEX_YARD_SIZE / 2 + CELL_SIZE * 0.55;
/** Circumradius of the hexagonal slab everything is printed on. */
export const HEX_BOARD_RADIUS = HEX_YARD_RADIUS + HEX_YARD_SIZE * 0.78;
/** Radius of the hex victory hub. Sized so the six home corridors run right up
 *  to its edge instead of stopping short of it. */
export const HEX_CENTER_RADIUS = HEX_TRACK_RADIUS - 6.5 * CELL_SIZE;

/** Angle of hexagon vertex `k`, which is also colour `k`'s corridor direction. */
export function hexVertexAngle(k: number): number {
  return (((k % 6) + 6) % 6) * (TAU / 6) - Math.PI / 2;
}

/** Outward normal angle of side `k` — the direction colour `k`'s yard sits in. */
export function hexSideAngle(k: number): number {
  return hexVertexAngle(k) + Math.PI / 6;
}

/** Vertex `k` of the track hexagon. */
export function hexVertex(k: number): Vec2 {
  const angle = hexVertexAngle(k);
  return [Math.cos(angle) * HEX_TRACK_RADIUS, Math.sin(angle) * HEX_TRACK_RADIUS];
}

/** Rotation-y that lays a cell flat along side `k` of the hexagon. */
export function hexSideRotation(k: number): number {
  return yRotationForAngle(hexVertexAngle(k) + TAU / 3);
}

/** Rotation-y for cells in colour `k`'s home corridor. */
export function hexCorridorRotation(k: number): number {
  return yRotationForAngle(hexVertexAngle(k));
}

/** Rotation-y for colour `k`'s base yard block. */
export function hexYardRotation(k: number): number {
  return yRotationForAngle(hexSideAngle(k));
}

export function hexTrackPosition(layout: BoardLayout, globalIndex: number): Vec2 {
  const total = layout.trackLength;
  const idx = ((globalIndex % total) + total) % total;
  const side = Math.floor(idx / layout.cellsPerArm);
  const withinSide = idx % layout.cellsPerArm;

  const [ax, az] = hexVertex(side);
  const [bx, bz] = hexVertex(side + 1);
  const t = (withinSide + 0.5) / layout.cellsPerArm;
  return [ax + (bx - ax) * t, az + (bz - az) * t];
}

/** Side index a track cell belongs to — its cells all share one rotation. */
export function hexTrackRotation(layout: BoardLayout, globalIndex: number): number {
  const total = layout.trackLength;
  const idx = ((globalIndex % total) + total) % total;
  return hexSideRotation(Math.floor(idx / layout.cellsPerArm));
}

export function hexHomeStretchPosition(
  layout: BoardLayout,
  color: LudoColor,
  stretchIndex: number,
): Vec2 {
  const colorIdx = layout.colors.indexOf(color);
  const step = Math.min(layout.homeStretchLength, Math.max(1, stretchIndex));
  const angle = hexVertexAngle(colorIdx);
  const radius = HEX_TRACK_RADIUS - step * CELL_SIZE;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

export function hexHomeCenterPosition(layout: BoardLayout, color: LudoColor): Vec2 {
  const angle = hexVertexAngle(layout.colors.indexOf(color));
  const radius = HEX_CENTER_RADIUS * 0.55;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

/** Centre of colour `color`'s base yard on the hex board. */
export function hexYardCenter(layout: BoardLayout, color: LudoColor): Vec2 {
  const angle = hexSideAngle(layout.colors.indexOf(color));
  return [Math.cos(angle) * HEX_YARD_RADIUS, Math.sin(angle) * HEX_YARD_RADIUS];
}

export function hexBaseSlotPosition(
  layout: BoardLayout,
  color: LudoColor,
  pieceIndex: number,
): Vec2 {
  const colorIdx = layout.colors.indexOf(color);
  const [cx, cz] = hexYardCenter(layout, color);

  // Lay the 2x2 slot block out in the yard's own frame: `out` points away from
  // the board centre, `along` runs parallel to the colour's own track side.
  const outAngle = hexSideAngle(colorIdx);
  const out: Vec2 = [Math.cos(outAngle), Math.sin(outAngle)];
  const along: Vec2 = [-out[1], out[0]];

  const du = (pieceIndex % 2 === 1 ? 1 : -1) * CELL_SIZE;
  const dv = (pieceIndex >= 2 ? 1 : -1) * CELL_SIZE;
  return [cx + along[0] * du + out[0] * dv, cz + along[1] * du + out[1] * dv];
}
