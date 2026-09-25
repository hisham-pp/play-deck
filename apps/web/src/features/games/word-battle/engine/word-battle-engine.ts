export type WordBattleMode =
  'classic' | 'speed' | 'longest-word' | 'anagram-battle' | 'team-battle';

export type DuplicateRule = 'cancelled' | 'reduced' | 'none';

export type WordBattlePhase = 'lobby' | 'playing' | 'round-review' | 'game-over';

export interface LetterTile {
  id: string;
  char: string;
  points: number;
  isRare: boolean;
}

export interface SubmittedWord {
  word: string;
  playerId: string;
  playerName: string;
  timestamp: number;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  isDuplicate: boolean;
  duplicateWithPlayerIds: string[];
  isPangram: boolean;
  isLongestWord?: boolean;
}

export interface WordBattlePlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  team?: 'red' | 'blue';
  score: number;
  roundScore: number;
  wordsSubmitted: string[];
  lastWordSubmitted?: string;
  comboStreak: number;
  isReady: boolean;
  nextBotSubmitCooldown?: number;
}

export interface WordBattleRound {
  roundNumber: number;
  totalRounds: number;
  letters: string[];
  durationSeconds: number;
  timeRemaining: number;
  targetAnagram?: string;
  validWordsCount?: number;
}

export interface WordBattleConfig {
  mode: WordBattleMode;
  duplicateRule: DuplicateRule;
  roundDurationSeconds: number;
  totalRounds: number;
  botCount: number;
  roomCode?: string;
}

export interface WordBattleState {
  phase: WordBattlePhase;
  config: WordBattleConfig;
  currentRound: WordBattleRound;
  players: WordBattlePlayer[];
  submissions: SubmittedWord[];
  activePlayerId: string;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: 'too-short' | 'invalid-letters' | 'already-submitted' | 'not-in-dictionary';
  score?: number;
  isPangram?: boolean;
}

// Letter points mapping
export const LETTER_POINTS: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

export const RARE_LETTERS = new Set(['J', 'K', 'Q', 'V', 'W', 'X', 'Z']);

export function getLetterPoints(char: string): number {
  return LETTER_POINTS[char.toUpperCase()] ?? 1;
}

export function isRareLetter(char: string): boolean {
  return RARE_LETTERS.has(char.toUpperCase());
}

// Curated high-potential letter racks with guaranteed multiple anagrams and sub-words
export const CURATED_RACKS: Array<{ letters: string[]; targetAnagram: string }> = [
  { letters: ['S', 'T', 'A', 'R', 'E', 'D', 'S'], targetAnagram: 'STARED' },
  { letters: ['P', 'L', 'A', 'N', 'E', 'T', 'S'], targetAnagram: 'PLANETS' },
  { letters: ['C', 'O', 'U', 'R', 'A', 'G', 'E'], targetAnagram: 'COURAGE' },
  { letters: ['F', 'L', 'O', 'A', 'T', 'I', 'N', 'G'], targetAnagram: 'FLOATING' },
  { letters: ['S', 'P', 'R', 'I', 'N', 'G', 'S'], targetAnagram: 'SPRINGS' },
  { letters: ['B', 'R', 'I', 'G', 'H', 'T', 'S'], targetAnagram: 'BRIGHTS' },
  { letters: ['T', 'H', 'U', 'N', 'D', 'E', 'R'], targetAnagram: 'THUNDER' },
  { letters: ['W', 'H', 'I', 'S', 'P', 'E', 'R'], targetAnagram: 'WHISPER' },
  { letters: ['D', 'A', 'N', 'C', 'E', 'R', 'S'], targetAnagram: 'DANCERS' },
  { letters: ['M', 'O', 'N', 'S', 'T', 'E', 'R'], targetAnagram: 'MONSTER' },
  { letters: ['F', 'O', 'R', 'E', 'S', 'T', 'S'], targetAnagram: 'FORESTS' },
  { letters: ['C', 'H', 'A', 'M', 'P', 'I', 'O', 'N'], targetAnagram: 'CHAMPION' },
  { letters: ['B', 'L', 'A', 'N', 'K', 'E', 'T'], targetAnagram: 'BLANKET' },
  { letters: ['G', 'A', 'R', 'D', 'E', 'N', 'S'], targetAnagram: 'GARDENS' },
  { letters: ['P', 'A', 'I', 'N', 'T', 'E', 'R'], targetAnagram: 'PAINTER' },
  { letters: ['Q', 'U', 'A', 'R', 'T', 'E', 'R'], targetAnagram: 'QUARTER' },
  { letters: ['Z', 'E', 'B', 'R', 'A', 'E', 'S'], targetAnagram: 'ZEBRAS' },
  { letters: ['J', 'O', 'U', 'R', 'N', 'E', 'Y'], targetAnagram: 'JOURNEY' },
  { letters: ['K', 'I', 'N', 'G', 'D', 'O', 'M'], targetAnagram: 'KINGDOM' },
  { letters: ['F', 'E', 'A', 'T', 'H', 'E', 'R'], targetAnagram: 'FEATHER' },
  { letters: ['T', 'R', 'E', 'A', 'S', 'U', 'R', 'E'], targetAnagram: 'TREASURE' },
  { letters: ['W', 'O', 'N', 'D', 'E', 'R', 'S'], targetAnagram: 'WONDERS' },
];

