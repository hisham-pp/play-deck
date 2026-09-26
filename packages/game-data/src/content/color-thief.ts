import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const colorThiefGame = defineGameModule({
  id: 'color-thief',
  name: 'Color Thief',
  description:
    'Steal the grid one tile at a time. Paint that touches your own territory is cheap, isolated captures cost dearly, and every colour hides an ability nobody sees until it fires.',
  category: GameCategories.S,
  players: getPCount(2, 6),
  releaseDate: '2026-09-18',
  tags: [GameTags.M_P, GameTags.V_C, GameTags.LP, GameTags.AI, GameTags.TB],
  featured: true,
  seo: {
    title: 'Color Thief — Free Territory Control Game Online',
    description:
      'Play Color Thief free in your browser. Steal tiles on a shared grid where every colour hides an ability. Two to six players, pass-and-play or online.',
    keywords: [
      'color thief game',
      'territory control game online',
      'tile capture strategy game',
      'grid territory game free',
      'paint the grid game',
      'multiplayer strategy browser game',
      'hidden ability board game',
    ],
  },
  tagline: 'Paint what you can reach. Steal what you cannot.',
  overview: [
    'Color Thief is a turn-based territory game played on a neutral grid. Every turn hands you a small pot of paint, and every tile has a price: one paint for a neutral tile that touches your own colour, more for a tile you have to reach across open board, and more again for a tile an opponent has ringed with their own paint. The arena never gives you enough paint to do everything you want, so each turn is a small argument with yourself about width versus depth.',
    'The twist is that your colour is not just a colour. Each of the six paints carries an ability — a flood, a freeze, a swap, a blockade, a splash, a slow creep — and nobody at the table knows which is which until its owner spends it. That first reveal changes how everyone plays the rest of the match, which is why Color Thief is at its best with voice chat on and everybody lying about what they are holding.',
  ],
  howToPlay: [
    {
      title: 'Open anywhere',
      description:
        'Your first claim of the match costs the plain neutral price wherever you put it, so plant your colour somewhere with room to grow.',
    },
    {
      title: 'Spend the turn’s paint',
      description:
        'Claim as many tiles as your paint covers. Prices are shown on the grid, and the turn ends on its own when nothing left is affordable.',
    },
    {
      title: 'Spring your colour',
      description:
        'Press Use, or Q, to aim your ability. It costs paint, goes on cooldown, and the whole table learns what your colour does.',
    },
    {
      title: 'Hold the arena',
      description:
        'When the configured rounds are spent, the most tiles wins. A tie on tiles goes to whoever holds the biggest connected block.',
    },
  ],
  rules: [
    {
      title: 'Paint that touches paint is cheap',
      description:
        'A neutral tile next to your own territory costs one paint. Reaching a tile that touches nothing of yours adds an isolation surcharge.',
    },
    {
      title: 'Stealing costs more than settling',
      description:
        'Taking an opponent tile starts at two paint, and every extra neighbour that opponent holds around it adds more, up to a capped surcharge.',
    },
    {
      title: 'Paint never carries over',
      description:
        'Anything you do not spend is lost when the turn passes, so hoarding is never a plan. The turn ends by itself once nothing is affordable.',
    },
    {
      title: 'Abilities are hidden until used',
      description:
        'Each colour owns one ability. Opponents see only "Ability unknown" until you fire it; after that it is public for the rest of the match.',
    },
    {
      title: 'Frozen tiles are out of play',
      description:
        'A frozen tile scores nothing, spreads nothing and cannot be claimed by anybody until it thaws two rounds later.',
    },
    {
      title: 'Most territory wins',
      description:
        'Only thawed tiles count. Level on tiles, the largest connected block breaks it; a true dead heat is recorded as a shared win.',
    },
  ],
  controls: [
    {
      key: 'Arrow keys / WASD',
      action: 'Move across the grid',
    },
    {
      key: 'Enter / Space',
      action: 'Claim the focused tile, or pick it as an ability target',
    },
    {
      key: 'Q',
      action: 'Aim your colour’s ability',
    },
    {
      key: 'E',
      action: 'End your turn',
    },
    {
      key: 'Escape',
      action: 'Cancel an ability you are aiming',
    },
    {
      key: 'Mouse / touch',
      action: 'Tap a tile to claim or target it',
    },
  ],
  tips: [
    'Width early, depth late. Cheap adjacent claims compound, so a turn spent spreading along a front is usually worth more than one expensive raid.',
    'Ring the tiles you care about. Every friendly neighbour around a tile raises what an opponent must pay to take it off you.',
    'An isolated claim is a beachhead, not a mistake — pay the surcharge once, in a corner nobody is contesting, and the tiles around it are cheap forever after.',
    'Hold your ability until it wins you something. The moment you fire it, the table knows what colour you are and plays around it.',
    'Freeze the joint, not the edge. Soaking the tile that links two halves of an opponent’s wall costs them their tie-break block, not just a tile.',
    'Watch the paint counter, not just the board. Ending a turn with two paint unspent is the same as handing them to whoever plays next.',
    'Against a Green seat, close the gaps early. Bloom only creeps onto neutral tiles that touch their territory, so a wall of your colour starves it.',
  ],
  faq: [
    {
      question: 'How many players can play Color Thief?',
      answer:
        'Two to six. Seats can be any mix of local players, Deck bots and friends in an online room, and the seat order decides who gets which colour.',
    },
    {
      question: 'What do the colours actually do?',
      answer:
        'Crimson floods neutral tiles beside you, Cobalt freezes an enemy cluster, Viridian creeps onto a new tile every turn, Ochre swaps two tiles, Violet starves an opponent of paint, and Amber splashes a tile and its neighbours.',
    },
    {
      question: 'Why can I not claim that tile?',
      answer:
        'Either it is already yours, it is frozen, or its price is higher than the paint you have left. The cost is printed on every claimable neutral tile.',
    },
    {
      question: 'Is there voice chat?',
      answer:
        'Yes. Online rooms carry PlayDeck voice chat on the same channel as the game, so you can negotiate a truce and then break it in the same turn.',
    },
    {
      question: 'Can I play Color Thief with a keyboard only?',
      answer:
        'Yes. The grid is a real focusable grid: arrows or WASD move, Enter claims, Q aims your ability, E ends the turn, and every tile announces its owner and price.',
    },
  ],
});

export const colorThiefContent = colorThiefGame.content;
export const colorThiefDefinition = colorThiefGame.definition;
