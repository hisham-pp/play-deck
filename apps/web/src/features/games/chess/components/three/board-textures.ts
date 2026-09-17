import { CanvasTexture, LinearFilter, type Texture } from 'three';

const LABEL_SIZE = 128;
const LABEL_COLOR = '#d8c49a';
const LABEL_FONT = `bold ${Math.round(LABEL_SIZE * 0.68)}px "Segoe UI", system-ui, sans-serif`;

const cache = new Map<string, Texture>();

/**
 * Draws a single file letter or rank number to a texture for the board frame.
 *
 * Labels are painted rather than typeset in 3D so the board needs no font
 * asset, and cached because the same sixteen glyphs are used every render.
 */
export function labelTexture(character: string): Texture | null {
  const cached = cache.get(character);
  if (cached) return cached;

  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = LABEL_SIZE;
  canvas.height = LABEL_SIZE;

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.clearRect(0, 0, LABEL_SIZE, LABEL_SIZE);
  context.fillStyle = LABEL_COLOR;
  context.font = LABEL_FONT;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(character, LABEL_SIZE / 2, LABEL_SIZE / 2 + LABEL_SIZE * 0.04);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  cache.set(character, texture);
  return texture;
}