// Rich embedded vocabulary covering all curated racks and common English words (3-9 letters)
export const EMBEDDED_DICTIONARY: Set<string> = new Set([
  // STAR/STARED/RATES stems
  'STAR',
  'STARS',
  'STARED',
  'STARE',
  'RATES',
  'RATE',
  'RATED',
  'TEARS',
  'TEAR',
  'DARES',
  'DARE',
  'DARED',
  'DATES',
  'DATE',
  'DATED',
  'TRADES',
  'TRADE',
  'TRADED',
  'READS',
  'READ',
  'DEARS',
  'DEAR',
  'RESTS',
  'REST',
  'SEAT',
  'SEATS',
  'EAST',
  'TREAD',
  'TREADS',
  'STEER',
  'STARE',
  'ARTS',
  'RATS',
  'TARS',
  'EARS',
  'ERAS',
  'SEAR',
  'ARES',
  // PLANETS/PLANTS stems
  'PLANET',
  'PLANETS',
  'PLANT',
  'PLANTS',
  'PANEL',
  'PANELS',
  'PLATE',
  'PLATES',
  'PLANE',
  'PLANES',
  'LEAST',
  'TALES',
  'TALE',
  'SLATE',
  'STALE',
  'PLEAT',
  'PLEATS',
  'LANE',
  'LANES',
  'LEAN',
  'LEANS',
  'NEAT',
  'PALE',
  'PALES',
  'PEAL',
  'PEALS',
  'PLEA',
  'PLEAS',
  'SALT',
  'LAST',
  'SLAT',
  'LATE',
  'TAPE',
  'TAPES',
  'STEP',
  'PEST',
  'PETS',
  'PATS',
  'TAPS',
  'SPAT',
  'PAST',
  'NETS',
  'NEST',
  'SENT',
  // COURAGE stems
  'COURAGE',
  'GRACE',
  'ROUGE',
  'ROGUE',
  'CARGO',
  'ARGUE',
  'URGE',
  'URGES',
  'GEAR',
  'GEARS',
  'RACE',
  'RACES',
  'CARE',
  'CARES',
  'CORE',
  'CORES',
  'CURE',
  'CURES',
  'ACRE',
  'ACRES',
  'ORCA',
  'ORCAS',
  'RAGE',
  'RAGES',
  'CAGE',
  'CAGES',
  'AGREED',
  'AGREE',
  'SOUR',
  'SCOUR',
  'COURT',
  // FLOATING stems
  'FLOAT',
  'FLOATS',
  'FLOATING',
  'FLINT',
  'FLINTS',
  'ALOFT',
  'FOAL',
  'FOALS',
  'LOFT',
  'LOFTS',
  'LION',
  'LIONS',
  'TAIL',
  'TAILS',
  'TOIL',
  'TOILS',
  'LINT',
  'FLAT',
  'FLATS',
  'FOIL',
  'FOILS',
  'GOAT',
  'GOATS',
  'GAIN',
  'GAINS',
  'GIANT',
  'GIANTS',
  'ALONG',
  'LINGO',
  // SPRINGS stems
  'SPRING',
  'SPRINGS',
  'RING',
  'RINGS',
  'GRIN',
  'GRINS',
  'PING',
  'PINGS',
  'GRIP',
  'GRIPS',
  'PRIG',
  'PRIGS',
  'SING',
  'SINGS',
  'SIGN',
  'SIGNS',
  'SPIN',
  'SPINS',
  'SNIP',
  'SNIPS',
  'PIGS',
  'PINS',
  'NIPS',
  'RIPS',
  'TRIP',
  'TRIPS',
  // BRIGHTS stems
  'BRIGHT',
  'BRIGHTS',
  'RIGHT',
  'RIGHTS',
  'SIGHT',
  'SIGHTS',
  'SHIRT',
  'SHIRTS',
  'BIRTH',
  'BIRTHS',
  'GIRTH',
  'GIRTHS',
  'GRIT',
  'GRITS',
  'BRIG',
  'BRIGS',
  'STIR',
  'THIS',
  'HITS',
  'BITS',
  'RIBS',
  // THUNDER stems
  'THUNDER',
  'UNDER',
  'TUNED',
  'TUNE',
  'TUNES',
  'HERD',
  'HERDS',
  'HUNT',
  'HUNTS',
  'HURT',
  'HURTS',
  'TREND',
  'TRENDS',
  'TRUE',
  'DENT',
  'DENTS',
  'RUDE',
  'NUDE',
  'DUET',
  'DUETS',
  'RENT',
  'RENTS',
  'DUNE',
  'DUNES',
  'TURN',
  'TURNS',
  // WHISPER stems
  'WHISPER',
  'WIPES',
  'WIPE',
  'WIPED',
  'SHIRE',
  'SHREW',
  'HEIRS',
  'HEIR',
  'PERISH',
  'RIPES',
  'RIPE',
  'WIRE',
  'WIRES',
  'WISH',
  'SHIP',
  'SHIPS',
  'HIPS',
  'SIRE',
  'RISE',
  'WISE',
  'WHERES',
  'WHERE',
  // DANCERS stems
  'DANCER',
  'DANCERS',
  'DANCE',
  'DANCES',
  'CANES',
  'CANE',
  'CRANE',
  'CRANES',
  'ACRES',
  'CARDS',
  'CARD',
  'SCARE',
  'CEDAR',
  'CEDARS',
  'SAND',
  'ACED',
  'ACES',
  'RACE',
  // MONSTER stems
  'MONSTER',
  'MENTOR',
  'MENTORS',
  'STONE',
  'STONES',
  'TONES',
  'TONE',
  'NOTES',
  'NOTE',
  'TERMS',
  'TERM',
  'MORES',
  'MORE',
  'SMOTE',
  'SMORE',
  'STEM',
  'STEMS',
  'MOST',
  'REST',
  'SORE',
  'ROSE',
  'NOSE',
  'ONES',
  // FORESTS stems
  'FOREST',
  'FORESTS',
  'FORTE',
  'FORTES',
  'STORE',
  'STORES',
  'FROST',
  'FROSTS',
  'FORTS',
  'FORT',
  'SOFTS',
  'SOFT',
  'SORE',
  'ROSE',
  'ROTE',
  'FRET',
  'FRETS',
  'FOES',
  'TOES',
  // CHAMPION stems
  'CHAMPION',
  'CHAMP',
  'CHAMPS',
  'MARCH',
  'CHAIN',
  'CHAINS',
  'PIANO',
  'PIANOS',
  'MINOR',
  'MINORS',
  'MANIC',
  'COIN',
  'COINS',
  'ICON',
  'ICONS',
  'CAMP',
  'CAMPS',
  'CHOP',
  'CHOPS',
  'MAIN',
  'ROAM',
  'MICA',
  'CHIN',
  'CHINS',
  // BLANKET stems
  'BLANKET',
  'BLEAT',
  'BLEATS',
  'TABLE',
  'TABLES',
  'TALK',
  'TALKS',
  'BANK',
  'BANKS',
  'BEAT',
  'BEATS',
  'BAKE',
  'BAKES',
  'LATE',
  'LANE',
  'LEAN',
  'TALE',
  'BALE',
  'BEAK',
  'KALE',
  'LEAK',
  'TEAL',
  // GARDENS stems
  'GARDEN',
  'GARDENS',
  'GRADE',
  'GRADES',
  'DANGER',
  'DANGERS',
  'GRAND',
  'RANGE',
  'RANGES',
  'GEAR',
  'GEARS',
  'DRAG',
  'DRAGS',
  'READ',
  'DEAR',
  'AGED',
  'AGES',
  // PAINTER stems
  'PAINTER',
  'TRAIN',
  'TRAINS',
  'PAINT',
  'PAINTS',
  'TAPER',
  'TAPERS',
  'PRINT',
  'PRINTS',
  'PATER',
  'INERT',
  'INTER',
  'PART',
  'PARTS',
  'TRAP',
  'TRAPS',
  'PINE',
  'PINES',
  'RAIN',
  'RAINS',
  // QUARTER stems
  'QUARTER',
  'QUART',
  'QUARTS',
  'EQUAL',
  'EQUALS',
  'TRUE',
  'RATE',
  'TEAR',
  'REAR',
  'RARE',
  'RERUN',
  'AURA',
  // ZEBRAS stems
  'ZEBRA',
  'ZEBRAS',
  'BLAZE',
  'BLAZES',
  'BARE',
  'BARES',
  'BEAR',
  'BEARS',
  'BASE',
  'BRAE',
  'BRAES',
  'RAZE',
  'RAZES',
  'SEAR',
  // JOURNEY stems
  'JOURNEY',
  'ENJOY',
  'ENJOYS',
  'YEAR',
  'YEARS',
  'JURY',
  'YOUR',
  'RUNNY',
  'ROUEN',
  'JEON',
  // KINGDOM stems
  'KINGDOM',
  'DINGO',
  'DINGOS',
  'MIND',
  'MINDS',
  'MONK',
  'MONKS',
  'KIND',
  'KINDS',
  'KING',
  'KINGS',
  'GOING',
  'DOING',
  'MOD',
  'DIM',
  'INK',
  // Common 3-8 letter words
  'ACT',
  'ADD',
  'AGE',
  'AGO',
  'AIR',
  'ALL',
  'AND',
  'ANY',
  'APE',
  'APT',
  'ARM',
  'ART',
  'ASH',
  'ASK',
  'ATE',
  'BAD',
  'BAG',
  'BAN',
  'BAR',
  'BAT',
  'BAY',
  'BED',
  'BEE',
  'BEG',
  'BET',
  'BID',
  'BIG',
  'BIN',
  'BIT',
  'BOB',
  'BOG',
  'BOW',
  'BOX',
  'BOY',
  'BUG',
  'BUN',
  'BUS',
  'BUT',
  'BUY',
  'BYE',
  'CAB',
  'CAN',
  'CAP',
  'CAR',
  'CAT',
  'COW',
  'CRY',
  'CUP',
  'CUT',
  'DAD',
  'DAY',
  'DEN',
  'DEW',
  'DID',
  'DIE',
  'DIG',
  'DIM',
  'DIP',
  'DOG',
  'DOT',
  'DRY',
  'DUE',
  'EAR',
  'EAT',
  'EGG',
  'ELF',
  'ELM',
  'END',
  'ERA',
  'EVE',
  'EYE',
  'FAN',
  'FAR',
  'FAT',
  'FED',
  'FEE',
  'FEW',
  'FIT',
  'FIX',
  'FLY',
  'FOG',
  'FOR',
  'FOX',
  'FUN',
  'FUR',
  'GAP',
  'GAS',
  'GEL',
  'GEM',
  'GET',
  'GIG',
  'GIN',
  'GOD',
  'GUM',
  'GUN',
  'GUT',
  'GUY',
  'HAD',
  'HAM',
  'HAT',
  'HAY',
  'HEM',
  'HEN',
  'HER',
  'HIM',
  'HIP',
  'HIT',
  'HOP',
  'HOT',
  'HOW',
  'HUB',
  'HUG',
  'HUM',
  'HUT',
  'ICE',
  'ILL',
  'INK',
  'INN',
  'ION',
  'IRK',
  'IVY',
  'JAM',
  'JAR',
  'JAW',
  'JAY',
  'JET',
  'JIG',
  'JOB',
  'JOG',
  'JOY',
  'JUG',
  'KEG',
  'KEY',
  'KID',
  'KIN',
  'KIT',
  'LAB',
  'LAD',
  'LAP',
  'LAW',
  'LAY',
  'LED',
  'LEG',
  'LET',
  'LID',
  'LIE',
  'LIP',
  'LOG',
  'LOT',
  'LOW',
  'MAD',
  'MAN',
  'MAP',
  'MAT',
  'MAY',
  'MEN',
  'MET',
  'MIX',
  'MOB',
  'MOP',
  'MUD',
  'MUG',
  'NET',
  'NEW',
  'NOD',
  'NOT',
  'NOW',
  'NUT',
  'OAK',
  'OAR',
  'ODD',
  'OFF',
  'OIL',
  'OLD',
  'ONE',
  'ORE',
  'OWL',
  'OWN',
  'PAN',
  'PAT',
  'PAW',
  'PAY',
  'PEA',
  'PEN',
  'PET',
  'PIE',
  'PIG',
  'PIN',
  'PIT',
  'PLY',
  'POD',
  'POP',
  'POT',
  'PRO',
  'PUN',
  'PUP',
  'RAG',
  'RAM',
  'RAN',
  'RAP',
  'RAT',
  'RAW',
  'RAY',
  'RED',
  'RIB',
  'RID',
  'RIG',
  'RIM',
  'RIP',
  'ROB',
  'ROD',
  'ROT',
  'ROW',
  'RUB',
  'RUG',
  'RUN',
  'RUT',
  'RYE',
  'SAD',
  'SAG',
  'SAP',
  'SAT',
  'SAW',
  'SAY',
  'SEA',
  'SET',
  'SEW',
  'SHE',
  'SHY',
  'SIN',
  'SIP',
  'SIR',
  'SIT',
  'SIX',
  'SKI',
  'SKY',
  'SLY',
  'SOB',
  'SON',
  'SOW',
  'SOY',
  'SPY',
  'SUM',
  'SUN',
  'TAB',
  'TAG',
  'TAN',
  'TAP',
  'TAR',
  'TAX',
  'TEA',
  'TEN',
  'TIE',
  'TIN',
  'TIP',
  'TOE',
  'TOP',
  'TOY',
  'TRY',
  'TUB',
  'TUG',
  'TWO',
  'USE',
  'VAN',
  'VAT',
  'VET',
  'VOW',
  'WAR',
  'WAX',
  'WAY',
  'WEB',
  'WED',
  'WET',
  'WHO',
  'WHY',
  'WIG',
  'WIN',
  'WIT',
  'WOE',
  'WON',
  'YAK',
  'YAM',
  'YAP',
  'YEA',
  'YES',
  'YET',
  'YEW',
  'YOU',
  'ZIP',
  'ZOO',
  // Common 4-letter words
  'ABLE',
  'ACRE',
  'AGED',
  'ALLY',
  'ALSO',
  'ARCH',
  'ARMY',
  'AUNT',
  'AWAY',
  'BABY',
  'BACK',
  'BAKE',
  'BALL',
  'BAND',
  'BANK',
  'BARK',
  'BARN',
  'BASE',
  'BEAM',
  'BEAN',
  'BEAR',
  'BEAT',
  'BELL',
  'BELT',
  'BEND',
  'BIRD',
  'BITE',
  'BLOW',
  'BLUE',
  'BOAT',
  'BOND',
  'BONE',
  'BOOK',
  'BOOT',
  'BORN',
  'BOWL',
  'BULK',
  'BURN',
  'BUSH',
  'BUSY',
  'CAKE',
  'CALL',
  'CALM',
  'CAMP',
  'CARD',
  'CARE',
  'CART',
  'CASE',
  'CAST',
  'CAVE',
  'CELL',
  'CHAT',
  'CHIP',
  'CITY',
  'CLAY',
  'CLUB',
  'COAL',
  'COAT',
  'COIN',
  'COLD',
  'COOK',
  'COOL',
  'COPE',
  'COPY',
  'CORE',
  'CORN',
  'COST',
  'CREW',
  'CROP',
  'CROW',
  'DAWN',
  'DEAL',
  'DEAR',
  'DECK',
  'DEED',
  'DEER',
  'DESK',
  'DIAL',
  'DIET',
  'DIRT',
  'DISC',
  'DISH',
  'DISK',
  'DOOR',
  'DOSE',
  'DOWN',
  'DRAW',
  'DROP',
  'DRUM',
  'DUCK',
  'DUST',
  'DUTY',
  'EACH',
  'EARN',
  'EASY',
  'EDGE',
  'EXIT',
  'FACE',
  'FACT',
  'FADE',
  'FAIL',
  'FAIR',
  'FALL',
  'FAME',
  'FARM',
  'FAST',
  'FATE',
  'FEAR',
  'FEED',
  'FEEL',
  'FILE',
  'FILL',
  'FILM',
  'FIND',
  'FINE',
  'FIRE',
  'FIRM',
  'FISH',
  'FLAG',
  'FLAT',
  'FLEE',
  'FLOW',
  'FOLK',
  'FOOD',
  'FOOT',
  'FORK',
  'FORM',
  'FORT',
  'FREE',
  'FROG',
  'FUEL',
  'FULL',
  'GAIN',
  'GAME',
  'GATE',
  'GEAR',
  'GIFT',
  'GIRL',
  'GIVE',
  'GLAD',
  'GLOW',
  'GOAL',
  'GOLD',
  'GOOD',
  'GRAB',
  'GRAY',
  'GREW',
  'GRID',
  'GRIN',
  'GRIP',
  'GROW',
  'GULF',
  'HAIR',
  'HALF',
  'HALL',
  'HALT',
  'HAND',
  'HANG',
  'HARD',
  'HARM',
  'HATE',
  'HAVE',
  'HAWK',
  'HEAD',
  'HEAL',
  'HEAP',
  'HEAT',
  'HEEL',
  'HELP',
  'HERB',
  'HERO',
  'HIDE',
  'HIGH',
  'HILL',
  'HINT',
  'HIRE',
  'HOLD',
  'HOLE',
  'HOME',
  'HOOK',
  'HOPE',
  'HORN',
  'HOSE',
  'HOST',
  'HOUR',
  'HUGE',
  'HUNT',
  'HURT',
  'IDEA',
  'INCH',
  'IRON',
  'ITEM',
  'JOIN',
  'JOKE',
  'JUMP',
  'JURY',
  'KEEP',
  'KICK',
  'KILL',
  'KIND',
  'KING',
  'KISS',
  'KITE',
  'KNEE',
  'KNOT',
  'KNOW',
  'LACK',
  'LADY',
  'LAID',
  'LAKE',
  'LAMB',
  'LAMP',
  'LAND',
  'LANE',
  'LAST',
  'LATE',
  'LEAD',
  'LEAF',
  'LEAK',
  'LEAN',
  'LEAP',
  'LEFT',
  'LEND',
  'LIFE',
  'LIFT',
  'LIKE',
  'LINE',
  'LINK',
  'LION',
  'LIPS',
  'LIST',
  'LIVE',
  'LOAD',
  'LOAN',
  'LOCK',
  'LONG',
  'LOOK',
  'LORD',
  'LOSE',
  'LOSS',
  'LOST',
  'LOVE',
  'LUCK',
  'LUMP',
  'LUNG',
  'MAIL',
  'MAIN',
  'MAKE',
  'MALE',
  'MALL',
  'MANY',
  'MARK',
  'MASK',
  'MASS',
  'MATE',
  'MEAL',
  'MEAN',
  'MEAT',
  'MEET',
  'MELT',
  'MEND',
  'MENU',
  'MESS',
  'MILD',
  'MILE',
  'MILK',
  'MILL',
  'MIND',
  'MINE',
  'MINT',
  'MISS',
  'MODE',
  'MOOD',
  'MOON',
  'MORE',
  'MOSS',
  'MOST',
  'MOVE',
  'MUCH',
  'NAME',
  'NAVY',
  'NEAR',
  'NEAT',
  'NECK',
  'NEED',
  'NEST',
  'NEWS',
  'NEXT',
  'NICE',
  'NINE',
  'NODE',
  'NOON',
  'NOSE',
  'NOTE',
  'OKAY',
  'ONCE',
  'ONLY',
  'OPEN',
  'ORAL',
  'OVER',
  'PACE',
  'PACK',
  'PAGE',
  'PAIN',
  'PAIR',
  'PALE',
  'PALM',
  'PARK',
  'PART',
  'PASS',
  'PAST',
  'PATH',
  'PEAK',
  'PEAR',
  'PEER',
  'PICK',
  'PIER',
  'PILE',
  'PILL',
  'PINE',
  'PINK',
  'PIPE',
  'PLAN',
  'PLAY',
  'PLOT',
  'PLUG',
  'POEM',
  'POET',
  'POLE',
  'POLL',
  'POOL',
  'POOR',
  'PORT',
  'POST',
  'POUR',
  'PRAY',
  'PULL',
  'PUMP',
  'PURE',
  'PUSH',
  'RACE',
  'RAID',
  'RAIL',
  'RAIN',
  'RANK',
  'RARE',
  'RATE',
  'READ',
  'REAL',
  'REAR',
  'RELY',
  'RENT',
  'REST',
  'RICE',
  'RICH',
  'RIDE',
  'RING',
  'RISE',
  'RISK',
  'ROAD',
  'ROAR',
  'ROCK',
  'ROOF',
  'ROOM',
  'ROOT',
  'ROPE',
  'ROSE',
  'RUIN',
  'RULE',
  'RUSH',
  'SAFE',
  'SAIL',
  'SALE',
  'SALT',
  'SAME',
  'SAND',
  'SAVE',
  'SCAN',
  'SEAL',
  'SEAT',
  'SEED',
  'SEEK',
  'SEEM',
  'SEEN',
  'SELF',
  'SELL',
  'SEND',
  'SHED',
  'SHIP',
  'SHOE',
  'SHOP',
  'SHOT',
  'SHOW',
  'SHUT',
  'SICK',
  'SIDE',
  'SIGN',
  'SILK',
  'SING',
  'SINK',
  'SITE',
  'SIZE',
  'SKIN',
  'SKIP',
  'SLAP',
  'SLIP',
  'SLOW',
  'SNAP',
  'SNOW',
  'SOAP',
  'SOIL',
  'SOLO',
  'SONG',
  'SOON',
  'SOUL',
  'SOUP',
  'SPAN',
  'SPIN',
  'SPOT',
  'STAR',
  'STAY',
  'STEM',
  'STEP',
  'STIR',
  'STOP',
  'SUIT',
  'SURE',
  'SWIM',
  'TAIL',
  'TAKE',
  'TALE',
  'TALK',
  'TALL',
  'TANK',
  'TAPE',
  'TASK',
  'TEAM',
  'TEAR',
  'TELL',
  'TENT',
  'TERM',
  'TEST',
  'TEXT',
  'THIN',
  'TIDE',
  'TIDY',
  'TIED',
  'TIME',
  'TINY',
  'TIRE',
  'TOLL',
  'TONE',
  'TOOK',
  'TOOL',
  'TOUR',
  'TOWN',
  'TRAP',
  'TRAY',
  'TREE',
  'TRIM',
  'TRIP',
  'TRUE',
  'TUBE',
  'TUNE',
  'TURN',
  'TWIN',
  'UNIT',
  'UPON',
  'URGE',
  'USED',
  'USER',
  'VAST',
  'VEIL',
  'VEIN',
  'VENT',
  'VERY',
  'VIEW',
  'VINE',
  'VOLT',
  'VOTE',
  'WAGE',
  'WAIT',
  'WAKE',
  'WALK',
  'WALL',
  'WANT',
  'WARD',
  'WARM',
  'WARN',
  'WASH',
  'WAVE',
  'WEAK',
  'WEAR',
  'WEEK',
  'WELL',
  'WENT',
  'WEST',
  'WILD',
  'WILL',
  'WIND',
  'WINE',
  'WING',
  'WIPE',
  'WIRE',
  'WISE',
  'WISH',
  'WOOD',
  'WOOL',
  'WORD',
  'WORK',
  'WORM',
  'YARD',
  'YEAR',
  'ZERO',
  'ZONE',
]);

