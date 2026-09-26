/**
 * Drawing & Guessing Real-Time Party Game Engine
 * Pure TypeScript implementation of word banking, stroke streaming,
 * real-time guess evaluation, near-miss edit-distance detection,
 * time-decay scoring, hint revelation, and bot automation.
 */

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  color: string;
  size: number;
  points: DrawingPoint[];
  isEraser?: boolean;
}

export interface DrawingPlayer {
  id: string;
  name: string;
  isBot: boolean;
  score: number;
  hasGuessed: boolean;
  guessTimeSeconds?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  isCorrect?: boolean;
  isNearMiss?: boolean;
  timestamp: number;
}

export type DrawingPhase = 'selecting_word' | 'drawing' | 'round_reveal' | 'game_over';

export interface WordOption {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsMultiplier: number;
}

export interface DrawingGuessingState {
  players: DrawingPlayer[];
  currentRound: number;
  maxRounds: number;
  currentDrawerIndex: number;
  phase: DrawingPhase;
  secretWord: string;
  wordOptions: WordOption[];
  timerSeconds: number;
  roundDuration: number;
  strokes: DrawingStroke[];
  chatMessages: ChatMessage[];
  revealedIndices: number[]; // indices of secretWord characters currently revealed
  winnerId: string | null;
  lastActionMessage: string;
}

export const WORD_BANK: WordOption[] = [
  // Easy
  { word: 'SUN', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'CAT', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'CAR', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'TREE', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'FISH', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'BOAT', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'MOON', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'BOOK', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'STAR', difficulty: 'easy', pointsMultiplier: 1.0 },
  { word: 'APPLE', difficulty: 'easy', pointsMultiplier: 1.0 },
  // Medium
  { word: 'ROCKET', difficulty: 'medium', pointsMultiplier: 1.25 },
  { word: 'CASTLE', difficulty: 'medium', pointsMultiplier: 1.25 },
  { word: 'GUITAR', difficulty: 'medium', pointsMultiplier: 1.25 },
  { word: 'PIZZA', difficulty: 'medium', pointsMultiplier: 1.25 },
  { word: 'PENGUIN', difficulty: 'medium', pointsMultiplier: 1.25 },
  { word: 'VOLCANO', difficulty: 'medium', pointsMultiplier: 1.25 },
  { word: 'BICYCLE', difficulty: 'medium', pointsMultiplier: 1.25 },
  { word: 'PIRATE', difficulty: 'medium', pointsMultiplier: 1.25 },
  // Hard
  { word: 'ASTRONAUT', difficulty: 'hard', pointsMultiplier: 1.5 },
  { word: 'SUBMARINE', difficulty: 'hard', pointsMultiplier: 1.5 },
  { word: 'LIGHTHOUSE', difficulty: 'hard', pointsMultiplier: 1.5 },
  { word: 'TELESCOPE', difficulty: 'hard', pointsMultiplier: 1.5 },
  { word: 'HELICOPTER', difficulty: 'hard', pointsMultiplier: 1.5 },
  { word: 'ROLLERCOASTER', difficulty: 'hard', pointsMultiplier: 1.5 },
];

/**
 * Procedural vector drawings for Bot Artists when an AI player is the drawer.
 */
