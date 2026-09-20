import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AuctionLot, AuctionPlayer } from '../types/auction-panic.types';
import { decideBotBid, decideBotSteal } from './auction-bot';
import {
  canPlaceBid,
  calculateFinalScores,
  executeSteal,
  generateAuctionLots,
  recordBid,
  resolveAuctionLot,
  STARTING_BUDGET,
} from './auction-engine';
import { AUCTION_ITEMS_CATALOG, COMBO_SETS } from './auction-items';

function makeTestPlayer(id: string, name: string, coins = STARTING_BUDGET): AuctionPlayer {
  return {
    id,
    name,
    avatar: '🎩',
    color: '#f59e0b',
    isBot: false,
    coins,
    startingCoins: STARTING_BUDGET,
    wonItems: [],
    currentBid: 0,
    hasPassed: false,
  };
}

describe('Auction Panic — Engine Tests', () => {
  describe('Catalog & Lot Generation', () => {
    it('has at least 15 items in catalog', () => {
      assert.ok(AUCTION_ITEMS_CATALOG.length >= 15);
    });

    it('generates the specified number of lots with valid item and minimum bid', () => {
      const lots = generateAuctionLots(6);
      assert.equal(lots.length, 6);
      lots.forEach((lot, idx) => {
        assert.equal(lot.lotIndex, idx + 1);
        assert.ok(lot.item);
        assert.ok(lot.item.name.length > 0);
        assert.ok(lot.minimumBid > 0);
      });
    });
  });

  describe('Bid Validation & Recording', () => {
    it('rejects bids when player lacks sufficient coins', () => {
      const player = makeTestPlayer('p1', 'Alice', 100);
      const lot = generateAuctionLots(1)[0]!;
      const check = canPlaceBid(player, 150, lot);
      assert.equal(check.valid, false);
      assert.match(check.reason!, /Insufficient coins/);
    });

    it('rejects bids that do not exceed current highest bid by minimum increment', () => {
      const player = makeTestPlayer('p1', 'Alice', 1000);
      const lot: AuctionLot = {
        ...generateAuctionLots(1)[0]!,
        currentHighestBid: 200,
      };
      const checkLow = canPlaceBid(player, 205, lot);
      assert.equal(checkLow.valid, false);

      const checkValid = canPlaceBid(player, 210, lot);
      assert.equal(checkValid.valid, true);
    });

    it('records bids properly on standard lot', () => {
      const player = makeTestPlayer('p1', 'Alice');
      const lot = generateAuctionLots(1)[0]!;
      const updated = recordBid(lot, player, 150);
      assert.equal(updated.currentHighestBid, 150);
      assert.equal(updated.highestBidderId, 'p1');
      assert.equal(updated.highestBidderName, 'Alice');
      assert.equal(updated.bids.length, 1);
    });

    it('records blind bids in blindBids map', () => {
      const player = makeTestPlayer('p1', 'Alice');
      const lot: AuctionLot = {
        ...generateAuctionLots(1)[0]!,
        specialRound: 'blind',
      };
      const updated = recordBid(lot, player, 300);
      assert.equal(updated.blindBids['p1'], 300);
      assert.equal(updated.currentHighestBid, 0); // remains hidden until resolution
    });
  });

  describe('Lot Resolution & Modifiers', () => {
    it('awards won item to highest bidder and deducts coins', () => {
      const p1 = makeTestPlayer('p1', 'Alice', 1000);
      const p2 = makeTestPlayer('p2', 'Bob', 1000);
      const lot: AuctionLot = {
        ...generateAuctionLots(1)[0]!,
        currentHighestBid: 250,
        highestBidderId: 'p1',
        highestBidderName: 'Alice',
      };

      const outcome = resolveAuctionLot(lot, [p1, p2]);
      assert.equal(outcome.winnerId, 'p1');
      assert.equal(outcome.winningBid, 250);

      const updatedP1 = outcome.updatedPlayers.find((p) => p.id === 'p1')!;
      assert.equal(updatedP1.coins, 750);
      assert.equal(updatedP1.wonItems.length, 1);
      assert.equal(updatedP1.wonItems[0]!.purchasePrice, 250);
    });

    it('doubles effective value on double-or-nothing lots', () => {
      const p1 = makeTestPlayer('p1', 'Alice', 1000);
      const lot: AuctionLot = {
        ...generateAuctionLots(1)[0]!,
        specialRound: 'double-or-nothing',
        currentHighestBid: 300,
        highestBidderId: 'p1',
        highestBidderName: 'Alice',
      };

      const outcome = resolveAuctionLot(lot, [p1]);
      assert.equal(outcome.isDoubleOrNothing, true);
      assert.equal(outcome.effectiveValue, lot.item.baseValue * 2);

      const updatedP1 = outcome.updatedPlayers[0]!;
      assert.equal(updatedP1.wonItems[0]!.effectiveValue, lot.item.baseValue * 2);
    });
  });

  describe('Steal Actions', () => {
    it('transfers target item from victim to stealer', () => {
      const p1 = makeTestPlayer('p1', 'Stealer');
      const p2 = makeTestPlayer('p2', 'Victim');
      p2.wonItems = [
        {
          id: 'test-item-1',
          name: 'Gold Chalice',
          category: 'fine-art',
          rarity: 'rare',
          hint: 'Gleaming gold',
          crypticDescription: 'Ancient relic',
          baseValue: 500,
          purchasePrice: 200,
          effectiveValue: 500,
          roundWon: 1,
          isJunk: false,
          icon: '🏆',
        },
      ];

      const result = executeSteal([p1, p2], 'p1', 'p2', 'test-item-1');
      const updatedP1 = result.find((p) => p.id === 'p1')!;
      const updatedP2 = result.find((p) => p.id === 'p2')!;

      assert.equal(updatedP2.wonItems.length, 0);
      assert.equal(updatedP1.wonItems.length, 1);
      assert.equal(updatedP1.wonItems[0]!.id, 'test-item-1');
      assert.equal(updatedP1.wonItems[0]!.wasStolen, true);
    });
  });

  describe('Combos & Final Scoring', () => {
    it('calculates full scores including combo set bonuses', () => {
      const p1 = makeTestPlayer('p1', 'Curator', 500);
      // Give Pharaoh set: pharaoh-mask, scarab-amulet, canopic-jar
      const pharaohSet = COMBO_SETS.find((s) => s.id === 'pharaoh-legacy')!;
      p1.wonItems = [
        {
          id: 'pharaoh-mask',
          name: 'Mask',
          category: 'antiquities',
          rarity: 'legendary',
          hint: 'mask',
          crypticDescription: 'mask',
          baseValue: 950,
          effectiveValue: 950,
          purchasePrice: 400,
          roundWon: 1,
          isJunk: false,
          icon: '👑',
        },
        {
          id: 'scarab-amulet',
          name: 'Scarab',
          category: 'antiquities',
          rarity: 'rare',
          hint: 'scarab',
          crypticDescription: 'scarab',
          baseValue: 550,
          effectiveValue: 550,
          purchasePrice: 250,
          roundWon: 2,
          isJunk: false,
          icon: '🪲',
        },
        {
          id: 'canopic-jar',
          name: 'Jar',
          category: 'antiquities',
          rarity: 'uncommon',
          hint: 'jar',
          crypticDescription: 'jar',
          baseValue: 400,
          effectiveValue: 400,
          purchasePrice: 150,
          roundWon: 3,
          isJunk: false,
          icon: '🏺',
        },
      ];

      const p2 = makeTestPlayer('p2', 'Casual', 800);

      const scores = calculateFinalScores([p1, p2]);
      const p1Score = scores.find((s) => s.player.id === 'p1')!;
      assert.equal(p1Score.achievedCombos.length, 1);
      assert.equal(p1Score.comboBonusTotal, pharaohSet.bonusPoints);
      // coins (500) + items (950+550+400=1900) + combo (600) = 3000
      assert.equal(p1Score.finalScore, 500 + 1900 + 600);
      assert.equal(p1Score.rank, 1);
    });
  });

  describe('Bot AI Decisions', () => {
    it('decides valid bid for aggressive tycoon when coins allow', () => {
      const bot = {
        ...makeTestPlayer('bot-1', 'TycoonBot', 1000),
        isBot: true,
        archetype: 'aggressive-tycoon',
      };
      const lot = generateAuctionLots(1)[0]!;
      const decision = decideBotBid(bot, lot, [bot]);
      assert.equal(decision.shouldBid, true);
      assert.ok(decision.amount >= lot.minimumBid);
    });

    it('decides steal target from player with most valuable item', () => {
      const bot = {
        ...makeTestPlayer('bot-1', 'ThiefBot'),
        isBot: true,
      };
      const opponent = makeTestPlayer('opp', 'RichOpponent');
      opponent.wonItems = [
        {
          id: 'cheap-item',
          name: 'Tin',
          category: 'junk',
          rarity: 'common',
          hint: 'tin',
          crypticDescription: 'tin',
          baseValue: 10,
          effectiveValue: 10,
          purchasePrice: 5,
          roundWon: 1,
          isJunk: true,
          icon: '🥫',
        },
        {
          id: 'expensive-item',
          name: 'Diamond Watch',
          category: 'fine-art',
          rarity: 'rare',
          hint: 'watch',
          crypticDescription: 'watch',
          baseValue: 700,
          effectiveValue: 700,
          purchasePrice: 300,
          roundWon: 2,
          isJunk: false,
          icon: '⏱️',
        },
      ];

      const stealDecision = decideBotSteal(bot, [bot, opponent]);
      assert.ok(stealDecision);
      assert.equal(stealDecision.targetPlayerId, 'opp');
      assert.equal(stealDecision.itemId, 'expensive-item');
    });
  });
});
