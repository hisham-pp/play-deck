import type {
  Coordinate,
  GridSize,
  GridTheme,
  WordPlacement,
  WordSearchGrid,
} from '../types/word-search.types';

// ─── Word Decks ──────────────────────────────────────────────────────────────

const WORD_DECKS: Record<GridTheme, string[]> = {
  animals: [
    'ELEPHANT',
    'GIRAFFE',
    'PENGUIN',
    'DOLPHIN',
    'CHEETAH',
    'BUFFALO',
    'LEOPARD',
    'GORILLA',
    'OCTOPUS',
    'PANTHER',
    'FLAMINGO',
    'HAMSTER',
    'JAGUAR',
    'FALCON',
    'BADGER',
    'RABBIT',
    'TURTLE',
    'COBRA',
    'EAGLE',
    'LLAMA',
    'WOLF',
    'BEAR',
    'LION',
    'CROW',
    'FROG',
  ],
  countries: [
    'BRAZIL',
    'FRANCE',
    'CANADA',
    'MEXICO',
    'JAPAN',
    'GERMANY',
    'NIGERIA',
    'TURKEY',
    'SWEDEN',
    'POLAND',
    'THAILAND',
    'VIETNAM',
    'UKRAINE',
    'PORTUGAL',
    'MOROCCO',
    'KENYA',
    'EGYPT',
    'SPAIN',
    'ITALY',
    'INDIA',
    'PERU',
    'CHILE',
    'IRAQ',
    'CUBA',
    'IRAN',
  ],
  food: [
    'SPAGHETTI',
    'AVOCADO',
    'BROCCOLI',
    'PUMPKIN',
    'CHICKEN',
    'PANCAKE',
    'NOODLES',
    'BURRITO',
    'LOBSTER',
    'WAFFLE',
    'MUFFIN',
    'PRETZEL',
    'SALMON',
    'LEMON',
    'OLIVE',
    'MANGO',
    'PASTA',
    'PIZZA',
    'SUSHI',
    'BACON',
    'CAKE',
    'RICE',
    'CORN',
    'KIWI',
    'PLUM',
  ],
  science: [
    'MOLECULE',
    'ELECTRON',
    'NEUTRON',
    'PROTON',
    'PHOTON',
    'GRAVITY',
    'QUANTUM',
    'NITROGEN',
    'OXYGEN',
    'HYDROGEN',
    'NUCLEUS',
    'PLASMA',
    'FUSION',
    'FISSION',
    'ENTROPY',
    'MAGNET',
    'OPTICS',
    'LASER',
    'PRISM',
    'ORBIT',
    'ATOM',
    'CELL',
    'GENE',
    'WAVE',
    'ECHO',
  ],
  sports: [
    'BASKETBALL',
    'VOLLEYBALL',
    'SWIMMING',
    'BASEBALL',
    'FOOTBALL',
    'CRICKET',
    'HOCKEY',
    'TENNIS',
    'BOXING',
    'CYCLING',
    'ARCHERY',
    'SAILING',
    'SKATING',
    'FENCING',
    'ROWING',
    'RUGBY',
    'POLO',
    'GOLF',
    'JUDO',
    'SURF',
    'YOGA',
    'DIVE',
    'RACE',
    'KICK',
    'JUMP',
  ],
  mixed: [
    'ADVENTURE',
    'CHAMPION',
    'DISCOVER',
    'EXPLORER',
    'FRONTIER',
    'PHOENIX',
    'HORIZON',
    'MYSTERY',
    'TRIUMPH',
    'JOURNEY',
    'CRYSTAL',
    'DRAGON',
    'WIZARD',
    'CASTLE',
    'BRIDGE',
    'PLANET',
    'GALAXY',
    'THUNDER',
    'SHADOW',
    'FOREST',
    'RIVER',
    'OCEAN',
    'STORM',
    'LIGHT',
    'CROWN',
  ],
};