/**
 * Checks if a candidate word can be formed strictly using the letters in rack,
 * respecting letter multiplicity.
 */
export function canFormFromRack(word: string, rack: string[]): boolean {
  const upperWord = word.trim().toUpperCase();
  if (upperWord.length < 3) return false;

  const rackCounts: Record<string, number> = {};
  for (const letter of rack) {
    const char = letter.toUpperCase();
    rackCounts[char] = (rackCounts[char] || 0) + 1;
  }

  for (const char of upperWord) {
    if (!rackCounts[char] || rackCounts[char] <= 0) {
      return false;
    }
    rackCounts[char] -= 1;
  }

  return true;
}

/**
 * Validates word existence against dictionary (embedded set or external set).
 */
export function isWordInDictionary(word: string, externalDict?: Set<string>): boolean {
  const upper = word.trim().toUpperCase();
  if (EMBEDDED_DICTIONARY.has(upper)) return true;
  if (externalDict && externalDict.has(upper)) return true;
  return false;
}

/**
 * Calculates raw points for a submitted word.
 */
export function calculateWordScore(
  word: string,
  rack: string[],
  mode: WordBattleMode = 'classic',
  comboStreak: number = 0,
): { baseScore: number; bonusScore: number; totalScore: number; isPangram: boolean } {
  const upper = word.trim().toUpperCase();
  const len = upper.length;

  // Length base points
  let baseScore = 0;
  if (len === 3) baseScore = 100;
  else if (len === 4) baseScore = 200;
  else if (len === 5) baseScore = 400;
  else if (len === 6) baseScore = 700;
  else if (len === 7) baseScore = 1100;
  else if (len >= 8) baseScore = 1600;

  // Letter rarity bonus
  let rarityBonus = 0;
  for (const char of upper) {
    if (char === 'Q' || char === 'Z') rarityBonus += 150;
    else if (char === 'J' || char === 'X') rarityBonus += 100;
    else if (char === 'K' || char === 'V' || char === 'W') rarityBonus += 50;
  }

  // Pangram check: uses all unique letters in rack, or matches rack length
  const rackUnique = new Set(rack.map((r) => r.toUpperCase()));
  const wordUnique = new Set(upper.split(''));
  const isPangram = len >= rack.length || [...rackUnique].every((char) => wordUnique.has(char));

  let bonusScore = rarityBonus;
  if (isPangram) {
    bonusScore += 500;
  }

  // Mode modifiers
  if (mode === 'longest-word' && len >= 6) {
    baseScore = Math.floor(baseScore * 1.5);
  } else if (mode === 'speed' && comboStreak >= 2) {
    const mult = comboStreak >= 4 ? 2.0 : 1.5;
    bonusScore += Math.floor(baseScore * (mult - 1));
  } else if (mode === 'anagram-battle' && isPangram) {
    bonusScore += 500; // Extra anagram bounty
  }

  const totalScore = baseScore + bonusScore;
  return { baseScore, bonusScore, totalScore, isPangram };
}

