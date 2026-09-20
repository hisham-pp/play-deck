import type {
  AuctionItem,
  AuctionLot,
  AuctionPlayer,
  ComboSet,
  FinalPlayerScore,
  SpecialRoundType,
  WonItem,
} from '../types/auction-panic.types';
import { AUCTION_ITEMS_CATALOG, COMBO_SETS } from './auction-items';

export const STARTING_BUDGET = 1000;
export const DEFAULT_MIN_BID = 50;
export const BID_INCREMENT_OPTIONS = [10, 25, 50, 100];
export const LOT_TIMER_SECONDS = 15;

const SPECIAL_ROUND_POOL: SpecialRoundType[] = [
  'standard',
  'forced-bid',
  'blind',
  'standard',
  'double-or-nothing',
  'steal',
  'standard',
];

export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

export function generateAuctionLots(count = 7): AuctionLot[] {
  const shuffledCatalog = shuffleArray(AUCTION_ITEMS_CATALOG);
  const selectedItems = shuffledCatalog.slice(0, count);

  return selectedItems.map((item, index) => {
    const specialRound = SPECIAL_ROUND_POOL[index % SPECIAL_ROUND_POOL.length] ?? 'standard';
    return {
      lotIndex: index + 1,
      item,
      specialRound,
      minimumBid: DEFAULT_MIN_BID,
      currentHighestBid: 0,
      highestBidderId: null,
      highestBidderName: null,
      bids: [],
      blindBids: {},
      timeRemaining: LOT_TIMER_SECONDS,
      isTimerUrgent: false,
    };
  });
}

export function canPlaceBid(
  player: AuctionPlayer,
  amount: number,
  lot: AuctionLot,
): { valid: boolean; reason?: string } {
  if (amount > player.coins) {
    return { valid: false, reason: 'Insufficient coins for this bid' };
  }
  if (lot.specialRound === 'blind') {
    if (amount < lot.minimumBid) {
      return { valid: false, reason: `Blind bid must be at least ${lot.minimumBid}` };
    }
    return { valid: true };
  }
  const minRequired = Math.max(lot.minimumBid, lot.currentHighestBid + 10);
  if (amount < minRequired) {
    return { valid: false, reason: `Bid must be at least ${minRequired}` };
  }
  return { valid: true };
}

export function recordBid(lot: AuctionLot, player: AuctionPlayer, amount: number): AuctionLot {
  if (lot.specialRound === 'blind') {
    return {
      ...lot,
      blindBids: { ...lot.blindBids, [player.id]: amount },
      bids: [
        ...lot.bids,
        {
          playerId: player.id,
          playerName: player.name,
          amount,
          timestamp: Date.now(),
        },
      ],
    };
  }

  return {
    ...lot,
    currentHighestBid: amount,
    highestBidderId: player.id,
    highestBidderName: player.name,
    bids: [
      ...lot.bids,
      {
        playerId: player.id,
        playerName: player.name,
        amount,
        timestamp: Date.now(),
      },
    ],
  };
}

export interface LotOutcome {
  winnerId: string | null;
  winningBid: number;
  revealedItem: AuctionItem;
  effectiveValue: number;
  isDoubleOrNothing: boolean;
  isStealRound: boolean;
  updatedPlayers: AuctionPlayer[];
}

export function resolveAuctionLot(lot: AuctionLot, players: AuctionPlayer[]): LotOutcome {
  let winnerId: string | null = null;
  let winningBid = 0;

  if (lot.specialRound === 'blind') {
    let topBid = 0;
    let topId: string | null = null;
    for (const [pId, bAmount] of Object.entries(lot.blindBids)) {
      if (bAmount > topBid) {
        topBid = bAmount;
        topId = pId;
      }
    }
    winnerId = topId;
    winningBid = topBid;
  } else {
    winnerId = lot.highestBidderId;
    winningBid = lot.currentHighestBid;
  }

  const isDoubleOrNothing = lot.specialRound === 'double-or-nothing';
  const isStealRound = lot.specialRound === 'steal';
  const effectiveValue = isDoubleOrNothing ? lot.item.baseValue * 2 : lot.item.baseValue;

  const updatedPlayers = players.map((p) => {
    if (p.id !== winnerId || winningBid <= 0) return p;

    const wonItem: WonItem = {
      ...lot.item,
      purchasePrice: winningBid,
      effectiveValue,
      roundWon: lot.lotIndex,
      wasDoubled: isDoubleOrNothing,
    };

    return {
      ...p,
      coins: Math.max(0, p.coins - winningBid),
      wonItems: [...p.wonItems, wonItem],
    };
  });

  return {
    winnerId,
    winningBid,
    revealedItem: lot.item,
    effectiveValue,
    isDoubleOrNothing,
    isStealRound,
    updatedPlayers,
  };
}

export function executeSteal(
  players: AuctionPlayer[],
  stealerId: string,
  victimId: string,
  itemId: string,
): AuctionPlayer[] {
  const victim = players.find((p) => p.id === victimId);
  const targetItem = victim?.wonItems.find((i) => i.id === itemId);
  if (!victim || !targetItem) return players;

  return players.map((p) => {
    if (p.id === victimId) {
      return {
        ...p,
        wonItems: p.wonItems.filter((i) => i.id !== itemId),
      };
    }
    if (p.id === stealerId) {
      const stolenItem: WonItem = { ...targetItem, wasStolen: true };
      return {
        ...p,
        wonItems: [...p.wonItems, stolenItem],
      };
    }
    return p;
  });
}

export function evaluateCombos(items: WonItem[]): ComboSet[] {
  const itemIds = new Set(items.map((i) => i.id));
  return COMBO_SETS.filter((set) => set.requiredItemIds.every((id) => itemIds.has(id)));
}

export function calculateFinalScores(players: AuctionPlayer[]): FinalPlayerScore[] {
  const scores = players.map((player) => {
    const itemsTotalValue = player.wonItems.reduce((acc, item) => acc + item.effectiveValue, 0);
    const achievedCombos = evaluateCombos(player.wonItems);
    const comboBonusTotal = achievedCombos.reduce((acc, c) => acc + c.bonusPoints, 0);
    const penaltiesTotal = player.wonItems.reduce((acc, item) => acc + (item.penalty ?? 0), 0);

    const finalScore = player.coins + itemsTotalValue + comboBonusTotal - penaltiesTotal;

    return {
      player,
      coinsRemaining: player.coins,
      itemsTotalValue,
      comboBonusTotal,
      penaltiesTotal,
      finalScore,
      achievedCombos,
      rank: 1,
    };
  });

  scores.sort((a, b) => b.finalScore - a.finalScore);
  scores.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return scores;
}
