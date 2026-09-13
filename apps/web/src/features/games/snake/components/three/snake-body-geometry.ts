import { Color, Vector3 } from 'three';
import type { Coordinate } from '../../types/snake.types';
import { gridToWorldX, gridToWorldZ, PALETTE } from './snake-scene-config';

const TAU = Math.PI * 2;

/** How thick the body is relative to one grid cell. */
const BODY_RADIUS_RATIO = 0.43;
/** Lateral slither amplitude, in grid cells. */
const UNDULATION_AMPLITUDE = 0.17;
const UNDULATION_WAVES = 2.6;
const UNDULATION_SPEED = 5.4;
/** Never wiggle the first stretch behind the head, so turns stay grid-true. */
const HEAD_LOCK_SPAN = 0.14;

const COLOR_SCALE_LIGHT = new Color(PALETTE.scaleLight);
const COLOR_SCALE_DARK = new Color(PALETTE.scaleDark);
const COLOR_DEAD = new Color(PALETTE.dead);

export interface PathPoint {
  x: number;
  y: number;
}

export function coordToPathPoint(coord: Coordinate): PathPoint {
  return { x: coord.x, y: coord.y };
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * True when the snake jumped rather than crawled (restart, reconfigure), in
 * which case the renderer should snap instead of gliding across the arena.
 */
export function isDiscontinuous(previous: Coordinate[], next: Coordinate[]): boolean {
  if (previous.length === 0 || next.length === 0) return true;
  if (Math.abs(next.length - previous.length) > 1) return true;
  const step = Math.abs(next[0].x - previous[0].x) + Math.abs(next[0].y - previous[0].y);
  return step > 1;
}

/**
 * Interpolates every segment from where it was rendered last tick toward its
 * new grid cell. Segments appended by eating grow out of the old tail.
 */
export function interpolatePath(from: PathPoint[], to: Coordinate[], t: number): PathPoint[] {
  const fallback = from[from.length - 1];
  return to.map((target, index) => {
    const source = from[index] ?? fallback ?? coordToPathPoint(target);
    return {
      x: source.x + (target.x - source.x) * t,
      y: source.y + (target.y - source.y) * t,
    };
  });
}

/** Fills a reusable Vector3 pool with the world-space spine of the snake. */
export function writeSpine(path: PathPoint[], gridSize: number, pool: Vector3[]): Vector3[] {
  const spine: Vector3[] = [];
  for (let i = 0; i < path.length; i += 1) {
    const target = pool[i] ?? new Vector3();
    pool[i] = target;
    target.set(gridToWorldX(path[i].x, gridSize), 0, gridToWorldZ(path[i].y, gridSize));
    spine.push(target);
  }
  return spine;
}

/** Thick through the middle, pinched at the neck, tapering to a fine tail. */
export function bodyRadius(u: number, cell: number): number {
  const swell = 1 + 0.12 * Math.sin(Math.min(u, 0.5) * Math.PI);
  const taper = 1 - 0.8 * smoothstep(0.58, 1, u);
  return cell * BODY_RADIUS_RATIO * swell * taper;
}

export interface SlitherOffset {
  lateral: number;
  lift: number;
}

/** Lateral slither plus the small vertical ripple of a body pushing off ground. */
export function slitherOffset(u: number, time: number, cell: number): SlitherOffset {
  const phase = u * UNDULATION_WAVES * TAU - time * UNDULATION_SPEED;
  const lock = smoothstep(0, HEAD_LOCK_SPAN, u);
  return {
    lateral: Math.sin(phase) * UNDULATION_AMPLITUDE * cell * lock,
    lift: Math.sin(phase + Math.PI / 2) * 0.05 * cell * lock,
  };
}

/**
 * Saddle banding along the body. The band frequency scales with length so the
 * pattern keeps a constant physical size as the snake grows.
 */
export function writeBandColor(target: Color, u: number, segments: number, deadMix: number): Color {
  const frequency = Math.max(2.5, segments * 0.17);
  const wave = Math.sin(u * frequency * TAU);
  const mix = wave > 0.25 ? 1 : wave < -0.25 ? 0 : (wave + 0.25) / 0.5;

  target.copy(COLOR_SCALE_DARK).lerp(COLOR_SCALE_LIGHT, mix);
  // Tail end reads a touch darker, like a real animal's dorsal gradient.
  target.multiplyScalar(1 - 0.28 * smoothstep(0.6, 1, u));
  if (deadMix > 0) target.lerp(COLOR_DEAD, deadMix);
  return target;
}