/**
 * Validates a word submission for a player.
 */
export function validateSubmission(
  rawWord: string,
  rack: string[],
  playerWords: string[],
  externalDict?: Set<string>,
): ValidationResult {
  const word = rawWord.trim().toUpperCase();

  if (word.length < 3) {
    return { isValid: false, reason: 'too-short' };
  }

  if (!canFormFromRack(word, rack)) {
    return { isValid: false, reason: 'invalid-letters' };
  }

  if (playerWords.some((w) => w.toUpperCase() === word)) {
    return { isValid: false, reason: 'already-submitted' };
  }

  if (!isWordInDictionary(word, externalDict)) {
    return { isValid: false, reason: 'not-in-dictionary' };
  }

  const { isPangram } = calculateWordScore(word, rack);
  return { isValid: true, isPangram };
}

/**
 * Resolves duplicate words across all submissions at round end according to DuplicateRule.
 */
export function resolveDuplicateScores(
  submissions: SubmittedWord[],
  duplicateRule: DuplicateRule,
): SubmittedWord[] {
  // Count frequency of each word (case-insensitive)
  const wordPlayerMap = new Map<string, string[]>();
  for (const sub of submissions) {
    const key = sub.word.toUpperCase();
    const existing = wordPlayerMap.get(key) || [];
    existing.push(sub.playerId);
    wordPlayerMap.set(key, existing);
  }

  // Find longest word(s)
  let maxLen = 0;
  for (const sub of submissions) {
    if (sub.word.length > maxLen) {
      maxLen = sub.word.length;
    }
  }

  return submissions.map((sub) => {
    const key = sub.word.toUpperCase();
    const playerList = wordPlayerMap.get(key) || [];
    const isDuplicate = playerList.length > 1;
    const duplicateWith = playerList.filter((id) => id !== sub.playerId);
    const isLongest = sub.word.length === maxLen && maxLen >= 5;

    let adjustedTotal = sub.totalScore;
    if (isDuplicate) {
      if (duplicateRule === 'cancelled') {
        adjustedTotal = 0;
      } else if (duplicateRule === 'reduced') {
        adjustedTotal = Math.floor(sub.totalScore * 0.5);
      }
    }

    if (isLongest && !isDuplicate) {
      adjustedTotal += 200; // Longest unique word bounty
    }

    return {
      ...sub,
      isDuplicate,
      duplicateWithPlayerIds: duplicateWith,
      isLongestWord: isLongest,
      totalScore: adjustedTotal,
    };
  });
}

