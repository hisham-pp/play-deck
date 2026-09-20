import type { GridCoord, KingdomPlayer, ResourceCard } from '../types/kingdom-draft.types';
import { calculateTileSynergy, GRID_SIZE } from './kingdom-engine';

export type KingdomBotArchetype = 'warlord' | 'philosopher' | 'merchant' | 'agrarian';

export const BOT_ARCHETYPES: KingdomBotArchetype[] = [
  'warlord',
  'philosopher',
  'merchant',
  'agrarian',
];

export function chooseBotDraftCard(bot: KingdomPlayer, pool: ResourceCard[]): ResourceCard | null {
  if (pool.length === 0) return null;

  const targetCategory = bot.secretObjective?.targetCategory;

  let bestCard = pool[0]!;
  let bestScore = -Infinity;

  for (const card of pool) {
    let score = card.basePoints;

    if (targetCategory && card.category === targetCategory) {
      score += 6;
    }

    if (card.isRare) {
      score += 3;
    }

    // Check synergy potential with placed cards
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const placed = bot.grid[r]?.[c];
        if (placed && placed.synergyPartnerCategory === card.category) {
          score += placed.synergyBonus;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCard = card;
    }
  }

  return bestCard;
}

export function chooseBotGridPlacement(bot: KingdomPlayer, card: ResourceCard): GridCoord | null {
  const vacantCells: GridCoord[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (bot.grid[r]?.[c] === null) {
        vacantCells.push({ row: r, col: c });
      }
    }
  }

  if (vacantCells.length === 0) return null;

  let bestCoord = vacantCells[0]!;
  let maxSynergyGain = -Infinity;

  for (const cell of vacantCells) {
    // Clone grid
    const tempGrid = bot.grid.map((row) => [...row]);
    tempGrid[cell.row]![cell.col] = card;

    const synergyHere = calculateTileSynergy(tempGrid, cell.row, cell.col);
    if (synergyHere > maxSynergyGain) {
      maxSynergyGain = synergyHere;
      bestCoord = cell;
    }
  }

  return bestCoord;
}

const BOT_QUIPS: Record<KingdomBotArchetype, string[]> = {
  warlord: [
    'A fortress on the border is worth ten diplomats.',
    'My ramparts will withstand any siege!',
    'Steel and stone form the bedrock of this realm.',
  ],
  philosopher: [
    'The library shall preserve wisdom for the ages.',
    'Culture elevates the kingdom above mere survival.',
    'A theater by the town square inspires the people.',
  ],
  merchant: [
    'Every road leads to the market square.',
    'A full treasury guarantees peace and prosperity.',
    'Trade routes are the true arteries of empire.',
  ],
  agrarian: [
    'Plentiful harvests feed an industrious realm.',
    'Farms along the river yield bountiful grain.',
    'Work the land, and the kingdom will flourish.',
  ],
};

export function getKingdomBotQuip(archetype: KingdomBotArchetype): string {
  const lines = BOT_QUIPS[archetype] ?? BOT_QUIPS.warlord;
  return lines[Math.floor(Math.random() * lines.length)]!;
}
