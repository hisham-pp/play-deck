import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const stickmanShooterGame = defineGameModule({
  id: 'stickman-shooter',
  description:
    'Tactical cover shooting, timed bullet dodges, and precision weapon recoil mastery in an escalating stickman warzone.',
  category: GameCategories.A,
  players: getPCount(1),
  releaseDate: '2026-09-26',
  tags: [GameTags.ACT, GameTags.SHOOTER, GameTags.AIM, GameTags.REFLEXES, GameTags.HS],
  subtype: 'shooter',
  difficultyPresets: ['easy', 'normal', 'hard', 'expert'],
  seo: {
    title: 'Stickman Shooter — Cover Shooting Arcade | PlayDeck',
    description:
      'Duck behind cover, time your counter-shots, dodge bullet storms, and eliminate escalating waves of enemy marksmen in Stickman Shooter.',
    keywords: [
      'stickman shooter',
      'cover shooter game',
      'tactical stickman shooter',
      'arcade gun game',
      'browser shooting game',
      'bullet dodge game',
      'wave defense arcade',
    ],
  },
  tagline: 'Take cover, time your breach, and eliminate enemy marksmen with pinpoint accuracy.',
  overview: [
    'Stickman Shooter puts you in the boots of an elite operative locked in intense firefights across tactical battlefields.',
    'Use bunker barriers and sandbags to duck incoming bullet storms, watch enemy telegraphs, and pop up to deliver devastating precision counter-shots.',
    'Survive escalating enemy waves featuring aggressive assault riflemen, long-range snipers, and heavily armored squad leaders while maintaining your combo multiplier.',
  ],
  howToPlay: [
    {
      title: 'Aim and fire',
      description:
        'Move your mouse to aim the tactical crosshairs and left-click (or tap screen) to fire your weapon.',
    },
    {
      title: 'Duck into cover',
      description:
        'Press S, ArrowDown, or Space to drop down into full cover to block standard enemy gunfire and reload safely.',
    },
    {
      title: 'Reload under protection',
      description:
        'Press R or tap your ammo counter to reload fresh magazines before you get caught empty-chambered.',
    },
    {
      title: 'Chain headshots',
      description:
        'Target enemy heads for instant critical damage and build a score multiplier before the combo timer drains.',
    },
  ],
  rules: [
    {
      title: 'Damage vulnerability',
      description:
        'While standing to aim, you are vulnerable to incoming enemy fire. Only your reinforced cover protects your health pool.',
    },
    {
      title: 'Magazine management',
      description:
        'Weapons hold a finite magazine. Firing while empty triggers a click; always reload behind cover between target engagements.',
    },
    {
      title: 'Enemy wave escalations',
      description:
        'Each cleared wave brings faster enemy reaction times, higher damage output, and varied combatant archetypes.',
    },
    {
      title: 'Combo multiplier decay',
      description:
        'Score multipliers rapidly decay if you spend too long idling behind cover without eliminating hostiles.',
    },
  ],
  controls: [
    {
      key: 'Mouse Move / Drag',
      action: 'Aim crosshairs at hostile targets',
    },
    {
      key: 'Left Click / Tap',
      action: 'Fire currently equipped weapon',
    },
    {
      key: 'S / ArrowDown / Space',
      action: 'Toggle duck and cover posture',
    },
    {
      key: 'R / Tap Ammo Bar',
      action: 'Reload magazine with fresh rounds',
    },
  ],
  tips: [
    'Watch the red warning glints over enemy heads—they indicate an imminent shot, signaling you to drop into cover immediately.',
    'Sniper enemies take longer to aim but deal massive single-shot damage; prioritize neutralizing them first.',
    'Reloading takes roughly 1.2 seconds, so always reload while crouched behind barriers instead of in the open.',
    'Aim for headshots whenever possible to drop enemies in one round and maintain your combo multiplier.',
  ],
  faq: [
    {
      question: 'Can I play Stickman Shooter on mobile phones and tablets?',
      answer:
        'Yes, Stickman Shooter features on-screen tactile fire, cover, and reload touch controls optimized for mobile browsers.',
    },
    {
      question: 'How do headshots work?',
      answer:
        'Hitting the head of an enemy stickman awards 2.5x critical damage and extra combo bonus points.',
    },
    {
      question: 'Does the game save my high score?',
      answer:
        'Yes! Your best wave and highest arcade score are automatically saved to your PlayDeck player profile and progression stats.',
    },
  ],
});

export const stickmanShooterContent = stickmanShooterGame.content;
export const stickmanShooterDefinition = stickmanShooterGame.definition;