/**
 * Procedural rack generation with balanced vowels and consonants.
 */
export function generateLetterRack(roundNumber: number): {
  letters: string[];
  targetAnagram?: string;
} {
  const rackIndex = (roundNumber - 1) % CURATED_RACKS.length;
  const curated = CURATED_RACKS[rackIndex];
  // Shuffle copy
  const shuffled = [...curated.letters].sort(() => Math.random() - 0.5);
  return {
    letters: shuffled,
    targetAnagram: curated.targetAnagram,
  };
}

/**
 * Bot generator with varied personalities and difficulties.
 */
export const BOT_NAMES = ['LexiBot', 'WordSmith', 'VocabViper', 'AnagramAce'];
export const BOT_AVATARS = ['🤖', '🦉', '🐍', '⚡'];

export function createBotPlayers(count: number): WordBattlePlayer[] {
  const bots: WordBattlePlayer[] = [];
  for (let i = 0; i < count; i += 1) {
    const botIndex = i % BOT_NAMES.length;
    const diff: 'easy' | 'medium' | 'hard' = i === 0 ? 'medium' : i === 1 ? 'hard' : 'easy';

    bots.push({
      id: `bot-${i + 1}`,
      name: BOT_NAMES[botIndex] + (i >= BOT_NAMES.length ? ` ${Math.floor(i / 4) + 1}` : ''),
      avatar: BOT_AVATARS[botIndex],
      isBot: true,
      botDifficulty: diff,
      team: i % 2 === 0 ? 'red' : 'blue',
      score: 0,
      roundScore: 0,
      wordsSubmitted: [],
      comboStreak: 0,
      isReady: true,
      nextBotSubmitCooldown: 3 + Math.random() * 4,
    });
  }
  return bots;
}

