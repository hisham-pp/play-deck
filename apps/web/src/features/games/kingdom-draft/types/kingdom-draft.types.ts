export type ResourceCategory = 'land' | 'people' | 'gold' | 'food' | 'defense' | 'culture';

export interface ResourceCard {
  id: string;
  name: string;
  category: ResourceCategory;
  icon: string;
  basePoints: number;
  synergyDescription: string;
  synergyPartnerCategory: ResourceCategory;
  synergyBonus: number;
  isRare?: boolean;
}

export interface SecretObjective {
  id: string;
  title: string;
  description: string;
  targetCategory: ResourceCategory | 'diverse';
  bonusPoints: number;
}

export interface GridCoord {
  row: number;
  col: number;
}

export interface PlacedTile {
  card: ResourceCard;
  coord: GridCoord;
  adjacencyPoints: number;
}

export interface KingdomPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isBot: boolean;
  archetype?: string;
  grid: (ResourceCard | null)[][];
  secretObjective: SecretObjective | null;
  unplacedCard: ResourceCard | null;
  score: number;
}

export type KingdomPhase =
  'lobby' | 'drafting' | 'placement' | 'trading' | 'round-summary' | 'game-over';

export interface TradeOffer {
  fromPlayerId: string;
  toPlayerId: string;
  offeredCard: ResourceCard;
  requestedCard: ResourceCard;
  status: 'pending' | 'accepted' | 'declined';
}

export interface ScoreCategorySummary {
  basePoints: number;
  synergyPoints: number;
  objectivePoints: number;
  totalScore: number;
}

export interface FinalKingdomScore {
  player: KingdomPlayer;
  breakdown: ScoreCategorySummary;
  objectiveAchieved: boolean;
  rank: number;
}