export const BOT_SKETCHES: Record<string, DrawingStroke[]> = {
  SUN: [
    {
      id: 's-1',
      color: '#f59e0b',
      size: 6,
      points: [
        { x: 300, y: 200 },
        { x: 350, y: 160 },
        { x: 400, y: 200 },
        { x: 350, y: 240 },
        { x: 300, y: 200 },
      ],
    },
    {
      id: 's-2',
      color: '#f59e0b',
      size: 4,
      points: [
        { x: 350, y: 140 },
        { x: 350, y: 110 },
      ],
    },
    {
      id: 's-3',
      color: '#f59e0b',
      size: 4,
      points: [
        { x: 350, y: 260 },
        { x: 350, y: 290 },
      ],
    },
    {
      id: 's-4',
      color: '#f59e0b',
      size: 4,
      points: [
        { x: 280, y: 200 },
        { x: 250, y: 200 },
      ],
    },
    {
      id: 's-5',
      color: '#f59e0b',
      size: 4,
      points: [
        { x: 420, y: 200 },
        { x: 450, y: 200 },
      ],
    },
  ],
  CAT: [
    {
      id: 'c-1',
      color: '#ffffff',
      size: 6,
      points: [
        { x: 300, y: 220 },
        { x: 350, y: 170 },
        { x: 400, y: 220 },
        { x: 350, y: 270 },
        { x: 300, y: 220 },
      ],
    },
    {
      id: 'c-2',
      color: '#ffffff',
      size: 5,
      points: [
        { x: 310, y: 180 },
        { x: 315, y: 140 },
        { x: 335, y: 170 },
      ],
    },
    {
      id: 'c-3',
      color: '#ffffff',
      size: 5,
      points: [
        { x: 365, y: 170 },
        { x: 385, y: 140 },
        { x: 390, y: 180 },
      ],
    },
    {
      id: 'c-4',
      color: '#ec4899',
      size: 3,
      points: [
        { x: 350, y: 230 },
        { x: 345, y: 225 },
        { x: 355, y: 225 },
        { x: 350, y: 230 },
      ],
    },
  ],
  CAR: [
    {
      id: 'car-1',
      color: '#3b82f6',
      size: 6,
      points: [
        { x: 200, y: 250 },
        { x: 220, y: 210 },
        { x: 300, y: 210 },
        { x: 340, y: 250 },
        { x: 460, y: 250 },
        { x: 460, y: 290 },
        { x: 200, y: 290 },
        { x: 200, y: 250 },
      ],
    },
    {
      id: 'car-2',
      color: '#1e293b',
      size: 10,
      points: [
        { x: 250, y: 295 },
        { x: 250, y: 296 },
      ],
    },
    {
      id: 'car-3',
      color: '#1e293b',
      size: 10,
      points: [
        { x: 410, y: 295 },
        { x: 410, y: 296 },
      ],
    },
  ],
  TREE: [
    {
      id: 't-1',
      color: '#78350f',
      size: 10,
      points: [
        { x: 350, y: 240 },
        { x: 350, y: 340 },
      ],
    },
    {
      id: 't-2',
      color: '#22c55e',
      size: 8,
      points: [
        { x: 350, y: 140 },
        { x: 280, y: 240 },
        { x: 420, y: 240 },
        { x: 350, y: 140 },
      ],
    },
  ],
};

/**
 * Returns 3 random word options: 1 easy, 1 medium, 1 hard.
 */
export function getThreeWordOptions(): WordOption[] {
  const easyWords = WORD_BANK.filter((w) => w.difficulty === 'easy');
  const mediumWords = WORD_BANK.filter((w) => w.difficulty === 'medium');
  const hardWords = WORD_BANK.filter((w) => w.difficulty === 'hard');

  return [
    easyWords[Math.floor(Math.random() * easyWords.length)],
    mediumWords[Math.floor(Math.random() * mediumWords.length)],
    hardWords[Math.floor(Math.random() * hardWords.length)],
  ];
}

/**
 * Initializes a new Drawing & Guessing match.
 */
