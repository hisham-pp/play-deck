import type {
  GridCoord,
  KingdomPlayer,
  ResourceCard,
  TradeOffer,
} from '../types/kingdom-draft.types';

export const KINGDOM_EVENTS = {
  start: 'KINGDOM_START',
  draftCard: 'KINGDOM_DRAFT_CARD',
  placeTile: 'KINGDOM_PLACE_TILE',
  proposeTrade: 'KINGDOM_PROPOSE_TRADE',
  resolveTrade: 'KINGDOM_RESOLVE_TRADE',
  sync: 'KINGDOM_SYNC',
  restart: 'KINGDOM_RESTART',
} as const;

export interface KingdomStartPayload {
  players: KingdomPlayer[];
  draftPool: ResourceCard[];
  round: number;
}

export interface KingdomDraftCardPayload {
  playerId: string;
  cardId: string;
}

export interface KingdomPlaceTilePayload {
  playerId: string;
  card: ResourceCard;
  coord: GridCoord;
}

export interface KingdomTradePayload {
  offer: TradeOffer;
}

const T_OBJ = 'object';
const T_STR = 'string';

export function isKingdomStartPayload(data: unknown): data is KingdomStartPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as KingdomStartPayload;
  return Array.isArray(p.players) && Array.isArray(p.draftPool);
}

export function isKingdomDraftCardPayload(data: unknown): data is KingdomDraftCardPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as KingdomDraftCardPayload;
  return typeof p.playerId === T_STR && typeof p.cardId === T_STR;
}

export function isKingdomPlaceTilePayload(data: unknown): data is KingdomPlaceTilePayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as KingdomPlaceTilePayload;
  return (
    typeof p.playerId === T_STR &&
    Boolean(p.card) &&
    typeof p.coord === T_OBJ &&
    typeof p.coord.row === 'number' &&
    typeof p.coord.col === 'number'
  );
}
