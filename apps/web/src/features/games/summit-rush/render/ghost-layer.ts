import { FRONT_MOUNT, REAR_MOUNT, WHEEL_RADIUS } from '../engine/summit-constants';
import type { GhostPose, GhostStatus } from '../multiplayer/race-protocol';
import type { WorldBounds } from './terrain-layer';
import { drawVehicle, RIVAL_LIVERY, type VehiclePose } from './vehicle-sprite';

export interface GhostView {
  id: string;
  name: string;
  pose: GhostPose;
  distance: number;
  status: GhostStatus;
}

const GHOST_ALPHA = 0.62;
const TAG_FONT = '800 12px ui-sans-serif, system-ui, sans-serif';

function toVehiclePose(pose: GhostPose): VehiclePose {
  return {
    pos: { x: pose.x, y: pose.y },
    angle: pose.angle,
    squash: 0,
    wheels: [
      {
        pos: { x: pose.wheels[0].x, y: pose.wheels[0].y },
        angle: pose.wheels[0].angle,
        radius: WHEEL_RADIUS,
        mount: REAR_MOUNT,
      },
      {
        pos: { x: pose.wheels[1].x, y: pose.wheels[1].y },
        angle: pose.wheels[1].angle,
        radius: WHEEL_RADIUS,
        mount: FRONT_MOUNT,
      },
    ],
  };
}

/** World-space pass: translucent rival buggies. */
export function drawGhostVehicles(
  ctx: CanvasRenderingContext2D,
  ghosts: GhostView[],
  b: WorldBounds,
): void {
  for (const g of ghosts) {
    if (g.pose.x < b.left - 3 || g.pose.x > b.right + 3) continue;
    ctx.globalAlpha = g.status === 'running' ? GHOST_ALPHA : GHOST_ALPHA * 0.6;
    drawVehicle(ctx, toVehiclePose(g.pose), g.status !== 'running', RIVAL_LIVERY);
  }
  ctx.globalAlpha = 1;
}

function drawTag(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = 'rgba(15,23,42,0.78)';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - 11, w, 22, 11);
  ctx.fill();
  ctx.fillStyle = RIVAL_LIVERY.body;
  ctx.fillText(text, x, y + 0.5);
}

/**
 * Screen-space pass: a name tag above visible ghosts, or an edge arrow with
 * the gap in meters when the rival is off-screen.
 */
export function drawGhostTags(
  ctx: CanvasRenderingContext2D,
  ghosts: GhostView[],
  b: WorldBounds,
  toScreen: (x: number, y: number) => [number, number],
  view: { width: number; height: number; playerX: number },
): void {
  ctx.font = TAG_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const g of ghosts) {
    const onScreen = g.pose.x > b.left && g.pose.x < b.right;
    if (onScreen) {
      const [sx, sy] = toScreen(g.pose.x, g.pose.y + 2.3);
      drawTag(ctx, g.name, sx, Math.max(16, Math.min(view.height - 16, sy)));
      continue;
    }
    const ahead = g.pose.x > b.right;
    const gap = Math.round(Math.abs(g.pose.x - view.playerX));
    const x = ahead ? view.width - 64 : 64;
    const y = view.height * 0.42;
    drawTag(ctx, `${ahead ? '' : '◀ '}${g.name} ${gap}m${ahead ? ' ▶' : ''}`, x, y);
  }
}
