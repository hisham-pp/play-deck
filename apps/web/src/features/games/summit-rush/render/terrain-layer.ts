import type { Biome } from '../engine/biomes';
import type { Terrain } from '../engine/summit-types';
import { groundHeightAt, segmentIndexAt } from '../engine/terrain-query';
import { hash01 } from './background-layer';

/** Visible world rectangle in meters. */
export interface WorldBounds {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

const DIRT_BAND = 1.5;
const MARKER_SPACING = 100;
const WARNING_LEAD = 16;

function tracePath(
  ctx: CanvasRenderingContext2D,
  terrain: Terrain,
  from: number,
  to: number,
  dy: number,
): void {
  const pts = terrain.points;
  ctx.moveTo(pts[from].x, pts[from].y + dy);
  for (let i = from + 1; i <= to; i++) ctx.lineTo(pts[i].x, pts[i].y + dy);
}

function drawRocks(
  ctx: CanvasRenderingContext2D,
  terrain: Terrain,
  from: number,
  to: number,
  p: Biome,
): void {
  const pts = terrain.points;
  ctx.fillStyle = p.rock;
  for (let i = from; i <= to; i++) {
    const seed = Math.round(pts[i].x * 2);
    const roll = hash01(seed);
    if (roll > 0.12) continue;
    const depth = 0.5 + hash01(seed + 1) * 2.4;
    const size = 0.12 + hash01(seed + 2) * 0.22;
    ctx.beginPath();
    ctx.ellipse(pts[i].x, pts[i].y - depth, size * 1.4, size, hash01(seed + 3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTufts(
  ctx: CanvasRenderingContext2D,
  terrain: Terrain,
  from: number,
  to: number,
  p: Biome,
): void {
  const pts = terrain.points;
  ctx.strokeStyle = p.grassEdge;
  ctx.lineWidth = 0.06;
  ctx.beginPath();
  for (let i = from; i < to; i++) {
    const seed = Math.round(pts[i].x * 2) + 17;
    if (hash01(seed) > 0.22 || pts[i + 1].x - pts[i].x < 0.1) continue;
    const x = pts[i].x;
    const y = pts[i].y + 0.1;
    const h = 0.18 + hash01(seed + 1) * 0.16;
    ctx.moveTo(x - 0.08, y);
    ctx.lineTo(x - 0.12, y + h);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.02, y + h * 1.2);
    ctx.moveTo(x + 0.08, y);
    ctx.lineTo(x + 0.14, y + h * 0.9);
  }
  ctx.stroke();
}

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  terrain: Terrain,
  b: WorldBounds,
  p: Biome,
): void {
  const pts = terrain.points;
  if (pts.length < 2) return;
  const from = segmentIndexAt(pts, b.left - 1);
  const to = Math.min(pts.length - 1, segmentIndexAt(pts, b.right + 1) + 1);
  const floor = b.bottom - 2;

  ctx.beginPath();
  tracePath(ctx, terrain, from, to, 0);
  ctx.lineTo(pts[to].x, floor);
  ctx.lineTo(pts[from].x, floor);
  ctx.closePath();
  ctx.fillStyle = p.dirtDeep;
  ctx.fill();

  // Lighter topsoil band that hugs the surface.
  ctx.beginPath();
  tracePath(ctx, terrain, from, to, 0);
  for (let i = to; i >= from; i--) ctx.lineTo(pts[i].x, pts[i].y - DIRT_BAND);
  ctx.closePath();
  ctx.fillStyle = p.dirt;
  ctx.fill();

  drawRocks(ctx, terrain, from, to, p);

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  tracePath(ctx, terrain, from, to, -0.12);
  ctx.strokeStyle = p.grassEdge;
  ctx.lineWidth = 0.34;
  ctx.stroke();
  ctx.beginPath();
  tracePath(ctx, terrain, from, to, 0);
  ctx.strokeStyle = p.grass;
  ctx.lineWidth = 0.24;
  ctx.stroke();
  drawTufts(ctx, terrain, from, to, p);
}

function drawPost(ctx: CanvasRenderingContext2D, x: number, y: number, height: number): void {
  ctx.fillStyle = '#5b4636';
  ctx.fillRect(x - 0.05, y - 0.2, 0.1, height + 0.2);
}

function drawWarningSign(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  drawPost(ctx, x, y, 1.3);
  const cy = y + 1.55;
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 0.06;
  ctx.beginPath();
  ctx.moveTo(x, cy + 0.42);
  ctx.lineTo(x + 0.45, cy - 0.34);
  ctx.lineTo(x - 0.45, cy - 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x - 0.035, cy - 0.08, 0.07, 0.3);
  ctx.beginPath();
  ctx.arc(x, cy - 0.2, 0.045, 0, Math.PI * 2);
  ctx.fill();
}

export interface MarkerLabel {
  x: number;
  y: number;
  text: string;
  color: string;
}

function drawFlag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  time: number,
): void {
  drawPost(ctx, x, y, 2.4);
  const wave = Math.sin(time * 4 + x) * 0.08;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + 0.05, y + 2.4);
  ctx.quadraticCurveTo(x + 0.45, y + 2.3 + wave, x + 0.9, y + 2.2);
  ctx.lineTo(x + 0.05, y + 1.85);
  ctx.closePath();
  ctx.fill();
}

/**
 * Distance posts, the best-distance flag and gap warnings. Returns labels to
 * draw in screen space (text can't be drawn in the flipped world transform).
 */
export function drawMarkers(
  ctx: CanvasRenderingContext2D,
  terrain: Terrain,
  b: WorldBounds,
  startX: number,
  bestDistance: number,
  time: number,
): MarkerLabel[] {
  const labels: MarkerLabel[] = [];
  const first = Math.max(1, Math.ceil((b.left - startX) / MARKER_SPACING));
  for (let k = first; startX + k * MARKER_SPACING < b.right; k++) {
    const x = startX + k * MARKER_SPACING;
    const y = groundHeightAt(terrain, x);
    drawFlag(ctx, x, y, '#f8fafc', time);
    labels.push({ x: x + 0.45, y: y + 2.05, text: `${k * MARKER_SPACING}`, color: '#0f172a' });
  }
  const bestX = startX + bestDistance;
  if (bestDistance > 20 && bestX > b.left && bestX < b.right) {
    const y = groundHeightAt(terrain, bestX);
    drawFlag(ctx, bestX, y, '#f59e0b', time);
    labels.push({ x: bestX, y: y + 2.9, text: 'BEST', color: '#f59e0b' });
  }
  for (const gap of terrain.gaps) {
    const x = gap.startX - WARNING_LEAD;
    if (x > b.left && x < b.right) drawWarningSign(ctx, x, groundHeightAt(terrain, x));
  }
  return labels;
}