export function createInitialDrawingState(options?: {
  playerCount?: number;
  playerNames?: string[];
  maxRounds?: number;
  roundDuration?: number;
}): DrawingGuessingState {
  const count = options?.playerCount ?? 4;
  const maxRounds = options?.maxRounds ?? 3;
  const roundDuration = options?.roundDuration ?? 60;
  const names = options?.playerNames ?? ['You (P1)', 'SketchBot', 'PaletteBot', 'DoodleBot'];

  const players: DrawingPlayer[] = [];
  for (let i = 0; i < count; i++) {
    players.push({
      id: `player-${i + 1}`,
      name: names[i] ?? `Player ${i + 1}`,
      isBot: i !== 0,
      score: 0,
      hasGuessed: false,
    });
  }

  const wordOptions = getThreeWordOptions();

  return {
    players,
    currentRound: 1,
    maxRounds,
    currentDrawerIndex: 0,
    phase: 'selecting_word',
    secretWord: wordOptions[0].word,
    wordOptions,
    timerSeconds: roundDuration,
    roundDuration,
    strokes: [],
    chatMessages: [
      {
        id: 'msg-start',
        senderId: 'system',
        senderName: 'PlayDeck Game Master',
        text: 'Welcome to Drawing & Guessing! Player 1 is choosing a word...',
        timestamp: Date.now(),
      },
    ],
    revealedIndices: [],
    winnerId: null,
    lastActionMessage: `${players[0].name} is choosing a word to draw!`,
  };
}

/**
 * Selects the active secret word and starts the drawing phase.
 */
export function selectSecretWord(state: DrawingGuessingState, chosenWord: string): void {
  const activeDrawer = state.players[state.currentDrawerIndex];
  state.secretWord = chosenWord.toUpperCase().trim();
  state.phase = 'drawing';
  state.timerSeconds = state.roundDuration;
  state.strokes = [];
  state.revealedIndices = [];

  // Reset guessing status for all players
  state.players.forEach((p) => {
    p.hasGuessed = false;
    p.guessTimeSeconds = undefined;
  });

  state.lastActionMessage = `${activeDrawer.name} is drawing now! Start guessing!`;
  state.chatMessages.push({
    id: `msg-draw-${Date.now()}`,
    senderId: 'system',
    senderName: 'PlayDeck Game Master',
    text: `${activeDrawer.name} started drawing! Secret word has ${state.secretWord.length} letters.`,
    timestamp: Date.now(),
  });
}

/**
 * Adds a new stroke to the canvas.
 */
export function addStroke(state: DrawingGuessingState, stroke: DrawingStroke): void {
  state.strokes.push(stroke);
}

/**
 * Undoes the most recent stroke.
 */
export function undoLastStroke(state: DrawingGuessingState): void {
  state.strokes.pop();
}

/**
 * Clears all strokes on the canvas.
 */
export function clearCanvas(state: DrawingGuessingState): void {
  state.strokes = [];
}

/**
 * Calculates Levenshtein edit distance between two strings.
 */
export function getEditDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Submits a guess from a player.
 */
export function submitGuess(
  state: DrawingGuessingState,
  playerId: string,
  rawGuess: string,
): { isCorrect: boolean; isNearMiss: boolean; pointsAwarded: number; message: string } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return { isCorrect: false, isNearMiss: false, pointsAwarded: 0, message: 'Invalid player.' };
  }

  const drawer = state.players[state.currentDrawerIndex];
  if (player.id === drawer.id) {
    return {
      isCorrect: false,
      isNearMiss: false,
      pointsAwarded: 0,
      message: 'The drawer cannot guess their own secret word!',
    };
  }

  if (player.hasGuessed) {
    return {
      isCorrect: false,
      isNearMiss: false,
      pointsAwarded: 0,
      message: 'You have already guessed the word for this round!',
    };
  }

  const cleanedGuess = rawGuess.trim().toUpperCase();
  const secret = state.secretWord.toUpperCase();

  // 1. Correct Match
  if (cleanedGuess === secret) {
    player.hasGuessed = true;
    player.guessTimeSeconds = state.timerSeconds;

    // Time-decay score formula: 100 base + remaining time * 6 (max 460)
    const points = Math.round(100 + (state.timerSeconds / state.roundDuration) * 360);
    player.score += points;

    // Drawer bonus: 50 points per correct guesser
    drawer.score += 50;

    state.chatMessages.push({
      id: `msg-${Date.now()}-${Math.random()}`,
      senderId: player.id,
      senderName: player.name,
      text: `${player.name} guessed the word! (+${points} pts)`,
      isCorrect: true,
      timestamp: Date.now(),
    });

    // Check if all non-drawers have guessed
    const nonDrawers = state.players.filter((p) => p.id !== drawer.id);
    const allGuessed = nonDrawers.every((p) => p.hasGuessed);
    if (allGuessed) {
      endRound(state, 'All players have guessed the secret word!');
    }

    return {
      isCorrect: true,
      isNearMiss: false,
      pointsAwarded: points,
      message: `${player.name} guessed the word!`,
    };
  }

  // 2. Near-Miss Check (1 letter typo / edit distance = 1)
  const distance = getEditDistance(cleanedGuess, secret);
  const isNearMiss = distance === 1 && cleanedGuess.length >= 3;

  state.chatMessages.push({
    id: `msg-${Date.now()}-${Math.random()}`,
    senderId: player.id,
    senderName: player.name,
    text: rawGuess.trim(),
    isNearMiss,
    timestamp: Date.now(),
  });

  return {
    isCorrect: false,
    isNearMiss,
    pointsAwarded: 0,
    message: isNearMiss ? `'${rawGuess}' is so close!` : 'Incorrect guess.',
  };
}

