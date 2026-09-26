import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const trustOrBetrayGame = defineGameModule({
  id: 'trust-or-betray',
  name: 'Trust or Betray',
  description:
    'Cooperate on secret missions or betray comrades to plunder the group pot. Navigate tense discussions, bluff rivals, and survive exile trials in 3-8 player rooms.',
  category: GameCategories.S,
  players: getPCount(3, 8),
  releaseDate: '2026-09-20',
  tags: [GameTags.ST, GameTags.M_P, GameTags.V_C, GameTags.SD, GameTags.BLUFFING, GameTags.S],
  seo: {
    title: 'Trust or Betray — Social Deception Strategy | PlayDeck',
    description:
      'Cooperate to build shared pots or betray your comrades to steal the reward. Navigate tense discussions and survive exile trials in Trust or Betray on PlayDeck.',
    keywords: [
      'trust or betray',
      'social dilemma game',
      'social deception multiplayer',
      'prisoners dilemma game',
      'bluffing game',
      'webrtc voice game',
      'cooperation or betrayal',
    ],
  },
  tagline:
    'Cooperate to build group wealth, or betray your comrades to plunder the entire mission pot.',
  overview: [
    'Trust or Betray is an intense 3 to 8 player social dilemma strategy game where operatives face critical decisions under the shadow of greed and deception.',
    'Each round presents a high-stakes mission objective with a shared reward pot. Operatives secretly and simultaneously decide whether to Cooperate or Betray.',
    'If everyone cooperates, the spoils are distributed equally and the team builds an escalating cooperation streak multiplier. However, a solo betrayer steals the entire pot plus a lucrative 50-point solo bonus.',
    'If multiple operatives betray, their greed collides in sabotage: the pot is annihilated and betrayers receive zero points.',
    'Between rounds, enter the discussion stage to negotiate, accuse, or bluff in real-time with WebRTC voice chat. Periodic Exile Trials allow the room to vote out suspected serial saboteurs.',
  ],
  howToPlay: [
    {
      title: 'Analyze the Mission Briefing',
      description:
        'Review the current mission objective, the shared reward pool, and the active trust streak multiplier before casting your vote.',
    },
    {
      title: 'Make Your Secret Move',
      description:
        'Select Cooperate [C] to split the pot and build the streak, or Betray [B] to attempt a daring solo heist.',
    },
    {
      title: 'Debate in the Discussion Chamber',
      description:
        'Use built-in WebRTC voice chat or quick text transmissions to defend your choices, accuse liars, or broker pacts for upcoming missions.',
    },
    {
      title: 'Vote in the Exile Trial',
      description:
        'Every two rounds, participate in a secret majority ballot to exile a suspected saboteur, penalizing them with score loss and a round timeout.',
    },
  ],
  rules: [
    {
      title: 'Unanimous Cooperation',
      description:
        'When all active operatives choose Cooperate, the full pot multiplied by the current streak bonus is split evenly.',
    },
    {
      title: 'Solo Betrayal Heist',
      description:
        'If exactly one operative chooses Betray, they steal 100% of the pot plus a 50-point solo bonus. All cooperating operatives get 0.',
    },
    {
      title: 'Sabotage Collision',
      description:
        'If two or more operatives choose Betray, the mission collapses. All betrayers get 0 points, cooperators get 0, and the streak resets to zero.',
    },
    {
      title: 'Exile Trial Consequences',
      description:
        'Operatives receiving a majority exile vote suffer an 80-point deduction and are barred from participating in the subsequent round.',
    },
  ],
  controls: [
    {
      key: 'C',
      action: 'Select Cooperate decision',
    },
    {
      key: 'B',
      action: 'Select Betray decision',
    },
    {
      key: 'Enter',
      action: 'Confirm and lock in secret decision',
    },
    {
      key: 'Mouse / Touch',
      action: 'Tap options, accusation pills, or candidate cards',
    },
  ],
  tips: [
    'Building a streak early multiplies later high-value pots significantly.',
    'Notice sudden quietness from vocal players—they might be plotting an opportunistic betrayal.',
    'If you plan to betray, wait until the pot is large or your rivals expect continued harmony.',
    'Watch the Trust Meter: once your reputation falls below 40%, you become the prime target in the next Exile Trial.',
  ],
  faq: [
    {
      question: 'How many players can play Trust or Betray?',
      answer:
        'Trust or Betray supports 3 to 8 players, either solo with autonomous AI bot archetypes or online with friends via private room links.',
    },
    {
      question: 'What happens if every player betrays in a round?',
      answer:
        'Mutual ruin occurs: the mission fails completely, no points are awarded to anyone, and the streak drops to zero.',
    },
    {
      question: 'Does Trust or Betray include voice chat?',
      answer:
        'Yes! PlayDeck provides peer-to-peer WebRTC voice chat directly inside the room for real-time bluffing and negotiations.',
    },
  ],
});

export const trustOrBetrayContent = trustOrBetrayGame.content;
export const trustOrBetrayDefinition = trustOrBetrayGame.definition;
