export type ResourceType = 'wood' | 'stone' | 'food';

export type TileType = 'sand' | 'grass' | 'rock' | 'grove' | 'water' | 'bridge' | 'barrier';

export type SinkingState = 'dry' | 'warning' | 'submerged';

export interface GridCoord {
  x: number;
  y: number;
}

export interface IslandTile {
  x: number;
  y: number;
  type: TileType;
  baseType: TileType; // original ground type before bridge/barrier
  sinkingState: SinkingState;
  resource: ResourceType | null;
  resourceCount: number; // 0 if harvested
  barrierHp?: number; // for barriers (default 2)
  shakeOffset?: number; // visual shaking animation offset
}

export interface PlayerInventory {
  wood: number;
  stone: number;
  food: number;
}

export interface PlayerTools {
  hasRaft: boolean;
  hasSpear: boolean;
}

export interface IslandPlayer {
  id: string;
  seatIndex: number;
  displayName: string;
  avatar: string;
  color: string;
  x: number;
  y: number;
  isBot: boolean;
  isAlive: boolean;
  eliminatedCause?: 'drowned' | 'pushed' | null;
  inventory: PlayerInventory;
  tools: PlayerTools;
  ap: number; // Action points remaining this turn (max 2)
  stats: {
    resourcesGathered: number;
    structuresBuilt: number;
    playersPushed: number;
    eliminations: number;
  };
}

export type ActionType =
  | 'MOVE'
  | 'GATHER'
  | 'BUILD_BRIDGE'
  | 'BUILD_BARRIER'
  | 'CRAFT_RAFT'
  | 'CRAFT_SPEAR'
  | 'PUSH'
  | 'STEAL'
  | 'PASS';

export interface GameAction {
  type: ActionType;
  seatIndex: number;
  targetCoord?: GridCoord;
  targetPlayerId?: string;
  targetResource?: ResourceType;
}

export type IslandPhaseMood = 'calm' | 'rising_tide' | 'storm' | 'final_stand';

export interface GameEventLog {
  id: string;
  round: number;
  seatIndex?: number;
  text: string;
  type: 'action' | 'shrink' | 'elimination' | 'system';
  timestamp: number;
}

export interface IslandGameState {
  gridSize: number; // e.g. 9
  tiles: IslandTile[][];
  players: IslandPlayer[];
  currentTurnSeatIndex: number;
  turnOrder: number[]; // seats of alive players in turn order
  turnOrderIndex: number;
  round: number;
  phase: 'lobby' | 'playing' | 'round_transition' | 'game_over';
  mood: IslandPhaseMood;
  winnerSeatIndex: number | null;
  eventLogs: GameEventLog[];
  maxAp: number;
}

export const CRAFTING_RECIPES = {
  bridge: { wood: 2, stone: 0, food: 0 },
  barrier: { wood: 0, stone: 2, food: 0 },
  raft: { wood: 2, stone: 0, food: 1 },
  spear: { wood: 1, stone: 1, food: 0 },
} as const;

export const ISLAND_COLORS = [
  '#f59e0b', // Amber
  '#38bdf8', // Sky Blue
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#f97316', // Orange
];

export const ISLAND_AVATARS = ['🌴', '🦜', '🦀', '🥥', '⛵', '🦈'];
