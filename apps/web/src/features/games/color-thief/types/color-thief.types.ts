/** One seat colour. Six, because the arena seats up to six painters. */
export type ColorThiefColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type ColorThiefAbilityId = 'bleed' | 'freeze' | 'bloom' | 'swap' | 'blockade' | 'splash';

/** How many tiles the player must pick before an ability resolves. */
export type ColorThiefTargetKind = 'none' | 'enemy-tile' | 'own-and-enemy' | 'any-tile';

export interface ColorThiefAbility {
  id: ColorThiefAbilityId;
  color: ColorThiefColor;
  name: string;
  /** One-line description shown once the ability has been revealed. */
  description: string;
  /** Passive abilities fire on their owner's turn start and are never aimed. */
  kind: 'active' | 'passive';
  paintCost: number;
  /** Rounds that must pass before the ability can be used again. */
  cooldownRounds: number;
  targetKind: ColorThiefTargetKind;
}

export type ColorThiefPlayerType = 'human' | 'bot';

export type ColorThiefSeatStatus = 'connected' | 'disconnected';

/** Seat-level identity, independent of React or any transport concern. */
export interface ColorThiefSeat {
  id: string;
  displayName: string;
  avatar?: string;
  type: ColorThiefPlayerType;
  color: ColorThiefColor;
  seatIndex: number;
  status: ColorThiefSeatStatus;
  ready: boolean;
}

export interface ColorThiefTile {
  /** Row-major index into `board`. */
  index: number;
  /** Seat index of the owner, or null while the tile is still neutral. */
  owner: number | null;
  /**
   * Round number the paint dries on. While `round < frozenUntilRound` the tile
   * scores nothing, spreads nothing and cannot be claimed by anyone.
   */
  frozenUntilRound: number;
  /** Action counter of the claim that last flipped this tile, for spread animations. */
  claimedAtAction: number;
}

export interface ColorThiefPlayerState {
  playerId: string;
  seatIndex: number;
  color: ColorThiefColor;
  ability: ColorThiefAbilityId;
  /** Opponents only see an ability after its owner has fired it once. */
  abilityRevealed: boolean;
  /** First round the ability may be used again; 0 means ready now. */
  abilityReadyOnRound: number;
  /** Turns still under a Blockade, each one running on reduced paint. */
  blockadedTurns: number;
}

export type ColorThiefLogKind = 'claim' | 'ability' | 'turn' | 'system';

export interface ColorThiefLogEntry {
  id: number;
  kind: ColorThiefLogKind;
  seatIndex: number | null;
  message: string;
  round: number;
}

export type ColorThiefGameStatus = 'waiting' | 'playing' | 'paused' | 'completed';

export interface ColorThiefRuleSettings {
  columns: number;
  rows: number;
  /** Paint handed to every seat at the start of its turn. */
  paintPerTurn: number;
  /** Full passes around the table before the arena is scored. */
  totalRounds: number;
}

export interface ColorThiefGameState {
  status: ColorThiefGameStatus;
  columns: number;
  rows: number;
  board: ColorThiefTile[];
  players: ColorThiefPlayerState[];
  currentTurnSeatIndex: number;
  /** 1-based; a round completes when the table has passed back to the first seat. */
  round: number;
  paintRemaining: number;
  log: ColorThiefLogEntry[];
  /** Monotonic counter, so the board can tell a fresh claim from a re-render. */
  actionCount: number;
  winnerIds: string[];
  settings: ColorThiefRuleSettings;
}

export type ColorThiefAction =
  | { type: 'START_GAME'; playerId: string }
  | { type: 'PAUSE_GAME'; playerId: string }
  | { type: 'RESUME_GAME'; playerId: string }
  | { type: 'END_GAME'; playerId: string }
  | { type: 'CLAIM_TILE'; playerId: string; payload: { index: number } }
  | { type: 'USE_ABILITY'; playerId: string; payload: { targets: number[] } }
  | { type: 'END_TURN'; playerId: string };

export interface ColorThiefScore {
  seatIndex: number;
  playerId: string;
  /** Tiles held and dry. Frozen tiles score nothing until they thaw. */
  tiles: number;
  /** Tiles held but still frozen, shown apart so the board reads honestly. */
  frozenTiles: number;
  /** Size of the biggest orthogonally connected blob, used to break ties. */
  largestRegion: number;
}

export interface ColorThiefStats {
  gamesPlayed: number;
  wins: number;
  mostTilesHeld: number;
  abilitiesUsed: number;
  lastPlayedAt: string;
}

export interface ColorThiefPreferences {
  lastSeatCount: number;
  lastBotCount: number;
  lastBoardSize: number;
  /** Swaps seat fills for high-contrast blocks with bold seat glyphs. */
  highContrast: boolean;
}
