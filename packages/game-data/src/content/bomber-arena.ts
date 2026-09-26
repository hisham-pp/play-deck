import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const bomberArenaGame = defineGameModule({
  id: 'bomber-arena',
  name: 'Bomber Arena',
  description:
    'Fast-paced multiplayer action in destructible arenas. Place bombs, collect power-ups, trigger chain reactions, and be the last player standing.',
  category: GameCategories.A,
  players: getPCount(1, 4),
  releaseDate: '2026-09-24',
  tags: [GameTags.A, GameTags.S, GameTags.LP, GameTags.M_P, GameTags.AI],
  featured: true,
  seo: {
    title: 'Bomber Arena — Classic Arcade Action | PlayDeck',
    description:
      'Fast-paced multiplayer action in destructible arenas. Place bombs, collect power-ups, trigger chain reactions, and be the last player standing.',
    keywords: [
      'bomber arena',
      'bomberman online',
      'arcade bomb game',
      'multiplayer arena',
      'retro action game',
      'browser bomber game',
      'destructible arena',
      'chain reaction game',
    ],
  },
  tagline: 'Trap your rivals, trigger blazing chain reactions, and claim the arena.',
  overview: [
    'Bomber Arena is a fast-paced multiplayer arcade showdown where strategic placement and spatial awareness reign supreme.',
    'Navigate procedural grid mazes filled with destructible crates, power-up caches, and deadly blast radiuses. Trap opponents in tight corners, time your fuses, and chain explosions across the board.',
    'Play solo against reactive AI combatants or go head-to-head in local two-player duel mode with responsive keyboard and touch controls.',
  ],
  howToPlay: [
    {
      title: 'Navigate the grid maze',
      description:
        'Move through open lanes and weave around indestructible pillars to position yourself tactically.',
    },
    {
      title: 'Blast crates to find power-ups',
      description:
        'Lay bombs next to destructible blocks to uncover extra bombs, flame range extenders, speed boosts, and kinetic shields.',
    },
    {
      title: 'Corner and eliminate opponents',
      description:
        'Cut off escape corridors with timed explosives and catch rivals within expanding flame lines.',
    },
    {
      title: 'Survive to win the round',
      description:
        'Dodge blast crossfire and outlast every other bomber to earn victory points and claim the match.',
    },
  ],
  rules: [
    {
      title: 'Timed explosive fuse',
      description:
        'Bombs detonate automatically after 2.5 seconds, shooting cross-shaped flames in all four cardinal directions.',
    },
    {
      title: 'Explosion line of sight',
      description:
        'Flames penetrate through open paths up to your blast range, but are stopped immediately by solid walls and crates.',
    },
    {
      title: 'Chain reaction triggers',
      description:
        'Any bomb caught in another bomb’s explosion detonates instantaneously, causing cascading blast waves.',
    },
    {
      title: 'Kinetic shield defense',
      description:
        'Shield power-ups absorb a single fatal explosion and grant brief temporary invulnerability before dissipating.',
    },
  ],
  controls: [
    {
      key: 'WASD / Arrow Keys',
      action: 'Move Player 1 through arena corridors',
    },
    {
      key: 'Spacebar',
      action: 'Place bomb at Player 1’s current tile',
    },
    {
      key: 'IJKL / Enter',
      action: 'Move & place bomb for Player 2 (Local Versus mode)',
    },
    {
      key: 'On-Screen D-Pad & Button',
      action: 'Full touch movement and bomb placement on mobile devices',
    },
  ],
  tips: [
    'Always verify your escape route before dropping a bomb in dead-end alleys.',
    'Stack flame range power-ups early to control entire cross-grid avenues.',
    'Use chain explosions to instantly punish opponents hiding behind their own bombs.',
    'Kinetic shields provide a bold offensive window to rush aggressive opponents.',
  ],
  faq: [
    {
      question: 'How do I place more than one bomb at a time?',
      answer:
        'Destroy crates to uncover Bomb Power-Up icons (+B). Each one increases your concurrent bomb capacity up to five.',
    },
    {
      question: 'Can I kick or move bombs after planting them?',
      answer:
        'Bombs are solid barriers once planted. You can slip past immediately when planting, but cannot push them across the floor.',
    },
    {
      question: 'What happens if two players detonate simultaneously?',
      answer:
        'If both players are caught in the crossfire without shields, a double elimination triggers and the round ends in a draw.',
    },
  ],
});

export const bomberArenaContent = bomberArenaGame.content;
export const bomberArenaDefinition = bomberArenaGame.definition;
