import { SHAFT_WIDTH } from '../engine/elevator-constants';
import { screenX, screenY, type ElevatorCamera } from './elevator-camera';
import type { ElevatorPalette } from './elevator-palette';

/** Vertical spacing between the girders that scroll past as the lift climbs. */
const GIRDER_SPACING = 2.4;
/** Width of the service ducts running up either side of the shaft. */
const DUCT_WIDTH = 0.55;

export interface ShaftView {
  floor: number;
  /** 0–1 through the ascent, used to scroll the girders and floor plate. */
  ascentProgress: number;
}

function drawWalls(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  palette: ElevatorPalette,
): void {
  ctx.fillStyle = palette.shaftBack;
  ctx.fillRect(0, 0, camera.width, camera.height);

  const left = screenX(camera, -SHAFT_WIDTH / 2);
  const right = screenX(camera, SHAFT_WIDTH / 2);
  const duct = DUCT_WIDTH * camera.scale;

  ctx.fillStyle = palette.shaftWall;
  ctx.fillRect(0, 0, left, camera.height);
  ctx.fillRect(right, 0, camera.width - right, camera.height);

  ctx.fillStyle = palette.shaftRail;
  ctx.fillRect(left - duct, 0, duct, camera.height);
  ctx.fillRect(right, 0, duct, camera.height);
}

/**
 * Girders scroll downwards as the lift rises. Their offset comes from the floor
 * number plus the ascent, so the shaft keeps moving between floors instead of
 * snapping back to the same frame.
 */
function drawGirders(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  palette: ElevatorPalette,
  view: ShaftView,
): void {
  const travelled = (view.floor + view.ascentProgress) * GIRDER_SPACING;
  const offset = travelled % GIRDER_SPACING;
  const left = screenX(camera, -SHAFT_WIDTH / 2);
  const right = screenX(camera, SHAFT_WIDTH / 2);

  ctx.strokeStyle = palette.shaftLine;
  ctx.lineWidth = Math.max(2, camera.scale * 0.06);

  for (
    let y = -GIRDER_SPACING;
    y < camera.height / camera.scale + GIRDER_SPACING;
    y += GIRDER_SPACING
  ) {
    const worldY = y + offset;
    const py = screenY(camera, 0) - camera.height + worldY * camera.scale;
    if (py < -20 || py > camera.height + 20) continue;
    ctx.beginPath();
    ctx.moveTo(left, py);
    ctx.lineTo(right, py);
    ctx.stroke();
  }
}

/** The floor plate the lift is heading for, sliding down into view. */
function drawFloorPlate(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  palette: ElevatorPalette,
  view: ShaftView,
): void {
  const label = `FLOOR ${view.floor + (view.ascentProgress > 0.5 ? 1 : 0)}`;
  const slide = view.ascentProgress * 2.6;
  const py = screenY(camera, 6.4 - slide);
  const left = screenX(camera, -SHAFT_WIDTH / 2);
  const right = screenX(camera, SHAFT_WIDTH / 2);

  ctx.strokeStyle = palette.floorMarker;
  ctx.lineWidth = Math.max(2, camera.scale * 0.05);
  ctx.setLineDash([camera.scale * 0.3, camera.scale * 0.22]);
  ctx.beginPath();
  ctx.moveTo(left, py);
  ctx.lineTo(right, py);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = palette.floorMarker;
  ctx.font = `700 ${Math.round(camera.scale * 0.34)}px ui-monospace, monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, left + camera.scale * 0.2, py - camera.scale * 0.14);
}

export function drawShaft(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  palette: ElevatorPalette,
  view: ShaftView,
): void {
  drawWalls(ctx, camera, palette);
  drawGirders(ctx, camera, palette, view);
  if (view.floor > 0) drawFloorPlate(ctx, camera, palette, view);
}
