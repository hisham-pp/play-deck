import type { SeatColor } from '../engine/elevator-constants';

export interface ElevatorPalette {
  shaftBack: string;
  shaftWall: string;
  shaftRail: string;
  shaftLine: string;
  floorMarker: string;
  platformDeck: string;
  platformEdge: string;
  platformStripe: string;
  cable: string;
  clawFrame: string;
  cargoOutline: string;
  /** Multiplier on every cargo fill, so high contrast can flatten the shading. */
  cargoShade: number;
  ghost: string;
  warning: string;
  dust: string;
  text: string;
}

const STANDARD: ElevatorPalette = {
  shaftBack: '#0a0f1a',
  shaftWall: '#161f33',
  shaftRail: '#233049',
  shaftLine: '#1d2941',
  floorMarker: '#f59e0b',
  platformDeck: '#3f4d66',
  platformEdge: '#8d9bb5',
  platformStripe: '#f59e0b',
  cable: '#64748b',
  clawFrame: '#94a3b8',
  cargoOutline: '#0b1220',
  cargoShade: 1,
  ghost: 'rgba(245, 158, 11, 0.32)',
  warning: '#ef4444',
  dust: 'rgba(226, 232, 240, 0.5)',
  text: '#e2e8f0',
};

/** Flat fills, white outlines and no shading, for players who need the contrast. */
const HIGH_CONTRAST: ElevatorPalette = {
  ...STANDARD,
  shaftBack: '#000000',
  shaftWall: '#0b0b0b',
  shaftRail: '#ffffff',
  shaftLine: '#3f3f3f',
  floorMarker: '#ffe14d',
  platformDeck: '#1f1f1f',
  platformEdge: '#ffffff',
  platformStripe: '#ffe14d',
  cable: '#ffffff',
  clawFrame: '#ffffff',
  cargoOutline: '#ffffff',
  cargoShade: 1.35,
  ghost: 'rgba(255, 225, 77, 0.55)',
  warning: '#ff5d5d',
  dust: 'rgba(255, 255, 255, 0.75)',
  text: '#ffffff',
};

export function elevatorPalette(highContrast: boolean): ElevatorPalette {
  return highContrast ? HIGH_CONTRAST : STANDARD;
}

/** Rim colour drawn around cargo, so you can see whose crate is about to go. */
export const SEAT_HEX: Record<SeatColor, string> = {
  amber: '#f59e0b',
  sky: '#38bdf8',
  emerald: '#34d399',
  rose: '#fb7185',
};

/** Lighter or darker variant of a hex colour, for cheap face shading. */
export function shade(hex: string, amount: number): string {
  const value = hex.replace('#', '');
  const channel = (offset: number) => {
    const base = parseInt(value.slice(offset, offset + 2), 16);
    return Math.max(0, Math.min(255, Math.round(base * amount)));
  };
  return `rgb(${channel(0)}, ${channel(2)}, ${channel(4)})`;
}
