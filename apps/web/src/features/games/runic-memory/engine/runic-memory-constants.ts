import type { DifficultyLevel, GridConfig, RuneDefinition } from '../types/runic-memory.types';

export const MODE_SOLO = 'solo';
export const MODE_AI = 'ai';
export const MODE_PASS_AND_PLAY = 'pass-and-play';
export const MODE_MULTIPLAYER = 'multiplayer';

export const STATUS_IDLE = 'idle';
export const STATUS_PLAYING = 'playing';
export const STATUS_CHECKING = 'checking';
export const STATUS_COMPLETED = 'completed';
export const STATUS_PAUSED = 'paused';

export const PLAYER_1 = 'P1';
export const PLAYER_2 = 'P2';

/**
 * 18 Elder Futhark Runes with sacred glyphs, elemental affinities,
 * color harmonies, and resonant harmonic frequencies for Web Audio synthesis.
 */
export const RUNES: RuneDefinition[] = [
  {
    id: 'fehu',
    name: 'Fehu',
    glyph: 'ᚠ',
    meaning: 'Wealth & Radiant Flame',
    element: 'fire',
    primaryColor: '#f97316',
    secondaryColor: '#ea580c',
    frequency: 261.63, // C4
  },
  {
    id: 'uruz',
    name: 'Uruz',
    glyph: 'ᚢ',
    meaning: 'Primal Strength & Endurance',
    element: 'earth',
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    frequency: 293.66, // D4
  },
  {
    id: 'thurisaz',
    name: 'Thurisaz',
    glyph: 'ᚦ',
    meaning: 'Thunder & Gatekeeper Thorn',
    element: 'storm',
    primaryColor: '#ef4444',
    secondaryColor: '#dc2626',
    frequency: 329.63, // E4
  },
  {
    id: 'ansuz',
    name: 'Ansuz',
    glyph: 'ᚨ',
    meaning: 'Divine Wisdom & Inspiration',
    element: 'celestial',
    primaryColor: '#38bdf8',
    secondaryColor: '#0284c7',
    frequency: 349.23, // F4
  },
  {
    id: 'raidho',
    name: 'Raidho',
    glyph: 'ᚱ',
    meaning: 'Cosmic Journey & Alignment',
    element: 'solar',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    frequency: 392.0, // G4
  },
  {
    id: 'kenaz',
    name: 'Kenaz',
    glyph: 'ᚲ',
    meaning: 'Beacon Torch & Creativity',
    element: 'fire',
    primaryColor: '#fb923c',
    secondaryColor: '#f97316',
    frequency: 440.0, // A4
  },
  {
    id: 'gebo',
    name: 'Gebo',
    glyph: 'ᚷ',
    meaning: 'Sacred Gift & Harmony',
    element: 'earth',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    frequency: 493.88, // B4
  },
  {
    id: 'wunjo',
    name: 'Wunjo',
    glyph: 'ᚹ',
    meaning: 'Joy, Fellowship & Light',
    element: 'solar',
    primaryColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    frequency: 523.25, // C5
  },
  {
    id: 'hagalaz',
    name: 'Hagalaz',
    glyph: 'ᚺ',
    meaning: 'Hailstorm & Transformation',
    element: 'storm',
    primaryColor: '#60a5fa',
    secondaryColor: '#2563eb',
    frequency: 587.33, // D5
  },
  {
    id: 'nauthiz',
    name: 'Nauthiz',
    glyph: 'ᚾ',
    meaning: 'Need, Fire Friction & Destiny',
    element: 'fire',
    primaryColor: '#f43f5e',
    secondaryColor: '#e11d48',
    frequency: 659.25, // E5
  },
  {
    id: 'isa',
    name: 'Isa',
    glyph: 'ᛁ',
    meaning: 'Stillness, Glacier & Clarity',
    element: 'ice',
    primaryColor: '#a5f3fc',
    secondaryColor: '#06b6d4',
    frequency: 698.46, // F5
  },
  {
    id: 'jera',
    name: 'Jera',
    glyph: 'ᛃ',
    meaning: 'Abundant Harvest & Cycles',
    element: 'earth',
    primaryColor: '#84cc16',
    secondaryColor: '#65a30d',
    frequency: 783.99, // G5
  },
  {
    id: 'eihwaz',
    name: 'Eihwaz',
    glyph: 'ᛇ',
    meaning: 'World Tree Yggdrasil & Resilience',
    element: 'celestial',
    primaryColor: '#a855f7',
    secondaryColor: '#7e22ce',
    frequency: 880.0, // A5
  },
  {
    id: 'perthro',
    name: 'Perthro',
    glyph: 'ᛈ',
    meaning: 'Mystery, Fate & Divination Cup',
    element: 'celestial',
    primaryColor: '#c084fc',
    secondaryColor: '#9333ea',
    frequency: 987.77, // B5
  },
  {
    id: 'algiz',
    name: 'Algiz',
    glyph: 'ᛉ',
    meaning: 'Elk Horns & Sanctuary Shield',
    element: 'celestial',
    primaryColor: '#2dd4bf',
    secondaryColor: '#0d9488',
    frequency: 1046.5, // C6
  },
  {
    id: 'sowilo',
    name: 'Sowilo',
    glyph: 'ᛊ',
    meaning: 'Solar Disk & Victory Radiance',
    element: 'solar',
    primaryColor: '#fde047',
    secondaryColor: '#eab308',
    frequency: 1174.66, // D6
  },
  {
    id: 'tiwaz',
    name: 'Tiwaz',
    glyph: 'ᛏ',
    meaning: 'Justice, Honor & North Star',
    element: 'solar',
    primaryColor: '#38bdf8',
    secondaryColor: '#0284c7',
    frequency: 1318.51, // E6
  },
  {
    id: 'berkana',
    name: 'Berkana',
    glyph: 'ᛒ',
    meaning: 'Birch Maiden & Rebirth',
    element: 'earth',
    primaryColor: '#4ade80',
    secondaryColor: '#16a34a',
    frequency: 1396.91, // F6
  },
];

export const GRID_CONFIGS: Record<DifficultyLevel, GridConfig> = {
  novice: {
    level: 'novice',
    label: 'Novice (4 × 3)',
    columns: 4,
    rows: 3,
    totalCards: 12,
    pairsCount: 6,
    timeTargetSeconds: 45,
    turnTarget: 12,
  },
  apprentice: {
    level: 'apprentice',
    label: 'Apprentice (4 × 4)',
    columns: 4,
    rows: 4,
    totalCards: 16,
    pairsCount: 8,
    timeTargetSeconds: 70,
    turnTarget: 18,
  },
  master: {
    level: 'master',
    label: 'Master (6 × 4)',
    columns: 6,
    rows: 4,
    totalCards: 24,
    pairsCount: 12,
    timeTargetSeconds: 120,
    turnTarget: 30,
  },
  elder: {
    level: 'elder',
    label: 'Elder Sage (6 × 6)',
    columns: 6,
    rows: 6,
    totalCards: 36,
    pairsCount: 18,
    timeTargetSeconds: 200,
    turnTarget: 50,
  },
};

export const FLIP_DELAY_MISMATCH_MS = 1000;
export const AI_THINK_DELAY_MS = 800;
export const MULTIPLAYER_SYNC_EVENT = 'RUNIC_ACTION';
