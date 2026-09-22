export type GridTheme = 'animals' | 'countries' | 'food' | 'science' | 'sports' | 'mixed';

export type GridSize = 'small' | 'medium' | 'large';

export type WordSearchMode = 'solo' | 'race' | 'elimination' | 'teams';

export interface Coordinate {
  row: number;
  col: number;
}

export interface WordPlacement {
  word: string;
  start: Coordinate;
  end: Coordinate;
  direction: [number, number];
  coordinates: Coordinate[];
  found: boolean;
  claimedBy: string | null; // Player ID
  claimedByName?: string;
  claimedByColor?: string;
  claimedByAvatar?: string;
  claimedAt: number | null; // Timestamp
}

export interface WordSearchGrid {
  size: number;
  letters: string[][];
  placements: WordPlacement[];
  theme: GridTheme;
}

export interface WordSearchPlayer {
  id: string;
  displayName: string;
  avatar: string;
  color: string;
  score: number;
  foundWordsCount: number;
  isHost: boolean;
  isBot: boolean;
}

export interface SelectionState {
  start: Coordinate | null;
  current: Coordinate | null;
  cells: Coordinate[];
  text: string;
}
