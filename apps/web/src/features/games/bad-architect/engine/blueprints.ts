import type { BlockColor, Blueprint, Grid8x8 } from '../types/bad-architect.types';

const R: BlockColor = '#ef4444'; // Red
const B: BlockColor = '#3b82f6'; // Blue
const G: BlockColor = '#10b981'; // Green
const Y: BlockColor = '#f59e0b'; // Amber / Yellow
const P: BlockColor = '#8b5cf6'; // Purple
const K: BlockColor = '#ec4899'; // Pink
const C: BlockColor = '#06b6d4'; // Cyan
const W: BlockColor = '#f8fafc'; // White
const _: BlockColor = null;

export function createEmptyGrid(): Grid8x8 {
  return Array.from({ length: 8 }, () => Array(8).fill(null) as BlockColor[]);
}

export const BLUEPRINTS: Blueprint[] = [
  {
    id: 'house',
    name: 'Cozy Cottage',
    difficulty: 'easy',
    colorPalette: [R, Y, B],
    descriptionHints: [
      'Red triangular roof in rows 1 to 3',
      'Yellow square body in rows 4 to 6',
      'Blue front door at bottom center (row 6, cols 3-4)',
    ],
    grid: [
      [_, _, _, R, R, _, _, _],
      [_, _, R, R, R, R, _, _],
      [_, R, R, R, R, R, R, _],
      [_, Y, Y, Y, Y, Y, Y, _],
      [_, Y, B, Y, Y, B, Y, _],
      [_, Y, B, Y, Y, B, Y, _],
      [_, Y, Y, B, B, Y, Y, _],
      [_, _, _, _, _, _, _, _],
    ],
  },
  {
    id: 'duck',
    name: 'Rubber Duckie',
    difficulty: 'easy',
    colorPalette: [Y, R, B],
    descriptionHints: [
      'Amber beak sticking out to the left',
      'Yellow rounded duck head and chunky body',
      'Blue lake water at the very bottom',
    ],
    grid: [
      [_, _, _, Y, Y, _, _, _],
      [_, R, Y, Y, W, _, _, _],
      [_, _, Y, Y, Y, _, _, _],
      [_, Y, Y, Y, Y, Y, _, _],
      [Y, Y, Y, Y, Y, Y, Y, _],
      [_, Y, Y, Y, Y, Y, _, _],
      [B, B, B, B, B, B, B, B],
      [_, _, _, _, _, _, _, _],
    ],
  },
  {
    id: 'heart',
    name: 'Pixel Heart',
    difficulty: 'easy',
    colorPalette: [R, K],
    descriptionHints: [
      'Twin rounded top arches in row 2',
      'Solid bright red center filling rows 3 to 5',
      'Tapers down to a sharp point at the bottom center',
    ],
    grid: [
      [_, _, _, _, _, _, _, _],
      [_, R, R, _, _, R, R, _],
      [R, K, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
      [_, R, R, R, R, R, R, _],
      [_, _, R, R, R, R, _, _],
      [_, _, _, R, R, _, _, _],
      [_, _, _, _, _, _, _, _],
    ],
  },
  {
    id: 'sword',
    name: 'Knight Blade',
    difficulty: 'easy',
    colorPalette: [C, Y, P],
    descriptionHints: [
      'Diagonal or vertical blade of glowing cyan',
      'Amber crossguard across row 5',
      'Purple pommel at bottom center',
    ],
    grid: [
      [_, _, _, C, C, _, _, _],
      [_, _, _, C, C, _, _, _],
      [_, _, _, C, C, _, _, _],
      [_, _, _, C, C, _, _, _],
      [_, Y, Y, Y, Y, Y, Y, _],
      [_, _, _, P, P, _, _, _],
      [_, _, _, P, P, _, _, _],
      [_, _, _, Y, Y, _, _, _],
    ],
  },
  {
    id: 'tree',
    name: 'Forest Pine',
    difficulty: 'easy',
    colorPalette: [G, Y],
    descriptionHints: [
      'Layered green triangle canopy',
      'Widest green branches in row 5',
      'Two-column wooden trunk at the bottom',
    ],
    grid: [
      [_, _, _, G, G, _, _, _],
      [_, _, G, G, G, G, _, _],
      [_, G, G, G, G, G, G, _],
      [_, _, G, G, G, G, _, _],
      [G, G, G, G, G, G, G, G],
      [_, _, _, Y, Y, _, _, _],
      [_, _, _, Y, Y, _, _, _],
      [_, _, _, Y, Y, _, _, _],
    ],
  },
  {
    id: 'rocket',
    name: 'Cosmic Rocket',
    difficulty: 'medium',
    colorPalette: [R, W, B, Y],
    descriptionHints: [
      'Red pointed nosecone at top',
      'White spaceship hull with cyan porthole window',
      'Red side stabilizer fins',
      'Flaring orange-yellow rocket plume at bottom',
    ],
    grid: [
      [_, _, _, R, R, _, _, _],
      [_, _, R, W, W, R, _, _],
      [_, _, W, C, C, W, _, _],
      [_, _, W, W, W, W, _, _],
      [_, R, W, W, W, W, R, _],
      [R, R, W, W, W, W, R, R],
      [_, _, _, Y, Y, _, _, _],
      [_, _, Y, R, R, Y, _, _],
    ],
  },
  {
    id: 'robot',
    name: 'Retro Bot',
    difficulty: 'medium',
    colorPalette: [C, Y, R, W],
    descriptionHints: [
      'Single yellow antenna beacon on top row',
      'Square cyan robot head with red blinking eyes',
      'Broad torso with yellow control meter buttons',
    ],
    grid: [
      [_, _, _, Y, Y, _, _, _],
      [_, _, _, C, C, _, _, _],
      [_, C, C, C, C, C, C, _],
      [_, C, R, C, C, R, C, _],
      [_, C, C, W, W, C, C, _],
      [_, C, C, C, C, C, C, _],
      [C, C, Y, Y, Y, Y, C, C],
      [_, C, _, _, _, _, C, _],
    ],
  },
  {
    id: 'crown',
    name: 'Royal Diadem',
    difficulty: 'medium',
    colorPalette: [Y, R, C, P],
    descriptionHints: [
      'Three golden spikes on row 2, center is tallest',
      'Jewels of ruby red and sapphire cyan on tips',
      'Solid golden band across rows 4 and 5',
    ],
    grid: [
      [_, _, _, _, _, _, _, _],
      [_, R, _, _, C, _, _, P],
      [_, Y, _, Y, Y, _, Y, Y],
      [_, Y, Y, Y, Y, Y, Y, Y],
      [_, Y, Y, Y, Y, Y, Y, Y],
      [_, Y, R, Y, C, Y, P, Y],
      [_, Y, Y, Y, Y, Y, Y, Y],
      [_, _, _, _, _, _, _, _],
    ],
  },
  {
    id: 'castle',
    name: 'Stone Bastion',
    difficulty: 'hard',
    colorPalette: [B, R, Y, W],
    descriptionHints: [
      'Twin lookout towers with red crenelated battlements',
      'Central connecting stone wall',
      'Arched castle gateway opening at the bottom',
    ],
    grid: [
      [R, _, _, _, _, _, _, R],
      [B, _, B, _, _, B, _, B],
      [B, B, B, _, _, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, W, B, B, B, B, W, B],
      [B, B, B, B, B, B, B, B],
      [B, B, Y, _, _, Y, B, B],
      [B, B, Y, _, _, Y, B, B],
    ],
  },
  {
    id: 'alien',
    name: 'Area 51 Visitor',
    difficulty: 'hard',
    colorPalette: [G, P, W],
    descriptionHints: [
      'Twin purple antennae curling outward',
      'Bulbous green extraterrestrial cranium',
      'Huge slanted black/purple almond eyes',
      'Narrow pointy chin at row 6',
    ],
    grid: [
      [P, _, _, _, _, _, _, P],
      [_, P, G, G, G, G, P, _],
      [G, G, G, G, G, G, G, G],
      [G, P, P, G, G, P, P, G],
      [G, P, W, G, G, W, P, G],
      [_, G, G, G, G, G, G, _],
      [_, _, G, G, G, G, _, _],
      [_, _, _, G, G, _, _, _],
    ],
  },
];

export function getRandomBlueprint(difficulty?: string): Blueprint {
  const pool = difficulty ? BLUEPRINTS.filter((b) => b.difficulty === difficulty) : BLUEPRINTS;
  const list = pool.length > 0 ? pool : BLUEPRINTS;
  return list[Math.floor(Math.random() * list.length)]!;
}
