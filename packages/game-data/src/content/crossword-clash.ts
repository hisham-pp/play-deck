import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const crosswordClashGame = defineGameModule({
  id: 'crossword-clash',
  name: 'Crossword Clash',
  description:
    'Solve clues and race opponents in Crossword Clash on PlayDeck. Lock letters into shared grids, claim word completion bounties, and battle in real-time word duels.',
  category: GameCategories.P,
  players: getPCount(1, 4),
  releaseDate: '2026-09-25',
  tags: [GameTags.WP, GameTags.M_P, GameTags.S, GameTags.AI, GameTags.V_C],
  seo: {
    title: 'Crossword Clash — Multiplayer Word Puzzle Game | PlayDeck',
    description:
      'Solve clues and race opponents in Crossword Clash on PlayDeck. Lock letters into shared grids, claim word completion bounties, and battle in real-time word duels.',
    keywords: [
      'crossword clash',
      'multiplayer crossword game',
      'competitive crossword online',
      'live crossword battle',
      'co-op crossword puzzle',
      'word puzzle multiplayer',
      'newspaper crossword game',
      'playdeck crossword clash',
    ],
  },
  tagline: 'Race the clock or battle rival wordsmiths on simultaneous live crossword grids.',
  overview: [
    'Crossword Clash transforms the solitary newspaper crossword into a thrilling competitive and cooperative multiplayer arena.',
    'All players look at the same live puzzle grid. As you decipher across and down definitions, typing a correct letter immediately locks it onto the board for everyone to see and awards base points.',
    'The solver who places the final letter completing an entire word claims a major 100-point word bounty bonus. Battle solo against the clock, duel in free-for-all speed races, or team up in 2v2 tactical battles.',
  ],
  howToPlay: [
    {
      title: 'Select a clue to focus',
      description:
        'Click any Across or Down clue in the side panel or tap a numbered cell on the grid to highlight the active word slot.',
    },
    {
      title: 'Decipher the hint and type',
      description:
        'Type your guess using your physical keyboard or the on-screen tactile buttons. Correct letters immediately lock into the grid with your player color.',
    },
    {
      title: 'Claim the word completion bounty',
      description:
        'Filling the final remaining letter of any word awards a massive +100 point bonus and credits your name on the clue register.',
    },
    {
      title: 'Sprint to the final letter',
      description:
        'Race opponents before the round clock expires. The solver or team with the highest point total at 100% completion takes the victory podium.',
    },
  ],
  rules: [
    {
      title: 'Server-authoritative locking',
      description:
        'Correct letters lock permanently into the grid and award +10 points. Opponents cannot overwrite or erase locked letters.',
    },
    {
      title: 'Zero penalty for rapid guesses',
      description:
        'Incorrect letters briefly flash red feedback and clear automatically, allowing solvers to experiment without score penalties.',
    },
    {
      title: 'Word bounty reward',
      description:
        'The player who enters the final valid letter completing an Across or Down word receives a +100 point word bounty.',
    },
    {
      title: 'Mode mechanics',
      description:
        'Solo mode challenges your speed against the clock; Race mode features simultaneous live solving; Turn-based mode gives each solver 20 seconds per move; Team mode pools scores into Red vs Blue.',
    },
  ],
  controls: [
    {
      key: 'A–Z Keys / Virtual Buttons',
      action: 'Enter letters into the active grid cell',
    },
    {
      key: 'Arrow Keys',
      action: 'Navigate cursor across adjacent non-black grid cells',
    },
    {
      key: 'Spacebar / Tap Active Cell',
      action: 'Toggle typing orientation between Across and Down',
    },
    {
      key: 'Tab / Shift + Tab',
      action: 'Cycle selection to next or previous clue in the list',
    },
    {
      key: 'Backspace / Delete',
      action: 'Erase draft character or move cursor backward',
    },
  ],
  tips: [
    'Scan for short 3-letter and 4-letter clues first—their interlocking intersections reveal letters for longer words.',
    'Keep an eye on what opponents are typing; if a rival fills part of a word, jump in to grab the final letter bounty!',
    'Use Tab and Spacebar liberally to smoothly switch across and down clues without lifting your hands from the keyboard.',
    'In Team mode, coordinate with your partner to divide Across and Down clues so you never clash on the same word.',
  ],
  faq: [
    {
      question: 'What difficulty levels and grid sizes are available?',
      answer:
        'Crossword Clash features Easy (4x4 Mini grids), Medium (5x5 Pinwheel grids), and Hard (7x7 Symmetrical tournament grids) across 5 themed categories.',
    },
    {
      question: 'Can I play solo if I do not have a party ready?',
      answer:
        'Yes! Solo mode lets you speedrun puzzles against the countdown timer to set personal records, or you can practice against intelligent AI bot solvers in Race mode.',
    },
    {
      question: 'How does voice chat work during crossword matches?',
      answer:
        'Voice chat operates seamlessly through the built-in PlayDeck WebRTC audio mesh. You can strategize with your 2v2 partner or banter with rivals in real time.',
    },
    {
      question: 'Are there accessibility options for high contrast and large text?',
      answer:
        'Yes, you can toggle High Contrast (HC) mode for stark high-visibility borders and Large Text (A+) mode for enhanced legibility directly from the game header.',
    },
  ],
});

export const crosswordClashContent = crosswordClashGame.content;
export const crosswordClashDefinition = crosswordClashGame.definition;
