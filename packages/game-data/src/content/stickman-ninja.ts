import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const stickmanNinjaGame = defineGameModule({
  id: 'stickman-ninja',
  description:
    'Shadow stealth infiltration, throwing star trajectory physics, ceiling grappling, and silent takedowns.',
  category: GameCategories.A,
  players: getPCount(1),
  releaseDate: '2026-09-26',
  tags: [GameTags.ACT, GameTags.STEALTH, GameTags.NINJA, GameTags.SHADOW, GameTags.HS],
  subtype: 'ninja',
  difficultyPresets: ['normal', 'hard', 'expert'],
  seo: {
    title: 'Stickman Ninja — Shadow Stealth Action Arcade | PlayDeck',
    description:
      'Infiltrate feudal fortresses, evade watchful samurai vision cones, hurl lethal shurikens, and execute silent takedowns in Stickman Ninja on PlayDeck.',
    keywords: [
      'stickman ninja',
      'stealth arcade game',
      'ninja infiltration',
      'shuriken throwing game',
      'shadow assassin game',
      'browser ninja game',
      'silent takedown arcade',
    ],
  },
  tagline:
    'Slip through shadows, throw aerodynamic shurikens, and silence guards before the alarm sounds.',
  overview: [
    'Stickman Ninja immerses you in tactical feudal stealth, requiring patience, shadows, and lethal precision to dismantle fortified castles.',
    'Creep past watchful samurai sentries and lantern beams. Stay hidden in rafters and smoke clouds, calculate ballistic shuriken throws, and eliminate targets silently.',
    'Deploy smoke bombs to vanish from alerted guards, scale castle parapets, and infiltrate the inner sanctum to retrieve sacred scrolls.',
  ],
  howToPlay: [
    {
      title: 'Creep through shadows',
      description:
        'Use A and D to move. Crouch or move slowly to quiet your footsteps and avoid expanding your noise detection radius.',
    },
    {
      title: 'Precision shuriken throws',
      description:
        'Click and drag or aim your mouse to line up the shuriken flight trajectory. Release to throw with aerodynamic physics.',
    },
    {
      title: 'Silent takedowns',
      description:
        'Approach unsuspecting guards from behind or drop from overhead rafters to execute an instant, silent takedown.',
    },
    {
      title: 'Deploy smoke bombs',
      description:
        'When spotted, press E or Space to detonate a smoke bomb, blinding guards and resetting their alert meters.',
    },
  ],
  rules: [
    {
      title: 'Vision cone detection',
      description:
        'Guards project yellow search cones. Entering a cone fills their alertness gauge; at full meter, they trigger castle alarms.',
    },
    {
      title: 'Sound radius',
      description:
        'Sprinting or striking surfaces generates sound waves that draw nearby guards to investigate your position.',
    },
    {
      title: 'Limited ninja tools',
      description:
        'You carry a finite supply of shurikens and smoke bombs per level. Retrieve thrown stars or loot armories to replenish.',
    },
    {
      title: 'Infiltration objectives',
      description:
        'Eliminate all sentries or reach the secret scroll vault undetected to earn the highest Shinobi Master rank score.',
    },
  ],
  controls: [
    {
      key: 'A / D or Left / Right',
      action: 'Sneak / Walk',
    },
    {
      key: 'W / Up Arrow',
      action: 'Jump / Rafter Vault',
    },
    {
      key: 'S / Down Arrow',
      action: 'Crouch / Hide in Shadow',
    },
    {
      key: 'Left Click',
      action: 'Aim & Throw Shuriken',
    },
    {
      key: 'E / Space',
      action: 'Deploy Smoke Bomb',
    },
    {
      key: 'F',
      action: 'Silent Takedown (Behind Target)',
    },
  ],
  tips: [
    'Distract guards by throwing a shuriken against wooden walls or metal bells to lure them away from their patrol posts.',
    'Remain stationary inside shadowy alcoves — guards cannot spot you in deep darkness unless they walk directly into you.',
    'Dropping from rafters onto a guard guarantees an instant silent assassination with zero alarm generation.',
    'Save smoke bombs for when multiple samurai converge on your location simultaneously.',
  ],
  faq: [
    {
      question: 'Can guards see through smoke bomb clouds?',
      answer:
        'No, smoke bomb clouds completely block vision cones and allow you to slip away or take down confused guards.',
    },
    {
      question: 'What happens if the alarm is triggered?',
      answer:
        'Reinforcements are dispatched and guard vision ranges increase. You must eliminate all alerted sentries or hide until alerts subside.',
    },
    {
      question: 'Are there multiple levels in Stickman Ninja?',
      answer:
        'Yes, you progress through increasingly complex fortress courtyards, pagoda rooftops, and inner warlord vaults.',
    },
  ],
});

export const stickmanNinjaContent = stickmanNinjaGame.content;
export const stickmanNinjaDefinition = stickmanNinjaGame.definition;
