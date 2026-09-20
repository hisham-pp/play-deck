import type { AuctionLot, AuctionPlayer, WonItem } from '../types/auction-panic.types';
import { canPlaceBid } from './auction-engine';

export type AuctionBotArchetype =
  'aggressive-tycoon' | 'bargain-hunter' | 'set-collector' | 'wild-gambler';

export const BOT_ARCHETYPES: AuctionBotArchetype[] = [
  'aggressive-tycoon',
  'bargain-hunter',
  'set-collector',
  'wild-gambler',
];

export interface BotBidDecision {
  shouldBid: boolean;
  amount: number;
}

export function decideBotBid(
  bot: AuctionPlayer,
  lot: AuctionLot,
  _allPlayers: AuctionPlayer[],
): BotBidDecision {
  if (lot.highestBidderId === bot.id) {
    return { shouldBid: false, amount: 0 };
  }

  const archetype = (bot.archetype as AuctionBotArchetype) || 'bargain-hunter';
  const currentTop = lot.currentHighestBid;
  const minRequired = Math.max(lot.minimumBid, currentTop + 10);

  if (minRequired > bot.coins) {
    return { shouldBid: false, amount: 0 };
  }

  switch (archetype) {
    case 'aggressive-tycoon': {
      const isHighRarity = lot.item.rarity === 'legendary' || lot.item.rarity === 'rare';
      const willingnessLimit = isHighRarity ? bot.coins * 0.9 : bot.coins * 0.75;
      if (minRequired <= willingnessLimit) {
        const jump = Math.random() > 0.5 ? 50 : 25;
        const bidAmount = Math.min(bot.coins, Math.floor(minRequired + jump));
        return { shouldBid: true, amount: bidAmount };
      }
      return { shouldBid: false, amount: 0 };
    }

    case 'bargain-hunter': {
      // Snipes when timer is low (< 7s) or price is low
      const estimatedValue = lot.item.baseValue;
      if (currentTop > estimatedValue * 0.6) {
        return { shouldBid: false, amount: 0 };
      }
      if (lot.timeRemaining > 8 && Math.random() > 0.3) {
        return { shouldBid: false, amount: 0 };
      }
      const bidAmount = minRequired;
      return { shouldBid: true, amount: bidAmount };
    }

    case 'set-collector': {
      const hasMatchingComboItem = bot.wonItems.some(
        (i) => i.comboSetId && i.comboSetId === lot.item.comboSetId,
      );
      const willingnessLimit = hasMatchingComboItem ? bot.coins * 0.8 : bot.coins * 0.45;
      if (minRequired <= willingnessLimit) {
        const bidAmount = Math.min(bot.coins, minRequired + 15);
        return { shouldBid: true, amount: bidAmount };
      }
      return { shouldBid: false, amount: 0 };
    }

    case 'wild-gambler': {
      if (lot.specialRound === 'double-or-nothing' || lot.specialRound === 'blind') {
        const gambleAmount = Math.min(
          bot.coins,
          Math.max(minRequired, Math.floor(bot.coins * 0.5)),
        );
        const check = canPlaceBid(bot, gambleAmount, lot);
        return { shouldBid: check.valid, amount: gambleAmount };
      }
      if (Math.random() < 0.45 && minRequired <= bot.coins * 0.5) {
        return { shouldBid: true, amount: minRequired };
      }
      return { shouldBid: false, amount: 0 };
    }

    default:
      return { shouldBid: false, amount: 0 };
  }
}

export function decideBotSteal(
  bot: AuctionPlayer,
  allPlayers: AuctionPlayer[],
): { targetPlayerId: string; itemId: string } | null {
  const opponents = allPlayers.filter((p) => p.id !== bot.id && p.wonItems.length > 0);
  if (opponents.length === 0) return null;

  let bestVictimId: string | null = null;
  let bestItem: WonItem | null = null;
  let highestValue = -Infinity;

  for (const opp of opponents) {
    for (const item of opp.wonItems) {
      if (!item.isCursed && item.effectiveValue > highestValue) {
        highestValue = item.effectiveValue;
        bestVictimId = opp.id;
        bestItem = item;
      }
    }
  }

  if (bestVictimId && bestItem) {
    return { targetPlayerId: bestVictimId, itemId: bestItem.id };
  }
  return null;
}

const BOT_QUIPS: Record<AuctionBotArchetype, string[]> = {
  'aggressive-tycoon': [
    'Out of my way, that lot is mine!',
    'Pocket change for a serious collector like me.',
    'Raise the stakes or get off the auction floor.',
  ],
  'bargain-hunter': [
    'Patience is profitable. Let them overpay.',
    'A modest bid at the right second is pure art.',
    'You guys are burning coins way too fast!',
  ],
  'set-collector': [
    'That missing piece completes my showcase!',
    'The historical value of that relic is priceless.',
    'One step closer to an unbeatable museum set.',
  ],
  'wild-gambler': [
    'Double or nothing? Count me in!',
    "No risk, no glory. Let's see what's in the box!",
    "Could be diamonds, could be dirt. Let's roll!",
  ],
};

export function getBotQuip(archetype: AuctionBotArchetype): string {
  const pool = BOT_QUIPS[archetype] ?? BOT_QUIPS['wild-gambler'];
  return pool[Math.floor(Math.random() * pool.length)]!;
}
