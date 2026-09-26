import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const tinyIslandGame = defineGameModule({
  id: 'tiny-island',
  name: 'Tiny Island',
  description:
    'The island shrinks every round. Players collect resources, build bridges, block paths, and steal from each other to survive.',
  category: GameCategories.S,
  players: getPCount(2, 6),
  releaseDate: '2026-09-18',
  tags: [GameTags.M_P, GameTags.V_C, GameTags.AI, GameTags.LP, GameTags.SURVIVAL, GameTags.TB],
  seo: {
    title: 'Tiny Island — Sinking Island Survival Online',
    description:
      'Play Tiny Island free online. Outlast rivals on a shrinking tropical island. Gather resources, construct bridges, and push opponents into the sea.',
    keywords: [
      'tiny island',
      'sinking island game',
      'island survival multiplayer',
      'grid survival game',
      'browser battle royale',
      'voice chat party game',
      'free multiplayer strategy',
    ],
  },
  tagline: 'The ocean rises each round. Gather, fortify, push, and survive.',
  overview: [
    'Tiny Island is a turn-based multiplayer tactical survival game where players must endure the rising tide on a diminishing tropical paradise. Each round, outer perimeter tiles shudder, fracture, and sink beneath the waves.',
    'To survive, castaways explore the shifting grid to harvest wood from coconut groves and jungle forests, quarry stone from volcanic crags, and scavenge beach debris. Resources allow you to construct wooden bridges across water, erect stone barricades to block opponents, or fashion an emergency raft.',
    'Play solo against tactical AI survivors or launch an online room for up to 6 players with integrated WebRTC voice chat. Form shaky alliances, trade resources, or push your rivals off the crumbling precipice.',
  ],
  howToPlay: [
    {
      title: 'Move and explore the island',
      description:
        'Spend Action Points (AP) each turn to traverse adjacent sand, grass, or stone tiles. Position yourself away from perimeter danger zones.',
    },
    {
      title: 'Harvest vital materials',
      description:
        'Gather wood from jungle groves and stone from mountain outcroppings. Each tile contains valuable crafting components.',
    },
    {
      title: 'Craft bridges and fortifications',
      description:
        'Use 2 wood to place bridges across submerged waters, or 2 stone to build protective barriers that deflect aggressive pushes.',
    },
    {
      title: 'Shove opponents overboard',
      description:
        'When standing adjacent to a rival castaway, spend AP to push them backwards toward the edge of the world or into the open sea.',
    },
  ],
  rules: [
    {
      title: 'Action Points (AP) govern each turn',
      description:
        'Every living player receives 2 Action Points per round. Moving, gathering, building, pushing, and stealing each cost 1 AP.',
    },
    {
      title: 'Perimeter tiles sink each round',
      description:
        'Tiles marked with a yellow warning will plunge beneath the waves at the conclusion of the round. Any survivor caught on sinking land without a raft is eliminated.',
    },
    {
      title: 'Bridges permit water crossing',
      description:
        'Wooden bridges turn water tiles into walkable paths, allowing castaways to escape isolated peninsulas or navigate between landmasses.',
    },
    {
      title: 'Rafts provide a second chance',
      description:
        'Crafting an emergency raft protects you against one fatal fall or tile sink, automatically deploying to keep you in the match.',
    },
  ],
  controls: [
    {
      key: 'W / A / S / D or Arrows',
      action: 'Move to adjacent tile',
    },
    {
      key: 'G',
      action: 'Gather / scavenge resources',
    },
    {
      key: 'Space',
      action: 'Pass remainder of turn',
    },
    {
      key: 'Mouse / Touch',
      action: 'Click tiles and action buttons',
    },
  ],
  tips: [
    'Migrate toward the central high ground: the center peak is always the last landmass to submerge.',
    'Build a raft early: an emergency raft guarantees survival if an aggressive opponent shoves you off the edge.',
    'Use stone barricades to funnel opponents: blocking choke points forces rivals onto unstable sinking tiles.',
    'Negotiate on voice: form temporary truces to target resource leaders before turning on each other in the final stand.',
  ],
  faq: [
    {
      question: 'How many players can join a Tiny Island match?',
      answer:
        'Tiny Island supports 2 to 6 players. In solo matches or smaller parties, responsive AI bots with distinct tactical personalities automatically fill open seats.',
    },
    {
      question: 'What happens when a tile sinks?',
      answer:
        'The tile permanently submerges into the deep ocean. Any player standing on that tile must possess a raft, or they are eliminated from the expedition.',
    },
    {
      question: 'Can I play with friends online over voice chat?',
      answer:
        'Yes! Create an online room, share the 6-digit invite code or direct link, and enjoy seamless browser WebRTC mesh voice chat.',
    },
  ],
});

export const tinyIslandContent = tinyIslandGame.content;
export const tinyIslandDefinition = tinyIslandGame.definition;
