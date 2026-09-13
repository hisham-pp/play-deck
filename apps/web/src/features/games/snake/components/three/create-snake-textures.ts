import { CanvasTexture, LinearSRGBColorSpace, RepeatWrapping, SRGBColorSpace } from 'three';

/**
 * Procedural texture bakery for the 3D snake arena. Everything is painted on
 * offscreen canvases at runtime so the game ships zero binary image assets.
 */

const SCALE_TEXTURE_SIZE = 512;
const FLOOR_TEXTURE_SIZE = 128;

function createCanvas(size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/** Deterministic value noise so textures look identical across reloads. */
function hashNoise(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Converts a grayscale height canvas into a tangent-space normal map using a
 * Sobel gradient. This is what gives the scales and the stone floor their
 * lit-from-the-side relief instead of looking like flat decals.
 */
function heightToNormalMap(height: HTMLCanvasElement, strength: number): CanvasTexture {
  const size = height.width;
  const heightCtx = height.getContext('2d');
  const normalCanvas = createCanvas(size);
  const normalCtx = normalCanvas.getContext('2d');
  if (!heightCtx || !normalCtx) return new CanvasTexture(normalCanvas);

  const src = heightCtx.getImageData(0, 0, size, size).data;
  const out = normalCtx.createImageData(size, size);

  const at = (x: number, y: number) => {
    const wx = (x + size) % size;
    const wy = (y + size) % size;
    return src[(wy * size + wx) * 4] / 255;
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx =
        at(x - 1, y - 1) +
        2 * at(x - 1, y) +
        at(x - 1, y + 1) -
        (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1));
      const dy =
        at(x - 1, y - 1) +
        2 * at(x, y - 1) +
        at(x + 1, y - 1) -
        (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1));

      let nx = dx * strength;
      let ny = dy * strength;
      const len = Math.hypot(nx, ny, 1) || 1;
      nx /= len;
      ny /= len;

      const idx = (y * size + x) * 4;
      out.data[idx] = (nx * 0.5 + 0.5) * 255;
      out.data[idx + 1] = (ny * 0.5 + 0.5) * 255;
      out.data[idx + 2] = (1 / len) * 0.5 * 255 + 127;
      out.data[idx + 3] = 255;
    }
  }

  normalCtx.putImageData(out, 0, 0);
  const texture = new CanvasTexture(normalCanvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = LinearSRGBColorSpace;
  return texture;
}

interface ScaleGridOptions {
  columns: number;
  rows: number;
}

function forEachScale(
  { columns, rows }: ScaleGridOptions,
  size: number,
  draw: (cx: number, cy: number, rx: number, ry: number, seed: number) => void,
) {
  const stepX = size / columns;
  const stepY = size / rows;
  // One extra ring of scales on every side so the tile wraps seamlessly.
  for (let row = -1; row <= rows; row += 1) {
    for (let col = -1; col <= columns; col += 1) {
      const offset = row % 2 === 0 ? 0 : stepX / 2;
      const cx = col * stepX + stepX / 2 + offset;
      const cy = row * stepY + stepY / 2;
      draw(cx, cy, stepX * 0.62, stepY * 0.72, hashNoise(col, row));
    }
  }
}

/**
 * Snake hide: a near-neutral colour map (so the per-segment banding colour can
 * tint it) paired with a normal map carrying the actual scale relief.
 */
export function createSnakeSkinTextures(): { map: CanvasTexture; normalMap: CanvasTexture } {
  const size = SCALE_TEXTURE_SIZE;
  const grid: ScaleGridOptions = { columns: 11, rows: 10 };

  const colorCanvas = createCanvas(size);
  const colorCtx = colorCanvas.getContext('2d');
  const heightCanvas = createCanvas(size);
  const heightCtx = heightCanvas.getContext('2d');

  if (!colorCtx || !heightCtx) {
    return {
      map: new CanvasTexture(colorCanvas),
      normalMap: new CanvasTexture(heightCanvas),
    };
  }

  colorCtx.fillStyle = '#dfe4da';
  colorCtx.fillRect(0, 0, size, size);
  heightCtx.fillStyle = '#3a3a3a';
  heightCtx.fillRect(0, 0, size, size);

  forEachScale(grid, size, (cx, cy, rx, ry, seed) => {
    // Colour: each scale gets its own slightly different value plus a dark rim.
    const shade = 0.78 + seed * 0.34;
    colorCtx.save();
    colorCtx.translate(cx, cy);
    const fill = colorCtx.createRadialGradient(0, -ry * 0.2, rx * 0.1, 0, 0, rx);
    fill.addColorStop(0, 'rgba(255, 255, 255, ' + 0.26 * shade + ')');
    fill.addColorStop(0.65, 'rgba(205, 215, 200, ' + 0.2 * shade + ')');
    fill.addColorStop(1, 'rgba(28, 38, 30, 0.22)');
    colorCtx.fillStyle = fill;
    colorCtx.beginPath();
    colorCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    colorCtx.fill();
    colorCtx.strokeStyle = 'rgba(14, 22, 16, 0.2)';
    colorCtx.lineWidth = 1.4;
    colorCtx.stroke();
    colorCtx.restore();

    // Height: a dome per scale so the Sobel pass reads a raised, rounded plate.
    heightCtx.save();
    heightCtx.translate(cx, cy);
    const dome = heightCtx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
    dome.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    dome.addColorStop(0.6, 'rgba(150, 150, 150, 0.75)');
    dome.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    heightCtx.fillStyle = dome;
    heightCtx.beginPath();
    heightCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    heightCtx.fill();
    heightCtx.restore();
  });

  const map = new CanvasTexture(colorCanvas);
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;

  return { map, normalMap: heightToNormalMap(heightCanvas, 1.8) };
}

/**
 * Plain board surface: one texture tile per grid cell, drawn as a flat dark
 * panel with a hairline seam so the play grid stays readable under the snake.
 */
export function createBoardTexture(): CanvasTexture {
  const size = FLOOR_TEXTURE_SIZE;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  ctx.fillStyle = '#0d1420';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(75, 96, 130, 0.32)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
