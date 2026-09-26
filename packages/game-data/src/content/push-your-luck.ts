import { defineGameModule } from '../core/base-game';
import { GameCategories, GameControlKeys, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const pushYourLuckGame = defineGameModule({
  id: 'push-your-luck',
  description:
    'Every draw pays out, and every draw after that is likelier to wipe you out. Bank your pot while it is safe, or push once more and gamble the whole round away.',
  category: GameCategories.CS,
  players: getPCount(1, 8),
  releaseDate: GameReleaseDates.D_2026_09_18,
  tags: [GameTags.P, GameTags.LP, GameTags.AI, GameTags.TB, GameTags.RISK],
  seo: {
    title: 'Push Your Luck — Free Press-Your-Luck Game Online',
    description:
      'Play Push Your Luck free in your browser. Draw for points, then bank them or push again and risk the lot. Up to 8 players pass-and-play or against Deck bots.',
    keywords: [
      'push your luck game',
      'press your luck online',
      'risk and bank game',
      'dice pushing game',
      'free party game browser',
      'pass and play party game',
      'push or bank game',
    ],
  },
  tagline: 'Every card pays. Every card after that might take it all back.',
  overview: [
    'Push Your Luck is a game about knowing when to stop. On your turn you draw from the risk deck and watch points pile into a pot. That pot is yours only when you bank it — push once more and a bust card wipes the whole turn. The first draw of every turn is free, and from there the odds of busting climb with each card you take.',
    'Two to eight players share one device, or you can face the Deck bots on your own. Multipliers can double or triple a pot in a single card, steal cards raid the leader’s safe pile, and insurance absorbs one bust for the brave. The maths is simple and the decision never is: the pot is always worth one more card, right up until it isn’t.',
  ],
  howToPlay: [
    {
      title: 'Take the free draw',
      description:
        'Press Push to draw your first card of the turn. That opening card can never bust, so there is no reason to skip it.',
    },
    {
      title: 'Read the risk meter',
      description:
        'The meter shows the exact chance that your next push busts. It starts at zero and climbs with every card you take this turn.',
    },
    {
      title: 'Push or bank',
      description:
        'Push to add another card to the pot, or Bank to move the whole pot into your safe total and end your turn.',
    },
    {
      title: 'Race to the target',
      description:
        'The first player whose banked total reaches the target score — 60, 100 or 150 — wins the match immediately.',
    },
  ],
  rules: [
    {
      title: 'Only banked points are safe',
      description:
        'Points in the pot belong to nobody until they are banked. A bust takes the entire pot, however large it has grown.',
    },
    {
      title: 'The first draw of a turn is free',
      description:
        'Bust chance is zero on the opening card, then rises in steps with each further push, up to a hard ceiling.',
    },
    {
      title: 'Multipliers hit the whole pot',
      description:
        'A ×2 or ×3 card multiplies everything in the pot at once, which also means there is far more to lose on the next push.',
    },
    {
      title: 'Steal cards raid the leader',
      description:
        'A steal takes banked points from whichever opponent holds the most and adds them to your pot — so they are still at risk.',
    },
    {
      title: 'Insurance absorbs one bust',
      description:
        'Drawing insurance lets you survive a single bust with the pot intact. The risk keeps climbing, so it buys one push, not immunity.',
    },
    {
      title: 'Banking wins on the spot',
      description:
        'Reaching the target score ends the match the moment the pot is banked. Points sitting in a pot never win anything.',
    },
  ],
  controls: [
    {
      key: 'P / Space / ↑',
      action: 'Push — draw another card',
    },
    {
      key: 'B / Enter / ↓',
      action: 'Bank the pot and pass the turn',
    },
    {
      key: GameControlKeys.R_RESTART,
      action: 'Start a new match',
    },
    {
      key: GameControlKeys.MOUSE_TOUCH,
      action: 'Tap the Push and Bank buttons',
    },
  ],
  tips: [
    'Bank around 18 to 22 points in a standard 100-point match. That is roughly where the pot you would lose outgrows the points you expect to gain.',
    'Push after a multiplier only if you have insurance. A tripled pot is exactly the pot you least want to hand to a bust card.',
    'Watch the leader, not just the meter. If someone is one good turn from the target, small safe banks no longer win you the match — you have to gamble.',
    'A steal card is worth more than its face value: it moves points off an opponent’s safe pile while leaving them at risk on yours.',
    'Insurance is a licence for exactly one extra push. Spend it on a high pot, not on a turn that is already small.',
    'Late in a match, count what you actually need. Banking 12 to cross the line beats pushing for 30 you will never use.',
  ],
  faq: [
    {
      question: 'How many players can play Push Your Luck?',
      answer:
        'Up to eight. Seats can be any mix of local pass-and-play players and Deck bots, and you can play solo against the bots.',
    },
    {
      question: 'What happens when I bust?',
      answer:
        'You lose every point in the current pot and your turn ends. Points you banked on earlier turns are unaffected.',
    },
    {
      question: 'Does the bust chance really increase?',
      answer:
        'Yes. The first draw of a turn cannot bust, and each further push raises the chance in fixed steps up to a capped maximum, shown live on the risk meter.',
    },
    {
      question: 'Can the bots be made easier or harder?',
      answer:
        'Bot nerve is configurable: cautious bots bank early, balanced bots play the odds, and reckless bots push far past sensible.',
    },
    {
      question: 'Is Push Your Luck playable with a keyboard?',
      answer:
        'Yes. P, Space or the up arrow pushes, B, Enter or the down arrow banks, and R deals a fresh match.',
    },
  ],
});

export const pushYourLuckContent = pushYourLuckGame.content;
export const pushYourLuckDefinition = pushYourLuckGame.definition;
