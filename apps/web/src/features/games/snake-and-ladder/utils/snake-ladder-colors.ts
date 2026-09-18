import type { SnakeLadderColor } from '../types/snake-and-ladder.types';

export interface SeatColorTheme {
  label: string;
  /** Non-color identifier, so seats stay distinguishable without relying on hue. */
  symbol: string;
  hex: string;
  /** Darker rim, for contrast against the board's light squares. */
  rimHex: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
}

export const SEAT_COLOR_THEMES: Record<SnakeLadderColor, SeatColorTheme> = {
  red: {
    label: 'Red',
    symbol: '▲',
    hex: '#ef4444',
    rimHex: '#7f1d1d',
    tailwindBg: 'bg-red-500',
    tailwindText: 'text-red-400',
    tailwindBorder: 'border-red-500',
  },
  green: {
    label: 'Green',
    symbol: '●',
    hex: '#22c55e',
    rimHex: '#14532d',
    tailwindBg: 'bg-emerald-500',
    tailwindText: 'text-emerald-400',
    tailwindBorder: 'border-emerald-500',
  },
  yellow: {
    label: 'Yellow',
    symbol: '■',
    hex: '#eab308',
    rimHex: '#713f12',
    tailwindBg: 'bg-yellow-500',
    tailwindText: 'text-yellow-400',
    tailwindBorder: 'border-yellow-500',
  },
  blue: {
    label: 'Blue',
    symbol: '◆',
    hex: '#3b82f6',
    rimHex: '#1e3a8a',
    tailwindBg: 'bg-blue-500',
    tailwindText: 'text-blue-400',
    tailwindBorder: 'border-blue-500',
  },
};

export function seatColorTheme(color: SnakeLadderColor): SeatColorTheme {
  return SEAT_COLOR_THEMES[color];
}
