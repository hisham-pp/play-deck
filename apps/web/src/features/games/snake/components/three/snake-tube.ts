import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Vector3 } from 'three';
import { bodyRadius, slitherOffset, writeBandColor } from './snake-body-geometry';
import { PALETTE } from './snake-scene-config';

/**
 * The snake body is one continuous tube skinned over the spline through the
 * engine path. The geometry is allocated once at full capacity and rewritten in
 * place every frame, so a growing snake never reallocates.
 */

export const MAX_RINGS = 900;
export const RADIAL_SEGMENTS = 12;

const VERTS_PER_RING = RADIAL_SEGMENTS + 1;
const UP = new Vector3(0, 1, 0);
/** Snakes are a touch wider than tall — a flat oval, not a circle. */
const CROSS_WIDTH = 1.08;
const CROSS_HEIGHT = 0.86;
/** One texture tile spans this many grid cells of body length. */
const CELLS_PER_TILE = 2;

const COLOR_BELLY = new Color(PALETTE.belly);

export function ringCountFor(segments: number): number {
  return Math.min(MAX_RINGS, Math.max(24, Math.ceil(segments * 3) + 1));
}

/** Allocates the full-capacity tube: positions, normals, uvs, colors, indices. */
export function createSnakeTubeGeometry(): BufferGeometry {
  const geometry = new BufferGeometry();
  const vertexCount = MAX_RINGS * VERTS_PER_RING;

  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertexCount * 3), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(vertexCount * 3), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(vertexCount * 2), 2));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(vertexCount * 3), 3));

  const indices = new Uint32Array((MAX_RINGS - 1) * RADIAL_SEGMENTS * 6);
  let cursor = 0;
  for (let ring = 0; ring < MAX_RINGS - 1; ring += 1) {
    for (let side = 0; side < RADIAL_SEGMENTS; side += 1) {
      const a = ring * VERTS_PER_RING + side;
      const b = a + VERTS_PER_RING;
      indices[cursor] = a;
      indices[cursor + 1] = b;
      indices[cursor + 2] = a + 1;
      indices[cursor + 3] = a + 1;
      indices[cursor + 4] = b;
      indices[cursor + 5] = b + 1;
      cursor += 6;
    }
  }
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.boundingSphere = null;
  return geometry;
}

export interface TubeScratch {
  curve: CatmullRomCurve3;
  samples: Vector3[];
  center: Vector3;
  tangent: Vector3;
  right: Vector3;
  up: Vector3;
  color: Color;
}

export function createTubeScratch(): TubeScratch {
  return {
    curve: new CatmullRomCurve3([new Vector3(), new Vector3()], false, 'catmullrom', 0.4),
    samples: Array.from({ length: MAX_RINGS }, () => new Vector3()),
    center: new Vector3(),
    tangent: new Vector3(),
    right: new Vector3(),
    up: new Vector3(),
    color: new Color(),
  };
}

/** Forward-facing tangent at sample `index`, by finite difference. */
function readTangent(scratch: TubeScratch, index: number, rings: number): Vector3 {
  const ahead = scratch.samples[Math.max(0, index - 1)];
  const behind = scratch.samples[Math.min(rings - 1, index + 1)];
  scratch.tangent.subVectors(ahead, behind);
  if (scratch.tangent.lengthSq() < 1e-9) scratch.tangent.set(0, 0, -1);
  return scratch.tangent.normalize();
}

export interface TubeFrame {
  spine: Vector3[];
  cell: number;
  time: number;
  sink: number;
  deadMix: number;
}

interface RingContext {
  ring: number;
  u: number;
  radius: number;
  segments: number;
}

function writeRing(
  geometry: BufferGeometry,
  scratch: TubeScratch,
  { ring, u, radius, segments }: RingContext,
  deadMix: number,
): void {
  const positions = geometry.attributes.position.array as Float32Array;
  const normals = geometry.attributes.normal.array as Float32Array;
  const uvs = geometry.attributes.uv.array as Float32Array;
  const colors = geometry.attributes.color.array as Float32Array;

  writeBandColor(scratch.color, u, segments, deadMix);
  const dorsalR = scratch.color.r;
  const dorsalG = scratch.color.g;
  const dorsalB = scratch.color.b;
  const alongTile = (u * segments) / CELLS_PER_TILE;

  for (let side = 0; side <= RADIAL_SEGMENTS; side += 1) {
    const angle = (side / RADIAL_SEGMENTS) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const nx = scratch.right.x * cos + scratch.up.x * sin;
    const ny = scratch.right.y * cos + scratch.up.y * sin;
    const nz = scratch.right.z * cos + scratch.up.z * sin;

    const base = (ring * VERTS_PER_RING + side) * 3;
    positions[base] =
      scratch.center.x +
      (scratch.right.x * cos * CROSS_WIDTH + scratch.up.x * sin * CROSS_HEIGHT) * radius;
    positions[base + 1] =
      scratch.center.y +
      (scratch.right.y * cos * CROSS_WIDTH + scratch.up.y * sin * CROSS_HEIGHT) * radius;
    positions[base + 2] =
      scratch.center.z +
      (scratch.right.z * cos * CROSS_WIDTH + scratch.up.z * sin * CROSS_HEIGHT) * radius;
    normals[base] = nx;
    normals[base + 1] = ny;
    normals[base + 2] = nz;

    // Pale belly fading into the dorsal banding around the flanks.
    const bellyMix = Math.max(0, Math.min(1, (-sin - 0.15) / 0.75));
    colors[base] = dorsalR + (COLOR_BELLY.r - dorsalR) * bellyMix;
    colors[base + 1] = dorsalG + (COLOR_BELLY.g - dorsalG) * bellyMix;
    colors[base + 2] = dorsalB + (COLOR_BELLY.b - dorsalB) * bellyMix;

    const uvBase = (ring * VERTS_PER_RING + side) * 2;
    uvs[uvBase] = alongTile;
    uvs[uvBase + 1] = side / RADIAL_SEGMENTS;
  }
}

/** Rewrites the whole tube for this frame and flags the buffers for upload. */
export function writeSnakeTube(
  geometry: BufferGeometry,
  scratch: TubeScratch,
  { spine, cell, time, sink, deadMix }: TubeFrame,
): void {
  const rings = ringCountFor(spine.length);
  scratch.curve.points = spine;
  for (let i = 0; i < rings; i += 1) {
    scratch.curve.getPoint(i / (rings - 1), scratch.samples[i]);
  }

  for (let ring = 0; ring < rings; ring += 1) {
    const u = ring / (rings - 1);
    const point = scratch.samples[ring];
    const tangent = readTangent(scratch, ring, rings);
    const radius = bodyRadius(u, cell);
    const wave = slitherOffset(u, time, cell);

    scratch.right.crossVectors(UP, tangent).normalize();
    scratch.up.crossVectors(tangent, scratch.right).normalize();
    scratch.center.set(
      point.x + scratch.right.x * wave.lateral,
      radius + wave.lift - sink,
      point.z + scratch.right.z * wave.lateral,
    );

    writeRing(geometry, scratch, { ring, u, radius, segments: spine.length }, deadMix);
  }

  geometry.setDrawRange(0, (rings - 1) * RADIAL_SEGMENTS * 6);
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.normal.needsUpdate = true;
  geometry.attributes.uv.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
}