/**
 * Finds all possible valid dictionary words for a given letter rack.
 */
export function findAvailableWordsForRack(
  rack: string[],
  dictionary: Set<string> = EMBEDDED_DICTIONARY,
): string[] {
  const result: string[] = [];
  for (const word of dictionary) {
    if (canFormFromRack(word, rack)) {
      result.push(word);
    }
  }
  return result;
}

/**
 * Initial game state builder.
 */
export function createInitialWordBattleState(
  configPartial?: Partial<WordBattleConfig>,
  playerName: string = 'You',
): WordBattleState {
  const config: WordBattleConfig = {
    mode: 'classic',
    duplicateRule: 'cancelled',
    roundDurationSeconds: 45,
    totalRounds: 3,
    botCount: 2,
    ...configPartial,
  };

  const humanPlayer: WordBattlePlayer = {
    id: 'player-1',
    name: playerName,
    avatar: '🦊',
    isBot: false,
    team: 'red',
    score: 0,
    roundScore: 0,
    wordsSubmitted: [],
    comboStreak: 0,
    isReady: true,
  };

  const bots = createBotPlayers(config.botCount);
  const players = [humanPlayer, ...bots];

  const firstRack = generateLetterRack(1);

  return {
    phase: 'lobby',
    config,
    currentRound: {
      roundNumber: 1,
      totalRounds: config.totalRounds,
      letters: firstRack.letters,
      durationSeconds: config.roundDurationSeconds,
      timeRemaining: config.roundDurationSeconds,
      targetAnagram: firstRack.targetAnagram,
      validWordsCount: findAvailableWordsForRack(firstRack.letters).length,
    },
    players,
    submissions: [],
    activePlayerId: humanPlayer.id,
  };
}

