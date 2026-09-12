import type { LudoColor } from '../types/ludo.types';

export interface LudoColorTheme {
  label: string;
  /** Non-color identifier so colorblind players can still tell seats apart. */
  symbol: string;
  hex: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
}

export const LUDO_COLOR_THEMES: Record<LudoColor, LudoColorTheme> = {
  red: {
    label: 'Red',
    symbol: '▲',
    hex: '#ef4444',
    tailwindBg: 'bg-red-500',
    tailwindText: 'text-red-500',
    tailwindBorder: 'border-red-500',
  },
  green: {
    label: 'Green',
    symbol: '●',
    hex: '#22c55e',
    tailwindBg: 'bg-emerald-500',
    tailwindText: 'text-emerald-500',
    tailwindBorder: 'border-emerald-500',
  },
  yellow: {
    label: 'Yellow',
    symbol: '■',
    hex: '#eab308',
    tailwindBg: 'bg-yellow-500',
    tailwindText: 'text-yellow-500',
    tailwindBorder: 'border-yellow-500',
  },
  blue: {
    label: 'Blue',
    symbol: '◆',
    hex: '#3b82f6',
    tailwindBg: 'bg-blue-500',
    tailwindText: 'text-blue-500',
    tailwindBorder: 'border-blue-500',
  },
  purple: {
    label: 'Purple',
    symbol: '★',
    hex: '#a855f7',
    tailwindBg: 'bg-purple-500',
    tailwindText: 'text-purple-500',
    tailwindBorder: 'border-purple-500',
  },
  cyan: {
    label: 'Cyan',
    symbol: '✚',
    hex: '#06b6d4',
    tailwindBg: 'bg-cyan-500',
    tailwindText: 'text-cyan-500',
    tailwindBorder: 'border-cyan-500',
  },
};

export function ludoColorTheme(color: LudoColor): LudoColorTheme {
  return LUDO_COLOR_THEMES[color];
}
