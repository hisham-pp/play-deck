import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { KingdomPlayer } from '../types/kingdom-draft.types';
import { chooseBotDraftCard, chooseBotGridPlacement } from './kingdom-bot';
import { KINGDOM_RESOURCE_CARDS, SECRET_OBJECTIVES } from './kingdom-cards';
import {
  calculateFinalKingdomScores,
  calculateGridScore,
  calculateTileSynergy,
  checkSecretObjective,
  createEmptyGrid,
  generateDraftPool,
  getSnakeDraftOrder,
} from './kingdom-engine';

function makeTestPlayer(id: string, name: string): KingdomPlayer {
  return {
    id,
    name,
    avatar: '👑',
    color: '#f59e0b',
    isBot: false,
    grid: createEmptyGrid(),
    secretObjective: null,
    unplacedCard: null,
    score: 0,
  };
}

describe('Kingdom Draft — Engine Tests', () => {
  describe('Card Catalog & Objectives', () => {
    it('has at least 20 cards in catalog', () => {
      assert.ok(KINGDOM_RESOURCE_CARDS.length >= 20);
    });

    it('has 6 distinct secret objectives', () => {
      assert.equal(SECRET_OBJECTIVES.length, 6);
    });

    it('generates draft pool scaled to player count', () => {
      const pool = generateDraftPool(4);
      assert.equal(pool.length, 4 * 2 + 1); // 9 cards
    });
  });

  describe('Snake Draft Order', () => {
    it('provides standard forward order on round 0 and reversed on round 1', () => {
      const round0 = getSnakeDraftOrder(0, 4);
      assert.deepEqual(round0, [0, 1, 2, 3]);

      const round1 = getSnakeDraftOrder(1, 4);
      assert.deepEqual(round1, [3, 2, 1, 0]);

      const round2 = getSnakeDraftOrder(2, 4);
      assert.deepEqual(round2, [0, 1, 2, 3]);
    });
  });

  describe('Adjacency Synergies', () => {
    it('computes adjacency synergy when matching partner is adjacent', () => {
      const grid = createEmptyGrid();
      // Lush Meadow (land) synergizes with food (+3)
      const meadow = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'lush-meadow')!;
      // Wheat Farm (food) synergizes with land (+3)
      const farm = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'wheat-farm')!;

      grid[0]![0] = meadow;
      grid[0]![1] = farm;

      const meadowSynergy = calculateTileSynergy(grid, 0, 0);
      const farmSynergy = calculateTileSynergy(grid, 0, 1);

      assert.equal(meadowSynergy, 3);
      assert.equal(farmSynergy, 3);
    });

    it('gives 0 synergy when neighbors do not match synergy category', () => {
      const grid = createEmptyGrid();
      const meadow = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'lush-meadow')!; // needs food
      const fortress = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'stone-fortress')!; // defense

      grid[0]![0] = meadow;
      grid[0]![1] = fortress;

      assert.equal(calculateTileSynergy(grid, 0, 0), 0);
    });
  });

  describe('Grid Scoring & Secret Objectives', () => {
    it('computes grid total with base points and synergy', () => {
      const grid = createEmptyGrid();
      const meadow = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'lush-meadow')!; // base 2
      const farm = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'wheat-farm')!; // base 2
      grid[0]![0] = meadow;
      grid[0]![1] = farm;

      const score = calculateGridScore(grid);
      // base: 2 + 2 = 4; synergy: 3 + 3 = 6; total = 10
      assert.equal(score.basePoints, 4);
      assert.equal(score.synergyPoints, 6);
      assert.equal(score.totalScore, 10);
    });

    it('validates secret objective completion', () => {
      const p = makeTestPlayer('p1', 'King Arthur');
      const imperatorObj = SECRET_OBJECTIVES.find((o) => o.id === 'imperator')!; // needs 3 defense
      p.secretObjective = imperatorObj;

      const fortress = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'stone-fortress')!;
      p.grid[0]![0] = fortress;
      p.grid[0]![1] = fortress;
      assert.equal(checkSecretObjective(p), false); // only 2

      p.grid[0]![2] = fortress;
      assert.equal(checkSecretObjective(p), true); // 3 defense tiles!
    });

    it('ranks players by total score in final calculation', () => {
      const p1 = makeTestPlayer('p1', 'Player 1');
      const p2 = makeTestPlayer('p2', 'Player 2');
      const library = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'grand-library')!; // base 4
      p1.grid[1]![1] = library;

      const scores = calculateFinalKingdomScores([p1, p2]);
      assert.equal(scores[0]!.player.id, 'p1');
      assert.equal(scores[0]!.rank, 1);
      assert.equal(scores[1]!.rank, 2);
    });
  });

  describe('Bot Drafting & Placement', () => {
    it('bot picks preferred card matching objective', () => {
      const bot = makeTestPlayer('bot-1', 'Bot');
      bot.isBot = true;
      bot.secretObjective = SECRET_OBJECTIVES.find((o) => o.id === 'breadbasket')!; // food target

      const foodCard = KINGDOM_RESOURCE_CARDS.find((c) => c.category === 'food')!;
      const goldCard = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'copper-mint')!;

      const pick = chooseBotDraftCard(bot, [goldCard, foodCard]);
      assert.equal(pick?.id, foodCard.id);
    });

    it('bot places card adjacent to synergistic neighbor', () => {
      const bot = makeTestPlayer('bot-1', 'Bot');
      bot.isBot = true;

      // Put meadow (land) at [1, 1]
      const meadow = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'lush-meadow')!;
      bot.grid[1]![1] = meadow;

      // Farm synergizes with land
      const farm = KINGDOM_RESOURCE_CARDS.find((c) => c.id === 'wheat-farm')!;
      const placement = chooseBotGridPlacement(bot, farm);

      assert.ok(placement);
      // Neighbor to [1,1] must be one of [0,1], [2,1], [1,0], [1,2]
      const isAdjacent = Math.abs(placement.row - 1) + Math.abs(placement.col - 1) === 1;
      assert.equal(isAdjacent, true);
    });
  });
});