/**
 * Starts a new round.
 */
export function startRound(state: WordBattleState, roundNumber: number): WordBattleState {
  const rackInfo = generateLetterRack(roundNumber);
  const duration = state.config.mode === 'speed' ? 30 : state.config.roundDurationSeconds;

  const resetPlayers = state.players.map((p) => ({
    ...p,
    roundScore: 0,
    wordsSubmitted: [],
    lastWordSubmitted: undefined,
    comboStreak: 0,
    nextBotSubmitCooldown: p.isBot ? 2 + Math.random() * 3 : undefined,
  }));

  return {
    ...state,
    phase: 'playing',
    submissions: [],
    players: resetPlayers,
    currentRound: {
      roundNumber,
      totalRounds: state.config.totalRounds,
      letters: rackInfo.letters,
      durationSeconds: duration,
      timeRemaining: duration,
      targetAnagram: rackInfo.targetAnagram,
      validWordsCount: findAvailableWordsForRack(rackInfo.letters).length,
    },
  };
}

/**
 * Submits a word for a player.
 */
export function submitPlayerWord(
  state: WordBattleState,
  playerId: string,
  rawWord: string,
  externalDict?: Set<string>,
): { state: WordBattleState; result: ValidationResult } {
  if (state.phase !== 'playing') {
    return {
      state,
      result: { isValid: false, reason: 'too-short' },
    };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return {
      state,
      result: { isValid: false, reason: 'too-short' },
    };
  }

  const word = rawWord.trim().toUpperCase();
  const validation = validateSubmission(
    word,
    state.currentRound.letters,
    player.wordsSubmitted,
    externalDict,
  );

  if (!validation.isValid) {
    return {
      state: {
        ...state,
        players: state.players.map((p) => (p.id === playerId ? { ...p, comboStreak: 0 } : p)),
      },
      result: validation,
    };
  }

  const scoreInfo = calculateWordScore(
    word,
    state.currentRound.letters,
    state.config.mode,
    player.comboStreak + 1,
  );

  const submission: SubmittedWord = {
    word,
    playerId,
    playerName: player.name,
    timestamp: Date.now(),
    baseScore: scoreInfo.baseScore,
    bonusScore: scoreInfo.bonusScore,
    totalScore: scoreInfo.totalScore,
    isDuplicate: false,
    duplicateWithPlayerIds: [],
    isPangram: scoreInfo.isPangram,
  };

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== playerId) return p;
    return {
      ...p,
      roundScore: p.roundScore + scoreInfo.totalScore,
      wordsSubmitted: [...p.wordsSubmitted, word],
      lastWordSubmitted: word,
      comboStreak: p.comboStreak + 1,
    };
  });

  return {
    state: {
      ...state,
      players: updatedPlayers,
      submissions: [...state.submissions, submission],
    },
    result: {
      isValid: true,
      score: scoreInfo.totalScore,
      isPangram: scoreInfo.isPangram,
    },
  };
}

