import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameControlKeys } from '../enums/controls.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const oneWordStoryGame = defineGameModule({
  id: 'one-word-story',
  description:
    'Players collaboratively create a story, one word at a time. Unexpected combinations and deliberate chaos create hilarious results in 3–8 player voice rooms.',
  category: GameCategories.CS,
  players: getPCount(3, 8),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.CO, GameTags.S],
  seo: {
    title: 'One Word Story — Collaborative Party Storytelling | PlayDeck',
    description:
      'Take turns adding one word at a time to weave hilarious, chaotic tales. Read back dramatic stories and vote on funny moments in 3–8 player voice rooms.',
    keywords: [
      'one word story',
      'collaborative storytelling',
      'party game',
      'word game',
      'creative writing game',
      'voice chat game',
      'typewriter game',
      'group party games',
    ],
  },
  tagline:
    'Craft hilarious and thrilling collective tales one word at a time with live voice chat.',
  overview: [
    'One Word Story is a cooperative party game where 3 to 8 players take turns contributing exactly one word at a time to build unexpected, hilarious, and thrilling narratives.',
    'With diverse genre prompts, rapid turn timers, dramatic text-to-speech readbacks, and community award voting, every session turns a blank page into an unforgettable adventure.',
    'Unexpected word pairings and sudden plot shifts keep everyone laughing as the typewriter parchment fills with collective imagination.',
  ],
  howToPlay: [
    {
      title: 'Choose a Theme & Prompt',
      description:
        'Select from genres like Sci-Fi, Fantasy, Horror, or Comedy, or invent your own starter phrase to spark the imagination.',
    },
    {
      title: 'Add One Word on Your Turn',
      description:
        'When the typewriter spotlight shines on you, enter exactly one word before the timer expires. Punctuation can be attached to shape sentences.',
    },
    {
      title: 'Listen to the Dramatic Readback',
      description:
        'Once the word limit is reached, enjoy the full finished story read aloud or scrolled like an authentic parchment manuscript.',
    },
    {
      title: 'Vote on Awards & Crown Champions',
      description:
        'Vote for the Funniest Word, Best Plot Twist, and Wildest Chaos to reward your favorite contributions and award points.',
    },
  ],
  rules: [
    {
      title: 'Exactly One Word per Turn',
      description:
        'Submissions must contain only a single word token. Hyphenated words are allowed, but spaces are rejected.',
    },
    {
      title: 'Punctuation Is Permitted',
      description:
        'Players may append terminal or clause punctuation like periods, commas, or exclamation marks to end sentences naturally.',
    },
    {
      title: 'Strict Turn Countdown',
      description:
        'Players must submit their word within the mode countdown timer (15 seconds in Classic, 6 seconds in Speed mode).',
    },
    {
      title: 'Fair Community Voting',
      description:
        'During the awards ballot, players nominate contributions across three categories; top vote-earners score bonus victory points.',
    },
  ],
  controls: [
    {
      key: 'Keyboard / Input',
      action: 'Type your word into the prompt box and press Space or Enter to submit.',
    },
    {
      key: 'Punctuation Chips',
      action: 'Click quick punctuation buttons (. , ! ? ...) to append grammar to your word.',
    },
    {
      key: GameControlKeys.CLICK_TAP,
      action: 'Click words during the voting stage to cast ballots for funny and wild moments.',
    },
  ],
  tips: [
    'Use punctuation wisely: dropping a period or question mark completely redirects the direction of the next player’s thought.',
    'Play off unexpected words: the funniest stories happen when you embrace mistakes and turn them into pivotal plot devices.',
    'Keep an eye on the timer in Speed mode: submitting a simple connector word is better than letting the clock run out.',
    'In Challenge mode, look for natural opportunities to sneak in bonus prompt words for extra storyteller points.',
  ],
  faq: [
    {
      question: 'How many players can participate in One Word Story?',
      answer:
        'One Word Story accommodates 3 to 8 players. If you are playing solo or with a friend, AI authors with distinct comedic and poetic personalities can join your lobby.',
    },
    {
      question: 'Can I play with voice chat enabled?',
      answer:
        'Yes! The integrated WebRTC voice dock lets you laugh, banter, and read the completed story aloud together with zero external software required.',
    },
    {
      question: 'Can I save or copy our completed story?',
      answer:
        'Yes, both the readback stage and coronation modal include a 1-click "Copy Story" button to save your group’s masterpiece to the clipboard.',
    },
  ],
});

export const oneWordStoryContent = oneWordStoryGame.content;
export const oneWordStoryDefinition = oneWordStoryGame.definition;
