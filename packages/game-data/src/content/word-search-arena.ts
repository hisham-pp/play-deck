import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const wordSearchArenaGame = defineGameModule({
  id: 'word-search-arena',
  name: 'Word Search Arena',
  description:
    'Race to find hidden words in a shared letter grid before your opponents do! Words hide in all 8 directions across 6 themes and 3 grid sizes.',
  category: GameCategories.P,
  players: getPCount(1, 6),
  releaseDate: '2026-09-22',
  tags: [GameTags.M_P, GameTags.V_C, GameTags.S, GameTags.WP],
  featured: true,
  seo: {
    title: 'Word Search Arena — Multiplayer Word Hunt Game',
    description:
      'Race friends to find hidden words in a shared letter grid! Claim words by dragging across the honeycomb in any direction. Multiple themes and grid sizes.',
    keywords: [
      'word search game',
      'multiplayer word search',
      'online word hunt',
      'find hidden words',
      'word puzzle game',
      'letter grid game',
      'word search arena',
      'competitive word puzzle',
    ],
  },
  tagline: 'Find it first. Claim it first.',
  overview: [
    'Word Search Arena puts classic word hunting into a competitive arena. A shared letter grid hides words in all 8 directions — horizontal, vertical, and diagonal. Your goal is to spot and claim them before your opponents do.',
    'Words are hidden across themed packs including Animals, Countries, Food, Science, Sports, and Mixed. Choose your preferred grid size — from a quick 10×10 sprint to a sprawling 15×15 marathon — and battle it out.',
    'Play solo against the clock, race head-to-head, play team elimination, or coordinate with teammates. Every find earns points based on word length plus a speed bonus for quick claims.',
  ],
  howToPlay: [
    {
      title: '1. Pick a Mode & Theme',
      description:
        'Select Solo, Race, Elimination, or Teams. Then choose a word theme and grid size before the game begins.',
    },
    {
      title: '2. Scan the Grid',
      description:
        'Search the letter grid for hidden words listed in the word panel. Words can appear in any of 8 directions.',
    },
    {
      title: '3. Drag to Select',
      description:
        'Click and drag (or touch and swipe) across letters in a straight line to form a word. Release to submit.',
    },
    {
      title: '4. Claim Your Word',
      description:
        'A valid word lights up in your color. In multiplayer, the first player to find a word claims it and scores.',
    },
    {
      title: '5. Win the Arena',
      description:
        'The player who has found the most words (or highest score) when all words are claimed wins the round!',
    },
  ],
  rules: [
    {
      title: 'Eight Directions',
      description:
        'Words are hidden horizontally, vertically, and diagonally — in both forward and reverse directions.',
    },
    {
      title: 'First Claim Wins',
      description:
        'In multiplayer modes, the first player to fully select a hidden word claims it and earns the points.',
    },
    {
      title: 'No Double Claiming',
      description:
        'Once a word is claimed and highlighted, it cannot be re-selected by any player.',
    },
    {
      title: 'Speed Bonus',
      description:
        'Fast claims earn an additional speed bonus of up to 50 points on top of the base word-length score.',
    },
  ],
  controls: [
    {
      key: 'Click + Drag',
      action: 'Select a straight line of letters to form a word.',
    },
    {
      key: 'Touch + Swipe',
      action: 'Mobile-friendly touch selection — drag in any straight direction.',
    },
    {
      key: 'Release',
      action: 'Submit your selection and attempt to claim the word.',
    },
  ],
  tips: [
    'Scan the grid for uncommon letters first — Q, Z, X, and J reveal word positions quickly.',
    'Look for words in reverse — many words are hidden backwards to trick casual searchers.',
    'In Race mode, claim shorter words fast to build early lead points before the long words.',
    'Diagonal words are hardest to spot, so save them for when you need a score boost late in the round.',
  ],
  faq: [
    {
      question: 'How many words are hidden in each grid?',
      answer:
        'Small grids contain 8 words, Medium grids contain 12 words, and Large grids contain up to 16 words. All words come from your chosen theme.',
    },
    {
      question: 'Can two players claim the same word?',
      answer:
        "No! The first player to complete a valid selection of a word claims it. Once claimed, the word is highlighted in that player's color and removed from the available pool.",
    },
    {
      question: 'What directions can words be hidden?',
      answer:
        'Words can be placed in any of 8 directions: left-to-right, right-to-left, top-to-bottom, bottom-to-top, and all four diagonals.',
    },
  ],
});

export const wordSearchArenaContent = wordSearchArenaGame.content;
export const wordSearchArenaDefinition = wordSearchArenaGame.definition;
