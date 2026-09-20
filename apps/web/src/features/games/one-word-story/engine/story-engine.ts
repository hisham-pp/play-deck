import type {
  OneWordStoryState,
  StoryAwardResult,
  StoryAwardType,
  StoryMode,
  StoryPlayer,
  StoryPrompt,
  StoryVote,
  StoryWord,
} from '../types/one-word-story.types';

export const MODE_TURN_SECONDS: Record<StoryMode, number> = {
  classic: 15,
  speed: 6,
  challenge: 12,
};

export const DEFAULT_MAX_WORDS = 30;

export function validateWord(raw: string): {
  isValid: boolean;
  cleanedWord?: string;
  error?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Word cannot be empty' };
  }

  // Must not have spaces (exactly ONE word)
  if (/\s/.test(trimmed)) {
    return { isValid: false, error: 'Enter only a single word' };
  }

  if (trimmed.length > 25) {
    return { isValid: false, error: 'Word exceeds 25 character limit' };
  }

  return { isValid: true, cleanedWord: trimmed };
}

export function createInitialStoryState(params: {
  mode?: StoryMode;
  prompt: StoryPrompt;
  playerIds: string[];
  maxWords?: number;
}): OneWordStoryState {
  const mode = params.mode ?? 'classic';
  const turnOrder = [...params.playerIds];
  const maxWords = params.maxWords ?? DEFAULT_MAX_WORDS;
  const turnDurationSeconds = MODE_TURN_SECONDS[mode];

  return {
    phase: 'storytelling',
    mode,
    selectedPrompt: params.prompt,
    words: [],
    activePlayerId: turnOrder[0] ?? '',
    turnStartTime: Date.now(),
    turnDurationSeconds,
    maxWords,
    turnOrder,
    turnIndex: 0,
    votes: [],
    awards: [],
  };
}

export function addWordToStory(
  state: OneWordStoryState,
  rawWord: string,
  author: StoryPlayer,
): OneWordStoryState {
  const validation = validateWord(rawWord);
  if (!validation.isValid || !validation.cleanedWord) {
    return state;
  }

  const newWord: StoryWord = {
    id: `word-${state.words.length + 1}-${Date.now()}`,
    word: validation.cleanedWord,
    authorId: author.id,
    authorName: author.displayName,
    timestamp: Date.now(),
    turnIndex: state.turnIndex,
  };

  const updatedWords = [...state.words, newWord];
  const nextTurnIndex = state.turnIndex + 1;
  const nextActivePlayerId = state.turnOrder[nextTurnIndex % state.turnOrder.length] ?? '';

  const isComplete = updatedWords.length >= state.maxWords;

  return {
    ...state,
    words: updatedWords,
    turnIndex: nextTurnIndex,
    activePlayerId: nextActivePlayerId,
    turnStartTime: Date.now(),
    phase: isComplete ? 'readback' : state.phase,
  };
}

export function compileFullStoryText(prompt: StoryPrompt, words: StoryWord[]): string {
  let story = prompt.starterPhrase.trim();

  for (const item of words) {
    const word = item.word.trim();
    // If the word starts with typical punctuation attach without space, else add space
    if (/^[.,!?;:]/.test(word)) {
      story += word;
    } else {
      story += ` ${word}`;
    }
  }

  // Ensure story ends with terminal punctuation
  if (!/[.!?]$/.test(story)) {
    story += '.';
  }

  return story;
}

const AWARD_TITLES: Record<StoryAwardType, string> = {
  funniest: 'Funniest Word',
  best_twist: 'Best Plot Twist',
  wildest: 'Wildest Chaos',
};

export function tallyStoryAwards(words: StoryWord[], votes: StoryVote[]): StoryAwardResult[] {
  if (words.length === 0) return [];

  const awardTypes: StoryAwardType[] = ['funniest', 'best_twist', 'wildest'];
  const results: StoryAwardResult[] = [];

  for (const awardType of awardTypes) {
    const typeVotes = votes.filter((v) => v.awardType === awardType);
    const voteCounts = new Map<string, number>();

    for (const v of typeVotes) {
      voteCounts.set(v.wordId, (voteCounts.get(v.wordId) ?? 0) + 1);
    }

    let topWordId = words[0]?.id ?? '';
    let maxCount = 0;

    for (const [wId, count] of voteCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        topWordId = wId;
      }
    }

    // Fallback if no votes: pick a random word or middle/last word
    const winningWord =
      words.find((w) => w.id === topWordId) ?? words[Math.floor(words.length / 2)] ?? words[0];

    if (winningWord) {
      results.push({
        awardType,
        title: AWARD_TITLES[awardType],
        wordId: winningWord.id,
        word: winningWord.word,
        authorId: winningWord.authorId,
        authorName: winningWord.authorName,
        voteCount: maxCount,
      });
    }
  }

  return results;
}

export function calculateFinalPlayerScores(
  players: StoryPlayer[],
  words: StoryWord[],
  awards: StoryAwardResult[],
  votes: StoryVote[],
): StoryPlayer[] {
  return players.map((player) => {
    let score = 0;
    const authorWords = words.filter((w) => w.authorId === player.id);
    // 5 points per word contributed
    score += authorWords.length * 5;

    // 10 points per vote received on any of their words
    const playerWordIds = new Set(authorWords.map((w) => w.id));
    const votesReceived = votes.filter((v) => playerWordIds.has(v.wordId)).length;
    score += votesReceived * 10;

    // 25 bonus points per major award won
    const wonAwards = awards.filter((a) => a.authorId === player.id);
    score += wonAwards.length * 25;

    return {
      ...player,
      score,
      wordsContributed: authorWords.length,
      awardsReceived: wonAwards.map((a) => a.title),
    };
  });
}
