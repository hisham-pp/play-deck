import { CanvasTexture, SRGBColorSpace, type Texture } from 'three';

const TEXTURE_PX = 128;
const cache = new Map<string, Texture>();

/**
 * Draws the move-number badge that floats over a selectable piece. Painted on a
 * 2D canvas rather than loaded as a font so the label never waits on (or fails
 * with) a network font fetch mid-turn.
 */
function paint(label: string, accent: string): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_PX;
  canvas.height = TEXTURE_PX;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = TEXTURE_PX / 2;
    ctx.clearRect(0, 0, TEXTURE_PX, TEXTURE_PX);

    ctx.beginPath();
    ctx.arc(half, half, half - 6, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1120';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = accent;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = `900 ${TEXTURE_PX * 0.6}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, half, half + TEXTURE_PX * 0.04);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function numberBadgeTexture(value: number, accent: string): Texture {
  const key = `${value}:${accent}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const texture = paint(String(value), accent);
  cache.set(key, texture);
  return texture;
}
