import type { GameContent } from '@playdeck/game-types';

export const stickmanSwordFightContent: GameContent = {
  id: 'stickman-sword-fight',
  seo: {
    title: 'Stickman Sword Fight — Martial Arts Dueling | PlayDeck',
    description:
      'Parry incoming strikes, counter-slash with precision katana slashes, and defeat martial arts masters in Stickman Sword Fight on PlayDeck.',
    keywords: [
      'stickman sword fight',
      'sword duel game',
      'katana duel',
      'parry combat game',
      'martial arts arcade',
      'stickman fighter',
      'tactile combat game',
    ],
  },
  tagline: 'Deflect razor-sharp blades, break opponent posture, and strike with lethal precision.',
  overview: [
    'Stickman Sword Fight is a high-intensity 1-on-1 martial arts sword dueling game emphasizing timing, parrying, and posture management.',
    'Square off against skilled ronin and shadow samurai. Read incoming wind-ups, raise your blade at the exact impact frame for perfect parries, and retaliate with lethal counter-slashes.',
    'Manage stamina and posture meters: exhaust your foe with successive deflected blows to trigger a devastating stance-breaking finisher.',
  ],
  howToPlay: [
    {
      title: 'Light and heavy slashes',
      description:
        'Press J or Left Click for swift light slashes. Hold or use combo sequences to execute heavy guard-crushing overhead strikes.',
    },
    {
      title: 'Deflection and parrying',
      description:
        'Press K or Right Click right as an opponent attack lands to perform a spark deflection, staggering them and resetting your posture.',
    },
    {
      title: 'Tactical dash dodge',
      description:
        'Press Space to dash backwards or roll through unblockable thrust attacks, maintaining favorable spacing.',
    },
    {
      title: 'Posture break execution',
      description:
        'Fill the enemy posture gauge through aggressive parries and strikes to stun them for an instant critical execute.',
    },
  ],
  rules: [
    {
      title: 'Health and posture meters',
      description:
        'Both fighters possess Health (100 HP) and Posture (100). Blocking without parrying drains posture; when full, the defender is staggered.',
    },
    {
      title: 'Perfect parry timing',
      description:
        'A parry executed within the 200ms strike window inflicts posture damage on the attacker without consuming your own stamina.',
    },
    {
      title: 'Stamina recovery',
      description:
        'Swinging wildly exhausts stamina. Keep your guard steady or disengage briefly to replenish offensive stamina.',
    },
    {
      title: 'Best of three rounds',
      description:
        'Duels are decided across three tournament rounds. Win two rounds to conquer the dojo and advance to stronger masters.',
    },
  ],
  controls: [
    { key: 'A / D or Left / Right', action: 'Move / Spacing' },
    { key: 'J / Left Click', action: 'Quick Slash / Combo Strike' },
    { key: 'K / Right Click', action: 'Guard / Perfect Parry' },
    { key: 'Space', action: 'Dash Dodge / Evasion Roll' },
    { key: 'W / Up Arrow', action: 'Jump Leap Attack' },
  ],
  tips: [
    'Do not spam attack; wait for the opponent to commit to a swing and tap parry just before impact.',
    'Heavy enemy attacks flash with a red spark warning — dodge backwards rather than attempting a standard block.',
    'When the opponent posture meter turns red, unleash your light attack combo to land a posture-break finisher.',
    'Use quick forward dashes to close the distance immediately after deflecting a heavy blow.',
  ],
  faq: [
    {
      question: 'Can two players duel locally on the same keyboard?',
      answer:
        'Yes! Stickman Sword Fight supports local 2-Player Versus mode using split keyboard controls (WASD/FG vs Arrows/KL).',
    },
    {
      question: 'What happens when posture is fully broken?',
      answer:
        'A posture-broken warrior drops their guard for two full seconds, allowing any clean slash to inflict double damage.',
    },
    {
      question: 'Are there multiple difficulty settings?',
      answer:
        'Yes, you can choose from Apprentice (Easy), Ronin (Normal), Sensei (Hard), and Shogun (Expert) AI opponents.',
    },
  ],
};
