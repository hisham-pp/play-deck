import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

/**
 * Procedurally paints a wood-grain desk texture on an offscreen canvas.
 * Avoids shipping/downloading external image assets for the arena surface.
 */
export function createTableTexture(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(0, 0, size, size);

  const grainCount = 46;
  for (let i = 0; i < grainCount; i += 1) {
    const y =
      (i / grainCount) * size +
      (Math.sin(i * 12.9898) * 4321.2 - Math.floor(Math.sin(i * 12.9898) * 4321.2)) * 8;
    const shade = 0.82 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 0.18;
    ctx.strokeStyle = `rgba(${Math.floor(40 * shade)}, ${Math.floor(22 * shade)}, ${Math.floor(10 * shade)}, ${
      0.25 + (i % 5) * 0.05
    })`;
    ctx.lineWidth = 1.5 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 32) {
      const wobble = Math.sin(x * 0.02 + i) * 6 + Math.sin(x * 0.005 + i * 2) * 10;
      ctx.lineTo(x, y + wobble);
    }
    ctx.stroke();
  }

  // Center court line down the middle of the arena.
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(size / 2, 8);
  ctx.lineTo(size / 2, size - 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Subtle vignette toward the edges.
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.2,
    size / 2,
    size / 2,
    size * 0.72,
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
