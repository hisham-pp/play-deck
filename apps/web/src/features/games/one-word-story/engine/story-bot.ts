import type {
  OneWordStoryState,
  StoryAwardType,
  StoryPlayer,
  StoryVote,
  StoryWord,
} from '../types/one-word-story.types';
import { BOT_VOCABULARY, COMMON_CONNECTORS } from './story-prompts';

export function generateBotWord(bot: StoryPlayer, state: OneWordStoryState): string {
  const personality = bot.botPersonality ?? 'chaotic';
  const vocab = BOT_VOCABULARY[personality] ?? BOT_VOCABULARY.chaotic;

  // In challenge mode, check if there are challenge words from prompt that haven't been used yet
  if (state.mode === 'challenge' && state.selectedPrompt.challengeWords) {
    const usedWords = new Set(state.words.map((w) => w.word.toLowerCase().replace(/[^a-z]/g, '')));
    const unusedChallengeWords = state.selectedPrompt.challengeWords.filter(
      (cw) => !usedWords.has(cw.toLowerCase()),
    );
    if (unusedChallengeWords.length > 0 && Math.random() < 0.35) {
      const chosen =
        unusedChallengeWords[Math.floor(Math.random() * unusedChallengeWords.length)] ?? '';
      return Math.random() < 0.3 ? `${chosen}!` : chosen;
    }
  }

  // Check last word to decide flow
  const lastWordObj = state.words[state.words.length - 1];
  const lastWord = lastWordObj?.word ?? '';
  const endsWithPunctuation = /[.!?]$/.test(lastWord);

  // If last word ended sentence, 50% chance to pick connector or capitalize word
  if (endsWithPunctuation) {
    if (Math.random() < 0.5) {
      const connector =
        COMMON_CONNECTORS[Math.floor(Math.random() * COMMON_CONNECTORS.length)] ?? 'Suddenly,';
      return connector.charAt(0).toUpperCase() + connector.slice(1);
    }
  }

  // 20% chance to insert connector
  if (state.words.length > 0 && Math.random() < 0.2) {
    const connector = COMMON_CONNECTORS[Math.floor(Math.random() * COMMON_CONNECTORS.length)] ?? '';
    if (connector) return connector;
  }

  // Otherwise choose from personality vocab
  const pick = vocab[Math.floor(Math.random() * vocab.length)] ?? 'behold';

  // 15% chance to add dramatic punctuation if it doesn't have it
  if (!/[.!?]$/.test(pick) && Math.random() < 0.15) {
    const punct = Math.random() < 0.5 ? '!' : '.';
    return `${pick}${punct}`;
  }

  return pick;
}

export function generateBotVotes(bot: StoryPlayer, words: StoryWord[]): StoryVote[] {
  if (words.length === 0) return [];

  // Bots vote for words not authored by themselves (if possible)
  const candidateWords = words.filter((w) => w.authorId !== bot.id);
  const pool = candidateWords.length > 0 ? candidateWords : words;

  const awardTypes: StoryAwardType[] = ['funniest', 'best_twist', 'wildest'];
  const votes: StoryVote[] = [];

  for (const awardType of awardTypes) {
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    if (randomPick) {
      votes.push({
        voterId: bot.id,
        wordId: randomPick.id,
        awardType,
      });
    }
  }

  return votes;
}