// ─── Directions ───────────────────────────────────────────────────────────────

const DIRECTIONS: Array<[number, number]> = [
  [0, 1], // right
  [0, -1], // left
  [1, 0], // down
  [-1, 0], // up
  [1, 1], // down-right
  [1, -1], // down-left
  [-1, 1], // up-right
  [-1, -1], // up-left
];

// ─── Grid Size Map ────────────────────────────────────────────────────────────

const SIZE_MAP: Record<GridSize, number> = {
  small: 10,
  medium: 12,
  large: 15,
};

const WORD_COUNT_MAP: Record<GridSize, number> = {
  small: 8,
  medium: 12,
  large: 16,
};

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

function randomLetter(): string {
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number,
  size: number,
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number,
): WordPlacement {
  const coordinates: Coordinate[] = [];
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    grid[r][c] = word[i];
    coordinates.push({ row: r, col: c });
  }
  return {
    word,
    start: { row, col },
    end: { row: row + dr * (word.length - 1), col: col + dc * (word.length - 1) },
    direction: [dr, dc],
    coordinates,
    found: false,
    claimedBy: null,
    claimedAt: null,
  };
}

function tryPlaceWord(grid: string[][], word: string, size: number): WordPlacement | null {
  // Shuffle directions and try random positions
  const dirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);
  for (let attempt = 0; attempt < 100; attempt++) {
    const [dr, dc] = dirs[attempt % dirs.length];
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (canPlace(grid, word, row, col, dr, dc, size)) {
      return placeWord(grid, word, row, col, dr, dc);
    }
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateGrid(theme: GridTheme, size: GridSize): WordSearchGrid {
  const n = SIZE_MAP[size];
  const wordCount = WORD_COUNT_MAP[size];

  // Start with empty grid
  const letterGrid: string[][] = Array.from({ length: n }, () => Array(n).fill(''));

  // Pick words: prefer longer words for larger grids
  const pool = [...WORD_DECKS[theme]].sort(() => Math.random() - 0.5);
  const chosen: string[] = [];
  for (const w of pool) {
    if (w.length <= n - 1 && chosen.length < wordCount) {
      chosen.push(w);
    }
  }

  // Place all chosen words
  const placements: WordPlacement[] = [];
  for (const word of chosen) {
    const p = tryPlaceWord(letterGrid, word, n);
    if (p) placements.push(p);
  }

  // Fill remaining cells with random letters
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (letterGrid[r][c] === '') letterGrid[r][c] = randomLetter();
    }
  }

  return { size: n, letters: letterGrid, placements, theme };
}

export function validateSelection(
  grid: WordSearchGrid,
  cells: Coordinate[],
  foundWordSet: Set<string>,
): WordPlacement | null {
  if (cells.length < 2) return null;

  // Check if cells form a straight line in one of 8 directions
  const dr = cells[1].row - cells[0].row;
  const dc = cells[1].col - cells[0].col;

  // Normalize direction
  const magR = Math.abs(dr);
  const magC = Math.abs(dc);
  if (magR > 1 || magC > 1 || (magR === 0 && magC === 0)) return null;

  for (let i = 1; i < cells.length; i++) {
    if (cells[i].row - cells[i - 1].row !== dr || cells[i].col - cells[i - 1].col !== dc) {
      return null;
    }
  }

  const selected = cells.map((c) => grid.letters[c.row][c.col]).join('');
  const reversed = selected.split('').reverse().join('');

  for (const placement of grid.placements) {
    if (foundWordSet.has(placement.word)) continue;
    if (placement.word === selected || placement.word === reversed) {
      return placement;
    }
  }
  return null;
}

export function scoreWord(word: string, claimTimeMs: number, gameStartMs: number): number {
  const base = word.length * 10;
  const elapsed = Math.max(0, claimTimeMs - gameStartMs);
  const speedBonus = Math.max(0, 50 - Math.floor(elapsed / 1000));
  return base + speedBonus;
}
