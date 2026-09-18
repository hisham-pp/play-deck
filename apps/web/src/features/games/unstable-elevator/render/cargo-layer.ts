import {
  DROP_HEIGHT,
  PLATFORM_THICKNESS,
  PLATFORM_WIDTH,
  SHAFT_WIDTH,
} from '../engine/elevator-constants';
import { getShape } from '../engine/elevator-objects';
import { boxVertices } from '../engine/physics/shapes';
import { rotate, type Vec2 } from '../engine/physics/vector';
import type { ElevatorBodyView } from '../types/unstable-elevator.types';
import { screenX, screenY, type ElevatorCamera } from './elevator-camera';
import { shade, type ElevatorPalette } from './elevator-palette';

/** Height of the gantry beam the claw runs along. */
const GANTRY_Y = DROP_HEIGHT + 1.35;

function tracePolygon(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  hull: Vec2[],
  position: { x: number; y: number },
  angle: number,
): void {
  ctx.beginPath();
  hull.forEach((vertex, index) => {
    const spun = rotate(vertex, angle);
    const px = screenX(camera, position.x + spun.x);
    const py = screenY(camera, position.y + spun.y);
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  palette: ElevatorPalette,
  platform: { x: number; y: number; angle: number },
): void {
  const hull = boxVertices(PLATFORM_WIDTH, PLATFORM_THICKNESS);

  // Cables run from the gantry down to the deck, so the lift reads as hanging.
  ctx.strokeStyle = palette.cable;
  ctx.lineWidth = Math.max(1.5, camera.scale * 0.04);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(screenX(camera, side * (PLATFORM_WIDTH / 2 - 0.2)), 0);
    ctx.lineTo(
      screenX(camera, platform.x + side * (PLATFORM_WIDTH / 2 - 0.2)),
      screenY(camera, platform.y + PLATFORM_THICKNESS / 2),
    );
    ctx.stroke();
  }

  tracePolygon(ctx, camera, hull, platform, platform.angle);
  ctx.fillStyle = palette.platformDeck;
  ctx.fill();
  ctx.strokeStyle = palette.platformEdge;
  ctx.lineWidth = Math.max(2, camera.scale * 0.05);
  ctx.stroke();

  // Hazard stripe along the front lip of the deck.
  ctx.save();
  tracePolygon(ctx, camera, hull, platform, platform.angle);
  ctx.clip();
  ctx.strokeStyle = palette.platformStripe;
  ctx.lineWidth = Math.max(2, camera.scale * 0.09);
  const stripeStep = camera.scale * 0.42;
  const left = screenX(camera, platform.x - PLATFORM_WIDTH);
  const right = screenX(camera, platform.x + PLATFORM_WIDTH);
  const baseY = screenY(camera, platform.y);
  for (let px = left; px < right; px += stripeStep) {
    ctx.beginPath();
    ctx.moveTo(px, baseY + camera.scale * 0.3);
    ctx.lineTo(px + camera.scale * 0.22, baseY - camera.scale * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

export interface CargoStyle {
  /** Seat rim colours keyed by owner id. */
  rimByOwner: Record<string, string>;
  /** Highlights cargo that has drifted past the platform edge. */
  dangerX: number;
}

export function drawCargo(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  palette: ElevatorPalette,
  bodies: ElevatorBodyView[],
  style: CargoStyle,
): void {
  for (const body of bodies) {
    if (body.shapeId === 'platform') continue;
    const shape = getShape(body.shapeId);
    tracePolygon(ctx, camera, shape.build(), body, body.angle);

    ctx.fillStyle = shade(shape.tint, palette.cargoShade);
    ctx.fill();

    const overhanging = Math.abs(body.x) > style.dangerX;
    ctx.strokeStyle = overhanging
      ? palette.warning
      : (style.rimByOwner[body.ownerId ?? ''] ?? palette.cargoOutline);
    ctx.lineWidth = Math.max(2, camera.scale * (overhanging ? 0.075 : 0.055));
    ctx.stroke();
  }
}

export interface ClawView {
  shapeId: string | null;
  x: number;
  angle: number;
  /** False when the drop is blocked; the ghost turns red. */
  clear: boolean;
  rim: string;
}

export function drawClaw(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  palette: ElevatorPalette,
  claw: ClawView,
): void {
  const beamY = screenY(camera, GANTRY_Y);
  ctx.strokeStyle = palette.clawFrame;
  ctx.lineWidth = Math.max(3, camera.scale * 0.1);
  ctx.beginPath();
  ctx.moveTo(screenX(camera, -SHAFT_WIDTH / 2), beamY);
  ctx.lineTo(screenX(camera, SHAFT_WIDTH / 2), beamY);
  ctx.stroke();

  if (!claw.shapeId) return;

  const trolleyX = screenX(camera, claw.x);
  ctx.beginPath();
  ctx.moveTo(trolleyX, beamY);
  ctx.lineTo(trolleyX, screenY(camera, DROP_HEIGHT));
  ctx.stroke();

  // A drop line down to the deck, so you can see where the object will land.
  ctx.save();
  ctx.setLineDash([camera.scale * 0.18, camera.scale * 0.18]);
  ctx.strokeStyle = claw.clear ? palette.ghost : palette.warning;
  ctx.lineWidth = Math.max(1.5, camera.scale * 0.035);
  ctx.beginPath();
  ctx.moveTo(trolleyX, screenY(camera, DROP_HEIGHT));
  ctx.lineTo(trolleyX, screenY(camera, -0.6));
  ctx.stroke();
  ctx.restore();

  const shape = getShape(claw.shapeId);
  tracePolygon(ctx, camera, shape.build(), { x: claw.x, y: DROP_HEIGHT }, claw.angle);
  ctx.fillStyle = shade(shape.tint, palette.cargoShade);
  ctx.fill();
  ctx.strokeStyle = claw.clear ? claw.rim : palette.warning;
  ctx.lineWidth = Math.max(2, camera.scale * 0.07);
  ctx.stroke();
}
