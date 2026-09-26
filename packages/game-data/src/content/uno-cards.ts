import { defineGameModule } from '../core/base-game';
import { GameCategories, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const unoCardsGame = defineGameModule({
  id: 'uno-cards',
  name: 'UNO-Style Cards',
  description:
    'Play fast-paced UNO-Style shedding cards on PlayDeck. Match vibrant colors and numbers, unleash Skip, Reverse, and Wild Draw Four cards against tactical AI bots.',
  category: GameCategories.C,
  players: getPCount(2, 4),
  releaseDate: GameReleaseDates.D_2026_09_25,
  tags: [GameTags.P, GameTags.S, GameTags.LP, GameTags.AI, GameTags.M_P],
  seo: {
    title: 'UNO-Style Cards — Color & Number Shedding Game | PlayDeck',
    description:
      'Play fast-paced UNO-Style shedding cards on PlayDeck. Match vibrant colors and numbers, unleash Skip, Reverse, and Wild Draw Four cards against tactical AI bots.',
    keywords: [
      'uno style cards',
      'card shedding game',
      'color matching card game',
      'online card games',
      'card game vs bot',
      'party card games',
      'wild draw four',
      'playdeck cards',
    ],
  },
  tagline: 'Match colors, drop action specials, and shed your hand before rivals.',
  overview: [
    'UNO-Style Cards is a fast, vibrant shedding card game where tactical timing and color management rule the table.',
    'Race to empty your 7-card hand by matching the discard pile by color, number, or special action symbol while dodging skips and draw penalties.',
    'Compete in solo matches against up to 3 smart AI bots or play local pass-and-play with friends, featuring complete color-blind shape symbols on every card.',
  ],
  howToPlay: [
    {
      title: 'Match the discard pile',
      description:
        'Play a card from your hand that matches the active discard card by color, number (0-9), or action symbol.',
    },
    {
      title: 'Play action specials',
      description:
        'Disrupt opponents with Skip cards to skip their turns, Reverse cards to flip direction, and Draw Two (+2) cards to inflate their hands.',
    },
    {
      title: 'Drop Wild cards',
      description:
        'Wild cards can be played on any turn. Select the new active color or play a Wild Draw Four (+4) to force the next player to draw four cards.',
    },
    {
      title: 'Call Last Card',
      description:
        'When down to your final card, tap the Last Card call button to celebrate your impending victory!',
    },
  ],
  rules: [
    {
      title: 'Valid card plays',
      description:
        'A card is legal if it matches the current active color, matches the discard card number/action, or is any Wild card.',
    },
    {
      title: 'Draw and pass rules',
      description:
        'If you have no playable cards, draw one card from the deck. You may play it immediately if valid or pass your turn.',
    },
    {
      title: 'Action card stacking',
      description:
        'Victims of Draw Two and Wild Draw Four cards must draw the required penalty cards and lose their turn immediately.',
    },
    {
      title: 'Round scoring',
      description:
        'When a player sheds their last card, they score points from all remaining cards in opponents hands: number face values, 20 pts for actions, and 50 pts for wilds.',
    },
  ],
  controls: [
    {
      key: 'Click / Tap Card',
      action: 'Play an eligible card from your hand to the discard pile',
    },
    {
      key: 'Draw Pile / Draw Button',
      action: 'Draw one card from the center deck when out of playable cards',
    },
    {
      key: 'Pass Turn Button',
      action: 'Pass your turn to the next player after drawing a card',
    },
    {
      key: 'Last Card Button',
      action: 'Announce Last Card when holding one card remaining',
    },
  ],
  tips: [
    'Save Wild Draw Four cards for late-round emergencies when an opponent has only 1 card left.',
    'Pay attention to which colors opponents draw on—switch to colors they lack to stall their turns.',
    'Use Reverse and Skip cards to keep the pressure on leaders with few cards remaining.',
    'Every card includes a distinct shape icon (◆, ●, ▲, ★) for high-contrast accessibility.',
  ],
  faq: [
    {
      question: 'How many players can play at the same table?',
      answer:
        'You can select 2, 3, or 4 players at the table, playing solo against AI bots or passing the device in local play.',
    },
    {
      question: 'What happens when the draw deck runs out of cards?',
      answer:
        'The discard pile (excluding the top active card) is automatically reshuffled into the draw deck seamlessly.',
    },
    {
      question: 'Is the game color-blind accessible?',
      answer:
        'Yes! Each of the 4 colors features an accompanying geometric shape symbol: Diamond for Red, Circle for Blue, Triangle for Green, and Star for Yellow.',
    },
  ],
});

export const unoCardsContent = unoCardsGame.content;
export const unoCardsDefinition = unoCardsGame.definition;
