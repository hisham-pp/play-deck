import type {
  ArchitectPlayer,
  ArchitectVote,
  BlockColor,
  Blueprint,
  BotBuildSkill,
  Grid8x8,
} from '../types/bad-architect.types';
import { createEmptyGrid } from './blueprints';

export function generateBotBuildGrid(bot: ArchitectPlayer, blueprint: Blueprint): Grid8x8 {
  const skill = bot.botSkill ?? 'medium';
  const grid = createEmptyGrid();
  const target = blueprint.grid;
  const palette = blueprint.colorPalette;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const targetCell = target[r]?.[c] ?? null;

      if (skill === 'high') {
        // 85% exact match, 10% wrong color, 5% miss
        if (targetCell !== null) {
          const roll = Math.random();
          if (roll < 0.85) {
            grid[r]![c] = targetCell;
          } else if (roll < 0.95 && palette.length > 0) {
            grid[r]![c] =
              (palette[Math.floor(Math.random() * palette.length)] as BlockColor) ?? targetCell;
          }
        }
      } else if (skill === 'medium') {
        // 55% exact match, 25% shifted/wrong color, 20% miss
        if (targetCell !== null) {
          const roll = Math.random();
          if (roll < 0.55) {
            grid[r]![c] = targetCell;
          } else if (roll < 0.8 && palette.length > 0) {
            grid[r]![c] =
              (palette[Math.floor(Math.random() * palette.length)] as BlockColor) ?? targetCell;
          }
        } else if (Math.random() < 0.05 && palette.length > 0) {
          // Occasional stray block
          grid[r]![c] = (palette[Math.floor(Math.random() * palette.length)] as BlockColor) ?? null;
        }
      } else {
        // Chaotic: 25% match, high random placements creating a wacky disaster
        if (targetCell !== null && Math.random() < 0.25) {
          grid[r]![c] = targetCell;
        } else if (Math.random() < 0.2 && palette.length > 0) {
          grid[r]![c] = (palette[Math.floor(Math.random() * palette.length)] as BlockColor) ?? null;
        }
      }
    }
  }

  return grid;
}

export function generateBotVotes(
  bot: ArchitectPlayer,
  builders: ArchitectPlayer[],
): ArchitectVote[] {
  // Only vote for other builders
  const candidates = builders.filter((b) => b.id !== bot.id);
  if (candidates.length === 0) return [];

  // Sort by similarity score
  const sorted = [...candidates].sort((a, b) => b.similarityScore - a.similarityScore);
  const best = sorted[0]!;
  const disaster = sorted[sorted.length - 1]!;

  return [
    {
      voterId: bot.id,
      targetPlayerId: best.id,
      awardType: 'closest_match',
    },
    {
      voterId: bot.id,
      targetPlayerId: disaster.id,
      awardType: 'funniest_disaster',
    },
  ];
}

export function simulateBotBuild(blueprint: Blueprint, skill: BotBuildSkill = 'medium'): Grid8x8 {
  return generateBotBuildGrid({ botSkill: skill } as ArchitectPlayer, blueprint);
}

export function generateBotArchitectVotes(
  bot: ArchitectPlayer,
  submissions: Record<string, Grid8x8>,
  blueprint: Blueprint,
): ArchitectVote[] {
  const otherIds = Object.keys(submissions).filter((id) => id !== bot.id);
  if (otherIds.length === 0) return [];

  const ranked = otherIds
    .map((id) => {
      const grid = submissions[id];
      let score = 0;
      if (grid) {
        let matches = 0;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (blueprint.grid[r]?.[c] && grid[r]?.[c] === blueprint.grid[r]?.[c]) {
              matches++;
            }
          }
        }
        score = matches;
      }
      return { id, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]!;
  const worst = ranked[ranked.length - 1]!;

  return [
    { voterId: bot.id, targetPlayerId: best.id, awardType: 'closest_match' },
    { voterId: bot.id, targetPlayerId: worst.id, awardType: 'funniest_disaster' },
  ];
}
