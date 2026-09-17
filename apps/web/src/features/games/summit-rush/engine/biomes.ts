/** Visual themes that cycle as the player drives further. Pure data. */
export interface Biome {
  name: string;
  skyTop: string;
  skyBottom: string;
  sun: string;
  cloud: string;
  far: string;
  mid: string;
  near: string;
  tree: string;
  trunk: string;
  grass: string;
  grassEdge: string;
  dirt: string;
  dirtDeep: string;
  rock: string;
  dust: string;
}

export const BIOMES: readonly Biome[] = [
  {
    name: 'Clover Meadows',
    skyTop: '#5ab8f0',
    skyBottom: '#c9ecff',
    sun: '#fff3b0',
    cloud: '#ffffff',
    far: '#9fc6e3',
    mid: '#6fb38a',
    near: '#4f9a6a',
    tree: '#2f7d4f',
    trunk: '#6b4a2f',
    grass: '#7ed957',
    grassEdge: '#4caf3a',
    dirt: '#b7794a',
    dirtDeep: '#7a4a2c',
    rock: '#8c6a50',
    dust: '#d9b98c',
  },
  {
    name: 'Sunset Canyon',
    skyTop: '#f58a5c',
    skyBottom: '#ffd79a',
    sun: '#fff0c2',
    cloud: '#ffe6d1',
    far: '#d98a6e',
    mid: '#c46a4b',
    near: '#a8553b',
    tree: '#5e8a3a',
    trunk: '#5b3a24',
    grass: '#f2b35b',
    grassEdge: '#d98b3a',
    dirt: '#c9683f',
    dirtDeep: '#8a3f22',
    rock: '#9c4f33',
    dust: '#f0c38d',
  },
  {
    name: 'Frostbite Ridge',
    skyTop: '#6f9fd8',
    skyBottom: '#e3f1ff',
    sun: '#ffffff',
    cloud: '#f4f9ff',
    far: '#b9cde6',
    mid: '#8fb0d1',
    near: '#6e93b8',
    tree: '#2f5f63',
    trunk: '#4a3a30',
    grass: '#f4fbff',
    grassEdge: '#bcd8ec',
    dirt: '#7f93a8',
    dirtDeep: '#4d5d70',
    rock: '#5f7389',
    dust: '#eef6ff',
  },
  {
    name: 'Moonlit Dunes',
    skyTop: '#1c2450',
    skyBottom: '#5a4c8c',
    sun: '#f4f1d0',
    cloud: '#8d86b8',
    far: '#3d3a6e',
    mid: '#4a3f73',
    near: '#3b3160',
    tree: '#2e5a4f',
    trunk: '#3a2c2a',
    grass: '#e0c27a',
    grassEdge: '#b8964f',
    dirt: '#8f6a45',
    dirtDeep: '#5a3f2a',
    rock: '#6a5040',
    dust: '#d8c08c',
  },
];

export const BIOME_LENGTH = 900;
const BLEND_LENGTH = 80;

type Rgb = [number, number, number];
const rgbCache = new Map<string, Rgb>();

function hexToRgb(hex: string): Rgb {
  let rgb = rgbCache.get(hex);
  if (!rgb) {
    const n = parseInt(hex.slice(1), 16);
    rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, rgb);
  }
  return rgb;
}

function mixColor(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

export function biomeIndexAt(distance: number): number {
  return Math.floor(Math.max(0, distance) / BIOME_LENGTH) % BIOMES.length;
}

/** Palette at a distance, blending smoothly into the next biome. */
export function paletteAt(distance: number): Biome {
  const d = Math.max(0, distance);
  const index = Math.floor(d / BIOME_LENGTH);
  const from = BIOMES[index % BIOMES.length];
  const into = (index + 1) * BIOME_LENGTH - d;
  if (into > BLEND_LENGTH) return from;
  const to = BIOMES[(index + 1) % BIOMES.length];
  const t = 1 - into / BLEND_LENGTH;
  const mixed = { ...from };
  for (const key of Object.keys(from) as (keyof Biome)[]) {
    if (key !== 'name') mixed[key] = mixColor(from[key], to[key], t);
  }
  return mixed;
}
