import { paletteAt } from '../engine/biomes';
import { POPUP_LIFE } from '../engine/particles';
import { VIEW_HEIGHT_METERS } from '../engine/summit-constants';
import type { World } from '../engine/summit-types';
import { drawBackground, type ScreenView } from './background-layer';
import { drawCollectibles, drawParticles } from './effects-layer';
import { drawGhostTags, drawGhostVehicles, type GhostView } from './ghost-layer';
import { drawMarkers, drawTerrain, type MarkerLabel, type WorldBounds } from './terrain-layer';
import { drawDizzyStars, drawVehicle } from './vehicle-sprite';

export interface Viewport {
  width: number;
  height: number;
  dpr: number;
}

export interface RenderOptions {
  bestDistance: number;
  /** Pixels reserved at the top for the DOM HUD. */
  hudInset: number;
  reducedMotion: boolean;
  ghosts: GhostView[];
}

const ANCHOR_X = 0.4;
const ANCHOR_Y = 0.56;
const MAX_SHAKE_PX = 14;
const LABEL_FONT = '700 13px ui-sans-serif, system-ui, sans-serif';

/** Pixels per meter before zoom — fits the view on tall and wide screens. */
export function basePixelsPerMeter(vp: Viewport): number {
  return Math.min(vp.height / VIEW_HEIGHT_METERS, vp.width / 24);
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  labels: MarkerLabel[],
  toScreen: (x: number, y: number) => [number, number],
): void {
  ctx.font = LABEL_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const l of labels) {
    const [sx, sy] = toScreen(l.x, l.y);
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, sx, sy);
  }
}

function drawPopups(
  ctx: CanvasRenderingContext2D,
  world: World,
  vp: Viewport,
  inset: number,
): void {
  const size = Math.round(Math.max(16, Math.min(26, vp.width / 30)));
  ctx.font = `900 ${size}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  world.popups.forEach((popup, i) => {
    const age = 1 - popup.life / POPUP_LIFE;
    const y = inset + 36 + i * (size + 10) - age * 14;
    ctx.globalAlpha = Math.min(1, popup.life * 2.5);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(15,23,42,0.75)';
    ctx.strokeText(popup.text, vp.width / 2, y);
    ctx.fillStyle = popup.color;
    ctx.fillText(popup.text, vp.width / 2, y);
  });
  ctx.globalAlpha = 1;
}

function drawLowFuelVignette(ctx: CanvasRenderingContext2D, world: World, vp: Viewport): void {
  const ratio = world.fuel / world.vehicle.spec.fuelCapacity;
  if (ratio > 0.2 || world.status !== 'running') return;
  const pulse = (Math.sin(world.time * 6) + 1) / 2;
  const strength = (1 - ratio / 0.2) * 0.25 + pulse * 0.15;
  const r = Math.max(vp.width, vp.height) * 0.75;
  const g = ctx.createRadialGradient(
    vp.width / 2,
    vp.height / 2,
    r * 0.45,
    vp.width / 2,
    vp.height / 2,
    r,
  );
  g.addColorStop(0, 'rgba(239,68,68,0)');
  g.addColorStop(1, `rgba(239,68,68,${strength.toFixed(3)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, vp.width, vp.height);
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  world: World,
  vp: Viewport,
  opts: RenderOptions,
): void {
  const { camera } = world;
  const basePpm = basePixelsPerMeter(vp);
  const ppm = basePpm * camera.zoom;
  const shake = opts.reducedMotion ? 0 : camera.shake * MAX_SHAKE_PX;
  const shakeX = shake ? (Math.random() - 0.5) * shake : 0;
  const shakeY = shake ? (Math.random() - 0.5) * shake : 0;
  const palette = paletteAt(camera.x - world.startX);

  const view: ScreenView = {
    width: vp.width,
    height: vp.height,
    camX: camera.x,
    camY: camera.y,
    basePpm,
    time: world.time,
  };
  ctx.setTransform(vp.dpr, 0, 0, vp.dpr, 0, 0);
  drawBackground(ctx, view, palette);

  const originX = vp.width * ANCHOR_X - camera.x * ppm + shakeX;
  const originY = vp.height * ANCHOR_Y + camera.y * ppm + shakeY;
  const toScreen = (x: number, y: number): [number, number] => [
    originX + x * ppm,
    originY - y * ppm,
  ];
  const bounds: WorldBounds = {
    left: camera.x - (vp.width * ANCHOR_X) / ppm,
    right: camera.x + (vp.width * (1 - ANCHOR_X)) / ppm,
    bottom: camera.y - (vp.height * (1 - ANCHOR_Y)) / ppm,
    top: camera.y + (vp.height * ANCHOR_Y) / ppm,
  };

  // World space: meters, y up.
  ctx.setTransform(vp.dpr * ppm, 0, 0, -vp.dpr * ppm, vp.dpr * originX, vp.dpr * originY);
  const labels = drawMarkers(
    ctx,
    world.terrain,
    bounds,
    world.startX,
    opts.bestDistance,
    world.time,
  );
  drawTerrain(ctx, world.terrain, bounds, palette);
  drawCollectibles(ctx, world.collectibles, bounds, world.time);
  drawGhostVehicles(ctx, opts.ghosts, bounds);
  drawVehicle(ctx, world.vehicle, world.crashReason === 'head');
  if (world.crashReason === 'head' || world.crashReason === 'flipped') {
    drawDizzyStars(ctx, world.vehicle, world.time);
  }
  drawParticles(ctx, world.particles);

  // Screen space overlays.
  ctx.setTransform(vp.dpr, 0, 0, vp.dpr, 0, 0);
  drawLabels(ctx, labels, toScreen);
  drawGhostTags(ctx, opts.ghosts, bounds, toScreen, {
    width: vp.width,
    height: vp.height,
    playerX: world.vehicle.pos.x,
  });
  drawLowFuelVignette(ctx, world, vp);
  drawPopups(ctx, world, vp, opts.hudInset);
}
