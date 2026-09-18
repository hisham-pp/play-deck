import type { ColorThiefColor } from '../types/color-thief.types';

export interface PaintTheme {
  label: string;
  /** Non-colour identifier, so seats stay apart for anyone who cannot use hue. */
  glyph: string;
  /** Fill for a tile this seat owns. */
  hex: string;
  /** Darker rim, for the tile border and for text on a pale surface. */
  rimHex: string;
  /** Flat, maximum-contrast fill used when high contrast is on. */
  contrastHex: string;
  tailwindText: string;
}

export const PAINT_THEMES: Record<ColorThiefColor, PaintTheme> = {
  red: {
    label: 'Crimson',
    glyph: '▲',
    hex: '#ef4444',
    rimHex: '#7f1d1d',
    contrastHex: '#b91c1c',
    tailwindText: 'text-red-400',
  },
  blue: {
    label: 'Cobalt',
    glyph: '◆',
    hex: '#3b82f6',
    rimHex: '#1e3a8a',
    contrastHex: '#1d4ed8',
    tailwindText: 'text-blue-400',
  },
  green: {
    label: 'Viridian',
    glyph: '●',
    hex: '#22c55e',
    rimHex: '#14532d',
    contrastHex: '#15803d',
    tailwindText: 'text-emerald-400',
  },
  yellow: {
    label: 'Ochre',
    glyph: '■',
    hex: '#eab308',
    rimHex: '#713f12',
    contrastHex: '#a16207',
    tailwindText: 'text-yellow-400',
  },
  purple: {
    label: 'Violet',
    glyph: '✚',
    hex: '#a855f7',
    rimHex: '#4c1d95',
    contrastHex: '#7e22ce',
    tailwindText: 'text-purple-400',
  },
  orange: {
    label: 'Amber',
    glyph: '★',
    hex: '#f97316',
    rimHex: '#7c2d12',
    contrastHex: '#c2410c',
    tailwindText: 'text-orange-400',
  },
};

export function paintTheme(color: ColorThiefColor): PaintTheme {
  return PAINT_THEMES[color];
}

/** Tile fill for an owner, or the neutral canvas when nobody holds it. */
export function tileFill(
  color: ColorThiefColor | null,
  highContrast: boolean,
  frozen: boolean,
): string {
  if (!color) return frozen ? '#1e293b' : '#111827';
  const theme = paintTheme(color);
  return highContrast ? theme.contrastHex : theme.hex;
}
