import type { AuctionLot, AuctionPlayer, WonItem } from '../types/auction-panic.types';

export const AUCTION_EVENTS = {
  start: 'AUCTION_START',
  bid: 'AUCTION_BID',
  hammer: 'AUCTION_HAMMER',
  steal: 'AUCTION_STEAL',
  nextLot: 'AUCTION_NEXT_LOT',
  sync: 'AUCTION_SYNC',
  restart: 'AUCTION_RESTART',
} as const;

export interface AuctionStartPayload {
  players: AuctionPlayer[];
  lots: AuctionLot[];
}

export interface AuctionBidPayload {
  playerId: string;
  amount: number;
}

export interface AuctionHammerPayload {
  lotIndex: number;
  winnerId: string | null;
  winningBid: number;
  revealedItem: WonItem | null;
}

export interface AuctionStealPayload {
  stealerId: string;
  victimId: string;
  itemId: string;
}

export interface AuctionSyncPayload {
  lots: AuctionLot[];
  currentLotIndex: number;
  players: AuctionPlayer[];
}

const T_OBJ = 'object';
const T_STR = 'string';

export function isAuctionStartPayload(data: unknown): data is AuctionStartPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as AuctionStartPayload;
  return Array.isArray(p.players) && Array.isArray(p.lots);
}

export function isAuctionBidPayload(data: unknown): data is AuctionBidPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as AuctionBidPayload;
  return typeof p.playerId === T_STR && typeof p.amount === 'number';
}

export function isAuctionStealPayload(data: unknown): data is AuctionStealPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as AuctionStealPayload;
  return typeof p.stealerId === T_STR && typeof p.victimId === T_STR && typeof p.itemId === T_STR;
}
