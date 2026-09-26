import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const kingdomDraftGame = defineGameModule({
  id: 'kingdom-draft',
  description:
    'Draft resources, construct 3x3 realm grids, trigger spatial adjacency synergies, and achieve secret objectives in 2–6 player rooms with WebRTC voice chat.',
  category: GameCategories.S,
  players: getPCount(2, 6),
  releaseDate: '2026-09-20',
  tags: [
    GameTags.ST,
    GameTags.M_P,
    GameTags.V_C,
    GameTags.S,
    GameTags.CARD_DRAFTING,
    GameTags.GRID_BUILDING,
  ],
  seo: {
    title: 'Kingdom Draft — Spatial Strategy Realm Drafting | PlayDeck',
    description:
      'Draft lands, guilds, and bastions into a 3x3 realm. Align spatial synergies and fulfill hidden ambitions in 2–6 player strategy drafting on PlayDeck.',
    keywords: [
      'kingdom draft',
      'drafting strategy game',
      'kingdom building game online',
      'spatial grid game',
      'multiplayer card drafting',
      'medieval strategy game online',
    ],
  },
  tagline:
    'Draft provinces, towns, and bastions from a shared pool to build an interconnected 3x3 miniature realm.',
  overview: [
    'Kingdom Draft is a competitive 2 to 6 player drafting strategy game where players vie to construct the most prosperous, culturally rich, and fortified realm.',
    'Over three rounds of snake drafting, players select resource cards representing fertile farmlands, bustling guild towns, defensive fortresses, and grand cultural wonders.',
    'Each drafted card is strategically placed into a 3x3 grid. Clever positioning creates spatial adjacency synergies—such as farms positioned along river deltas, or barracks placed alongside defensive bastions.',
    'Hidden secret objectives dealt at the beginning of the match reward focused specialization, while balanced kingdoms compete for the prestigious Imperial Harmony crown.',
  ],
  howToPlay: [
    {
      title: 'Inspect Secret Ambitions',
      description:
        'Review your private secret objective card at the start of the match. Specializing in your target category earns up to 20 bonus victory points at coronation.',
    },
    {
      title: 'Draft Provinces in Snake Order',
      description:
        'When your turn arrives, select a card from the shared draft pool. Turn order reverses each round, giving trailing players valuable early picks.',
    },
    {
      title: 'Build Upon Your 3x3 Grid',
      description:
        'Immediately assign your drafted card to an empty plot in your 3x3 kingdom. Choose tiles that trigger spatial adjacency bonuses with neighboring cards.',
    },
    {
      title: 'Monitor Rival Realms',
      description:
        'Keep an eye on opponents miniature kingdoms to anticipate their secret objectives, contest key cards, and secure scoring leads.',
    },
    {
      title: 'Coronation and Scoring',
      description:
        'After 3 rounds and 9 draft picks, kingdoms are fully populated. Base card values, adjacency bonuses, and completed secret objectives are tallied.',
    },
  ],
  rules: [
    {
      title: 'Kingdom Grid Dimensions',
      description:
        'Each players realm consists of a 3x3 grid containing exactly 9 plots, filled across 3 rounds of 3 draft picks each.',
    },
    {
      title: 'Snake Drafting Rotation',
      description:
        'Drafting order is determined via snake draft: forward in odd rounds and reversed in even rounds for competitive balance.',
    },
    {
      title: 'Orthogonal Adjacency Synergies',
      description:
        'Synergies trigger between cards placed orthogonally adjacent (north, south, east, west) matching their partner resource category.',
    },
    {
      title: 'Secret Objectives',
      description:
        'Secret objectives remain concealed until final coronation. Meeting requirement thresholds awards +18 to +20 bonus points.',
    },
    {
      title: 'Final Valuation',
      description:
        'Final victory score is the sum of all tile base values, adjacency synergy bonuses, and validated secret objective rewards.',
    },
  ],
  controls: [
    {
      key: 'Click / Tap',
      action: 'Select a card from the draft pool or click an empty grid cell to construct.',
    },
    {
      key: 'Toggle Show/Hide',
      action: 'Toggle secret objective card visibility for local privacy.',
    },
  ],
  tips: [
    'Placing synergistic cards near the center of the 3x3 grid maximizes scoring potential by offering four adjacent neighbors.',
    'Do not ignore your secret objective: the +18 to +20 bonus points frequently decides the coronation champion.',
    'Notice when a rival is heavily drafting Defense or Gold; hate-drafting a card they need can disrupt their scoring.',
    'Balanced kingdoms with at least one tile of each category qualify for the massive Imperial Harmony +20 bonus.',
  ],
  faq: [
    {
      question: 'How many players can play Kingdom Draft?',
      answer:
        'Kingdom Draft supports 2 to 6 players, with intelligent AI bot governors ready to play offline or fill empty lobby seats.',
    },
    {
      question: 'Can I move a tile once it is built on the grid?',
      answer:
        'No. Once a tile is placed into a grid cell, its location is permanent for the remainder of the match.',
    },
    {
      question: 'Is voice chat enabled in Kingdom Draft rooms?',
      answer:
        'Yes! Real-time WebRTC mesh voice chat allows governors to discuss strategy, bluff about ambitions, and banter.',
    },
  ],
});

export const kingdomDraftContent = kingdomDraftGame.content;
export const kingdomDraftDefinition = kingdomDraftGame.definition;
