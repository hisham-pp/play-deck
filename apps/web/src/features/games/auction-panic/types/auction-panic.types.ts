export type ItemCategory = 'antiquities' | 'fine-art' | 'galactic-tech' | 'oddities' | 'junk';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'cursed';

export type SpecialRoundType = 'standard' | 'blind' | 'forced-bid' | 'double-or-nothing' | 'steal';

export interface AuctionItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  hint: string;
  crypticDescription: string;
  baseValue: number;
  isJunk: boolean;
  isCursed?: boolean;
  penalty?: number;
  comboSetId?: string;
  icon: string;
}

export interface ComboSet {
  id: string;
  name: string;
  requiredItemIds: string[];
  bonusPoints: number;
  description: string;
}

export interface WonItem extends AuctionItem {
  purchasePrice: number;
  effectiveValue: number;
  roundWon: number;
  wasDoubled?: boolean;
  wasStolen?: boolean;
}

export interface AuctionPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isBot: boolean;
  coins: number;
  startingCoins: number;
  wonItems: WonItem[];
  currentBid: number;
  hasPassed: boolean;
  archetype?: string;
}

export interface BidRecord {
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: number;
}

export type AuctionPhase =
  'lobby' | 'intro' | 'bidding' | 'reveal' | 'steal-action' | 'round-summary' | 'game-over';

export interface AuctionLot {
  lotIndex: number;
  item: AuctionItem;
  specialRound: SpecialRoundType;
  minimumBid: number;
  currentHighestBid: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  bids: BidRecord[];
  blindBids: Record<string, number>;
  timeRemaining: number;
  isTimerUrgent: boolean;
}

export interface StealAction {
  stealerPlayerId: string;
  targetPlayerId: string;
  itemId: string;
}

export interface FinalPlayerScore {
  player: AuctionPlayer;
  coinsRemaining: number;
  itemsTotalValue: number;
  comboBonusTotal: number;
  penaltiesTotal: number;
  finalScore: number;
  achievedCombos: ComboSet[];
  rank: number;
}
