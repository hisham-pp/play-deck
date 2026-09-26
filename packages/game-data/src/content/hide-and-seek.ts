import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const hideAndSeekGame = defineGameModule({
  id: 'hide-and-seek',
  name: 'Hide & Seek',
  description:
    'Play high-stakes Hide & Seek on PlayDeck. Outsmart seekers with camouflage and ghost invisibility, duck into secret closets, and survive the countdown timer.',
  category: GameCategories.CS,
  players: getPCount(3, 8),
  releaseDate: GameReleaseDates.D_2026_09_25,
  tags: [GameTags.P, GameTags.M_P, GameTags.S, GameTags.AI, GameTags.V_C],
  seo: {
    title: 'Hide & Seek — Multiplayer Social Stealth Party Game | PlayDeck',
    description:
      'Play high-stakes Hide & Seek on PlayDeck. Outsmart seekers with camouflage and ghost invisibility, duck into secret closets, and survive the countdown timer.',
    keywords: [
      'hide and seek game',
      'multiplayer hide and seek',
      'social stealth game',
      'prop hunt browser game',
      'infection tag game',
      'online party game',
      'playdeck hide and seek',
    ],
  },
  tagline: 'Vanish into hiding spots, trigger disguises, and evade the hunting seekers.',
  overview: [
    'Hide & Seek is a fast-paced multiplayer social stealth game pitting crafty hiders against keen-eyed seekers across detailed architectural arenas.',
    'During the opening countdown, seekers are blindfolded while hiders scatter into closets, air vents, cargo crates, and shadow corners.',
    'Deploy specialized abilities including box camouflage, temporary invisibility cloaks, and sonar radar pulses in an exhilarating infection-style showdown.',
  ],
  howToPlay: [
    {
      title: 'Scatter during the hiding phase',
      description:
        'When the match starts, seekers are frozen for 12 seconds. Sprint across the arena to find an isolated room or hiding spot.',
    },
    {
      title: 'Jump into hiding spots',
      description:
        'Approach closets, crates, and vents and press E to vanish inside. Stay quiet and watch the hallways for patrolling hunters.',
    },
    {
      title: 'Deploy tactical stealth abilities',
      description:
        'Hiders can activate box disguises or ghost invisibility cloaks to slip past seekers in tight corridors.',
    },
    {
      title: 'Hunt or survive until the clock stops',
      description:
        'Seekers use flashlight beams and radar sonar to detect heartbeats. Tagged hiders join the seeker squad until time runs out.',
    },
  ],
  rules: [
    {
      title: 'Infection tagging mechanics',
      description:
        'When a seeker closes within tag distance of a visible hider, that hider is caught and immediately recruited to the seeker hunting squad.',
    },
    {
      title: 'Hiding spot inspection',
      description:
        'Seekers can inspect nearby closets and crates. If an active hider is inside, they are discovered and tagged immediately.',
    },
    {
      title: 'Round scoring and victory',
      description:
        'Hiders earn survival bonus points if at least one hider survives until the timer expires. Seekers score points for every confirmed catch.',
    },
  ],
  controls: [
    {
      key: 'WASD / Arrow Keys',
      action: 'Move player across the arena',
    },
    {
      key: 'E Key',
      action: 'Enter or exit hiding spot / Inspect spot as seeker',
    },
    {
      key: '1 Key',
      action: 'Activate box camouflage (Hider) / Radar pulse (Seeker)',
    },
    {
      key: '2 Key',
      action: 'Activate temporary ghost invisibility cloak (Hider)',
    },
    {
      key: 'Spacebar',
      action: 'Trigger speed sprint dash',
    },
  ],
  tips: [
    'Do not stay in the obvious closet near the spawn point—venture deeper into the far rooms.',
    'Moving instantly breaks your box camouflage, so remain completely motionless when seekers pass by.',
    'Save your ghost invisibility cloak for emergency escapes when cornered in dead-end hallways.',
    'As a seeker, use your radar pulse when the arena goes quiet to pinpoint surviving hiders.',
  ],
  faq: [
    {
      question: 'Can I play solo against AI bots?',
      answer:
        'Yes! You can choose to play as either a Hider dodging AI Seekers or a Seeker hunting down smart AI Hiders.',
    },
    {
      question: 'What happens when a hider gets tagged?',
      answer:
        'Tagged hiders become seekers in infection mode, expanding the hunting team and ramping up the tension for remaining survivors.',
    },
    {
      question: 'Are there multiple maps to explore?',
      answer:
        'Yes, you can play in Shadowstone Manor with libraries and secret passages or Industrial Depot with shipping containers.',
    },
  ],
});

export const hideAndSeekContent = hideAndSeekGame.content;
export const hideAndSeekDefinition = hideAndSeekGame.definition;