/**
 * Decrements timer, reveals letter hints gradually, and advances phase when time expires.
 */
export function stepDrawingTimer(state: DrawingGuessingState, dt: number): void {
  if (state.phase !== 'drawing') return;

  state.timerSeconds = Math.max(0, state.timerSeconds - dt);

  // Progressive Hint Revelations:
  // At 60% time remaining: reveal 1st letter
  // At 30% time remaining: reveal a 2nd letter (if word length > 4)
  const ratio = state.timerSeconds / state.roundDuration;
  const wordLen = state.secretWord.length;

  if (ratio <= 0.6 && state.revealedIndices.length === 0 && wordLen > 2) {
    state.revealedIndices.push(0); // Reveal first letter
  }
  if (ratio <= 0.3 && state.revealedIndices.length === 1 && wordLen > 4) {
    const middleIndex = Math.floor(wordLen / 2);
    state.revealedIndices.push(middleIndex);
  }

  // Round time expired
  if (state.timerSeconds <= 0) {
    endRound(state, `Time's up! The secret word was "${state.secretWord}".`);
  }
}

/**
 * Concludes the round and advances to the next drawer or ends the game.
 */
export function endRound(state: DrawingGuessingState, message: string): void {
  state.phase = 'round_reveal';
  state.lastActionMessage = message;

  state.chatMessages.push({
    id: `msg-end-${Date.now()}`,
    senderId: 'system',
    senderName: 'PlayDeck Game Master',
    text: message,
    timestamp: Date.now(),
  });
}

/**
 * Advances to the next round / next drawer.
 */
export function nextRound(state: DrawingGuessingState): void {
  const nextDrawerIndex = (state.currentDrawerIndex + 1) % state.players.length;

  // If wrapped around to 0, advance round counter
  if (nextDrawerIndex === 0) {
    state.currentRound++;
  }

  // Check game over
  if (state.currentRound > state.maxRounds) {
    state.phase = 'game_over';
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    state.winnerId = sorted[0].id;
    state.lastActionMessage = `Game over! ${sorted[0].name} wins with ${sorted[0].score} points!`;
    return;
  }

  state.currentDrawerIndex = nextDrawerIndex;
  state.phase = 'selecting_word';
  state.wordOptions = getThreeWordOptions();
  state.strokes = [];
  state.revealedIndices = [];

  const nextDrawer = state.players[state.currentDrawerIndex];
  state.lastActionMessage = `Round ${state.currentRound}: ${nextDrawer.name} is choosing a word!`;
}

/**
 * Returns masked representation of the secret word, e.g. "S _ N" or "_ _ _ _".
 */
export function getMaskedWord(secretWord: string, revealedIndices: number[]): string {
  return secretWord
    .split('')
    .map((char, idx) => {
      if (char === ' ') return '  ';
      if (revealedIndices.includes(idx)) return char;
      return '_';
    })
    .join(' ');
}
