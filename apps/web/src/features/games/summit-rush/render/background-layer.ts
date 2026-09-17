import type { Biome } from '../engine/biomes';

export interface ScreenView {
  width: number;
  height: number;
  /** Camera position in world meters. */
  camX: number;
  camY: number;
  /** Pixels per meter without zoom (keeps parallax stable while zooming). */
  basePpm: number;
  time: number;
}

/** Deterministic 0..1 hash for decoration placement. */
export function hash01(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function layerOffset(view: ScreenView, factor: number): number {
  return view.camX * view.basePpm * factor;
}

function verticalShift(view: ScreenView, factor: number): number {
  return Math.max(
    -view.height * 0.12,
    Math.min(view.height * 0.12, view.camY * view.basePpm * factor * 0.25),
  );
}

function drawSky(ctx: CanvasRenderingContext2D, view: ScreenView, p: Biome): void {
  const sky = ctx.createLinearGradient(0, 0, 0, view.height);
  sky.addColorStop(0, p.skyTop);
  sky.addColorStop(1, p.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, view.width, view.height);

  const sx = view.width * 0.78;
  const sy = view.height * 0.2;
  const r = Math.min(view.width, view.height) * 0.07;
  const glow = ctx.createRadialGradient(sx, sy, r * 0.6, sx, sy, r * 3.2);
  glow.addColorStop(0, `${p.sun}aa`);
  glow.addColorStop(1, `${p.sun}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(sx - r * 3.2, sy - r * 3.2, r * 6.4, r * 6.4);
  ctx.fillStyle = p.sun;
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds(ctx: CanvasRenderingContext2D, view: ScreenView, p: Biome): void {
  const spacing = Math.max(260, view.width * 0.38);
  const offset = layerOffset(view, 0.05) + view.time * 8;
  const first = Math.floor(offset / spacing) - 1;
  ctx.fillStyle = p.cloud;
  ctx.globalAlpha = 0.85;
  for (let k = first; k * spacing - offset < view.width + spacing; k++) {
    const x = k * spacing - offset + hash01(k) * spacing * 0.5;
    const y = view.height * (0.08 + hash01(k + 9) * 0.22);
    const s = (0.6 + hash01(k + 3) * 0.7) * Math.min(1.4, view.height / 520);
    ctx.beginPath();
    ctx.ellipse(x, y, 46 * s, 16 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 26 * s, y + 4 * s, 26 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 20 * s, y - 8 * s, 28 * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

type RidgeFn = (u: number) => number;

const mountainRidge: RidgeFn = (u) =>
  Math.abs(Math.sin(u * 0.9)) * 0.55 +
  Math.abs(Math.sin(u * 2.3 + 1)) * 0.28 +
  Math.sin(u * 5.1) * 0.05;

const rollingRidge: RidgeFn = (u) => Math.sin(u) * 0.5 + Math.sin(u * 2.2 + 2) * 0.3 + 0.2;

/** Fills a silhouette whose top follows `ridge`; returns a height sampler. */
function drawRidge(
  ctx: CanvasRenderingContext2D,
  view: ScreenView,
  factor: number,
  base: number,
  amplitude: number,
  period: number,
  ridge: RidgeFn,
  color: string,
): (sx: number) => number {
  const offset = layerOffset(view, factor);
  const shift = verticalShift(view, factor);
  const top = (sx: number) =>
    view.height * base + shift - ridge((sx + offset) / period) * amplitude;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, view.height);
  const step = Math.max(6, view.width / 140);
  for (let sx = 0; sx <= view.width + step; sx += step) ctx.lineTo(sx, top(sx));
  ctx.lineTo(view.width, view.height);
  ctx.closePath();
  ctx.fill();
  return top;
}

/** Light caps on every peak that rises above `cut` (screen y). */
function drawPeakCaps(
  ctx: CanvasRenderingContext2D,
  view: ScreenView,
  top: (sx: number) => number,
  cut: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55;
  const step = Math.max(6, view.width / 140);
  ctx.beginPath();
  let open = false;
  for (let sx = 0; sx <= view.width + step; sx += step) {
    const y = top(sx);
    if (y < cut) {
      if (!open) ctx.moveTo(sx, cut);
      ctx.lineTo(sx, y);
      open = true;
    } else if (open) {
      ctx.lineTo(sx, cut);
      open = false;
    }
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawTrees(
  ctx: CanvasRenderingContext2D,
  view: ScreenView,
  factor: number,
  top: (sx: number) => number,
  p: Biome,
  scale: number,
): void {
  const spacing = 70 * scale;
  const offset = layerOffset(view, factor);
  const first = Math.floor(offset / spacing) - 1;
  for (let k = first; k * spacing - offset < view.width + spacing; k++) {
    if (hash01(k * 3.3) < 0.35) continue;
    const x = k * spacing - offset + hash01(k) * spacing * 0.6;
    const h = (26 + hash01(k + 5) * 30) * scale;
    const y = top(x) + 4;
    ctx.fillStyle = p.trunk;
    ctx.fillRect(x - 2 * scale, y - h * 0.3, 4 * scale, h * 0.3);
    ctx.fillStyle = p.tree;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - h * 0.32, y - h * 0.25);
    ctx.lineTo(x + h * 0.32, y - h * 0.25);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, view: ScreenView, p: Biome): void {
  const h = view.height;
  drawSky(ctx, view, p);
  drawClouds(ctx, view, p);
  const farAmp = h * 0.3;
  const far = drawRidge(ctx, view, 0.06, 0.62, farAmp, 150, mountainRidge, p.far);
  drawPeakCaps(ctx, view, far, h * 0.62 + verticalShift(view, 0.06) - farAmp * 0.6, p.cloud);
  const mid = drawRidge(ctx, view, 0.16, 0.7, h * 0.12, 110, rollingRidge, p.mid);
  drawTrees(ctx, view, 0.16, mid, p, Math.max(0.7, h / 700));
  const near = drawRidge(ctx, view, 0.3, 0.8, h * 0.1, 80, rollingRidge, p.near);
  drawTrees(ctx, view, 0.3, near, p, Math.max(0.9, h / 520));
}
