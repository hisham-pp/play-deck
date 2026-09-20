import type {
  HoneycombPuzzle,
  SpellingBeePlayer,
  SpellingBeeRank,
  WordValidationResult,
} from '../types/spelling-bee.types';

const MIN_WORD_LEN = 4;
const PANGRAM_BONUS = 7;
const UNIQUE_WORD_BONUS = 3;

export function isPangramWord(word: string, puzzle: HoneycombPuzzle): boolean {
  const upper = word.toUpperCase();
  if (!upper.includes(puzzle.centerLetter)) return false;
  return puzzle.outerLetters.every((letter) => upper.includes(letter));
}

export function scoreWord(word: string, isPangram: boolean): number {
  const len = word.length;
  if (len < MIN_WORD_LEN) return 0;
  let pts = len === MIN_WORD_LEN ? 1 : len;
  if (isPangram) {
    pts += PANGRAM_BONUS;
  }
  return pts;
}

export function validateSubmission(
  rawWord: string,
  puzzle: HoneycombPuzzle,
  alreadyFound: string[],
): WordValidationResult {
  const word = rawWord.trim().toUpperCase();

  if (word.length < MIN_WORD_LEN) {
    return { isValid: false, reason: 'too-short', score: 0, isPangram: false };
  }

  if (!word.includes(puzzle.centerLetter)) {
    return { isValid: false, reason: 'missing-center', score: 0, isPangram: false };
  }

  const allowed = new Set([puzzle.centerLetter, ...puzzle.outerLetters]);
  for (let i = 0; i < word.length; i += 1) {
    if (!allowed.has(word[i])) {
      return { isValid: false, reason: 'invalid-letter', score: 0, isPangram: false };
    }
  }

  const foundSet = new Set(alreadyFound.map((w) => w.toUpperCase()));
  if (foundSet.has(word)) {
    return { isValid: false, reason: 'already-found', score: 0, isPangram: false };
  }

  const validSet = new Set(puzzle.validWords.map((w) => w.toUpperCase()));
  if (!validSet.has(word)) {
    return { isValid: false, reason: 'not-in-dictionary', score: 0, isPangram: false };
  }

  const pangram = isPangramWord(word, puzzle);
  const score = scoreWord(word, pangram);

  return {
    isValid: true,
    score,
    isPangram: pangram,
  };
}

export function calculateRank(score: number, maxScore: number): SpellingBeeRank {
  if (maxScore <= 0) return 'Beginner';
  const ratio = score / maxScore;

  if (ratio >= 1.0) return 'Queen Bee';
  if (ratio >= 0.7) return 'Genius';
  if (ratio >= 0.5) return 'Amazing';
  if (ratio >= 0.35) return 'Great';
  if (ratio >= 0.2) return 'Solid';
  if (ratio >= 0.1) return 'Good';
  return 'Beginner';
}

export function applyMultiplayerBonuses(players: SpellingBeePlayer[]): SpellingBeePlayer[] {
  const wordCounts = new Map<string, number>();

  for (const p of players) {
    for (const f of p.foundWords) {
      wordCounts.set(f.word, (wordCounts.get(f.word) || 0) + 1);
    }
  }

  return players.map((player) => {
    let bonus = 0;
    for (const f of player.foundWords) {
      if (wordCounts.get(f.word) === 1) {
        bonus += UNIQUE_WORD_BONUS;
      }
    }
    return {
      ...player,
      score: player.score + bonus,
    };
  });
}

export function shuffleOuterLetters(letters: string[]): string[] {
  const shuffled = [...letters];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}