/**
 * End of round resolution: resolves duplicates and accumulates overall scores.
 */
export function completeRound(state: WordBattleState): WordBattleState {
  const resolvedSubmissions = resolveDuplicateScores(state.submissions, state.config.duplicateRule);

  // Re-calculate round scores based on resolved duplicate scores
  const playerRoundScoreMap = new Map<string, number>();
  for (const sub of resolvedSubmissions) {
    const cur = playerRoundScoreMap.get(sub.playerId) || 0;
    playerRoundScoreMap.set(sub.playerId, cur + sub.totalScore);
  }

  const updatedPlayers = state.players.map((p) => {
    const roundScore = playerRoundScoreMap.get(p.id) || 0;
    return {
      ...p,
      roundScore,
      score: p.score + roundScore,
    };
  });

  const isFinalRound = state.currentRound.roundNumber >= state.config.totalRounds;

  return {
    ...state,
    phase: isFinalRound ? 'game-over' : 'round-review',
    submissions: resolvedSubmissions,
    players: updatedPlayers,
  };
}

/**
 * Deterministic engine step function. Handles round timer and simulated bot actions.
 */
export function stepWordBattleEngine(
  state: WordBattleState,
  dt: number,
  externalDict?: Set<string>,
): WordBattleState {
  if (state.phase !== 'playing') {
    return state;
  }

  const nextTimeRemaining = Math.max(0, state.currentRound.timeRemaining - dt);

  // Time expired? Complete the round!
  if (nextTimeRemaining <= 0) {
    return completeRound({
      ...state,
      currentRound: {
        ...state.currentRound,
        timeRemaining: 0,
      },
    });
  }

  let currentState: WordBattleState = {
    ...state,
    currentRound: {
      ...state.currentRound,
      timeRemaining: nextTimeRemaining,
    },
  };

  // Bot simulation step
  const rackWords = findAvailableWordsForRack(
    state.currentRound.letters,
    externalDict || EMBEDDED_DICTIONARY,
  );

  const updatedPlayers: WordBattlePlayer[] = [];

  for (const player of currentState.players) {
    if (!player.isBot) {
      updatedPlayers.push(player);
      continue;
    }

    const curCooldown = (player.nextBotSubmitCooldown ?? 3) - dt;

    if (curCooldown <= 0 && rackWords.length > 0) {
      // Find candidate words this bot hasn't submitted yet
      const candidates = rackWords.filter((w) => !player.wordsSubmitted.includes(w));

      if (candidates.length > 0) {
        // Pick according to difficulty
        let chosenWord: string;
        if (player.botDifficulty === 'hard') {
          // Prefers longer words or rare letters
          candidates.sort((a, b) => b.length - a.length);
          chosenWord = candidates[0];
        } else if (player.botDifficulty === 'medium') {
          const midLen = candidates.filter((w) => w.length >= 4 && w.length <= 6);
          chosenWord =
            midLen.length > 0 ? midLen[Math.floor(Math.random() * midLen.length)] : candidates[0];
        } else {
          // Easy bot picks 3-4 letter words
          const shortWords = candidates.filter((w) => w.length <= 4);
          chosenWord =
            shortWords.length > 0
              ? shortWords[Math.floor(Math.random() * shortWords.length)]
              : candidates[0];
        }

        const submitResult = submitPlayerWord(currentState, player.id, chosenWord, externalDict);

        currentState = submitResult.state;
        const cooldownBase =
          player.botDifficulty === 'hard' ? 3.5 : player.botDifficulty === 'medium' ? 5.0 : 7.0;

        const updatedBot = currentState.players.find((p) => p.id === player.id);
        if (updatedBot) {
          updatedPlayers.push({
            ...updatedBot,
            nextBotSubmitCooldown: cooldownBase + Math.random() * 2,
          });
        }
        continue;
      }
    }

    updatedPlayers.push({
      ...player,
      nextBotSubmitCooldown: Math.max(0, curCooldown),
    });
  }

  currentState.players = updatedPlayers;
  return currentState;
}
