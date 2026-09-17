export const GRID_SIZE = 4;
export const WINNING_VALUE = 2048;
export const SPAWN_PROBABILITY_4 = 0.1;
export const MAX_UNDO_STEPS = 20;

export interface TileStyleConfig {
  bg: string;
  text: string;
  glow?: string;
  border?: string;
  fontSize?: string;
}

const TEXT_WHITE_BOLD = 'text-white font-bold';
const TEXT_DECK_BLACK = 'text-deck-950 font-black';

export const TILE_STYLES: Record<number, TileStyleConfig> = {
  2: {
    bg: 'bg-deck-800/90 text-deck-100 border-deck-700/50',
    text: 'text-deck-100',
    border: 'border border-deck-700/60',
  },
  4: {
    bg: 'bg-amber-950/40 text-amber-200 border-amber-800/40',
    text: 'text-amber-200',
    border: 'border border-amber-700/50',
  },
  8: {
    bg: 'bg-orange-600 text-white shadow-md shadow-orange-950/50',
    text: TEXT_WHITE_BOLD,
    glow: 'shadow-[0_0_12px_rgba(234,88,12,0.4)]',
  },
  16: {
    bg: 'bg-amber-600 text-white shadow-md shadow-amber-950/50',
    text: TEXT_WHITE_BOLD,
    glow: 'shadow-[0_0_14px_rgba(217,119,6,0.45)]',
  },
  32: {
    bg: 'bg-rose-600 text-white shadow-md shadow-rose-950/50',
    text: TEXT_WHITE_BOLD,
    glow: 'shadow-[0_0_16px_rgba(225,29,72,0.5)]',
  },
  64: {
    bg: 'bg-red-600 text-white shadow-md shadow-red-950/50',
    text: TEXT_WHITE_BOLD,
    glow: 'shadow-[0_0_18px_rgba(220,38,38,0.55)]',
  },
  128: {
    bg: 'bg-yellow-500 text-deck-950 font-black',
    text: TEXT_DECK_BLACK,
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
    fontSize: 'text-2xl sm:text-3xl',
  },
  256: {
    bg: 'bg-amber-400 text-deck-950 font-black',
    text: TEXT_DECK_BLACK,
    glow: 'shadow-[0_0_22px_rgba(251,191,36,0.7)]',
    fontSize: 'text-2xl sm:text-3xl',
  },
  512: {
    bg: 'bg-emerald-500 text-deck-950 font-black',
    text: TEXT_DECK_BLACK,
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.7)]',
    fontSize: 'text-2xl sm:text-3xl',
  },
  1024: {
    bg: 'bg-cyan-500 text-deck-950 font-black',
    text: TEXT_DECK_BLACK,
    glow: 'shadow-[0_0_26px_rgba(6,182,212,0.8)]',
    fontSize: 'text-xl sm:text-2xl',
  },
  2048: {
    bg: 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-deck-950 font-black',
    text: TEXT_DECK_BLACK,
    glow: 'shadow-[0_0_32px_rgba(245,158,11,0.9)] ring-2 ring-amber-300',
    fontSize: 'text-xl sm:text-2xl',
  },
  4096: {
    bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white font-black',
    text: 'text-white font-black',
    glow: 'shadow-[0_0_32px_rgba(217,70,239,0.9)] ring-2 ring-purple-300',
    fontSize: 'text-lg sm:text-xl',
  },
  8192: {
    bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white font-black',
    text: 'text-white font-black',
    glow: 'shadow-[0_0_36px_rgba(99,102,241,0.95)] ring-2 ring-indigo-300',
    fontSize: 'text-lg sm:text-xl',
  },
};

export const DEFAULT_SUPER_TILE_STYLE: TileStyleConfig = {
  bg: 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-deck-950 text-white font-black',
  text: 'text-white font-black',
  glow: 'shadow-[0_0_40px_rgba(192,38,211,1)] ring-2 ring-fuchsia-300',
  fontSize: 'text-base sm:text-lg',
};
