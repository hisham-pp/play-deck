import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameControlKeys } from '../enums/controls.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const tinyTankArenaGame = defineGameModule({
  id: 'tiny-tank-arena',
  description:
    'Small tanks fight in destructible arenas. Blast brick cover, detonate hazard barrels, scavenge unusual weapons, and be the last tank standing.',
  category: GameCategories.A,
  players: getPCount(2, 6),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.A, GameTags.M_P, GameTags.V_C, GameTags.PH, GameTags.LP],
  seo: {
    title: 'Tiny Tank Arena — Destructible Arena Tank Warfare | PlayDeck',
    description:
      'Drive miniature tanks in destructible arenas, blast brick cover, scavenge bouncing shells, and annihilate rivals in chaotic battles on PlayDeck.',
    keywords: [
      'tiny tank arena',
      'tank warfare game',
      'destructible arena game',
      'multiplayer tank battle',
      'ricochet tank game',
      'webrtc voice game',
      'online arcade tank game',
    ],
  },
  tagline:
    'Command miniature tanks in destructible arenas with limited ammunition and unusual weapons.',
  overview: [
    'Tiny Tank Arena is a chaotic multiplayer top-down combat game where 2 to 6 players pilot armored miniature tanks in fully destructible combat zones.',
    'Maneuver through tight corridors of solid steel and destructible brick barriers. Blast open flanking routes, detonate volatile hazard barrels to trigger fiery chain reactions, and ambush rival tanks.',
    'Scavenge combat crates to reload scarce ammunition and arm your turret with devastating exotic weaponry including ricochet bouncing shells, homing rockets, proximity mines, rapid-fire laser pulses, and kinetic rubber shells.',
    'Survive lethal skirmishes with kinetic shield barriers, outmaneuver autonomous AI units or friends in real-time online rooms, and prove your tactical supremacy as the last tank standing.',
  ],
  howToPlay: [
    {
      title: 'Drive and Maneuver Your Hull',
      description:
        'Use WASD or arrow keys to steer and drive forward or reverse. Tread marks track your path across the combat zone.',
    },
    {
      title: 'Aim and Fire Your Turret',
      description:
        'Aim independently with your mouse cursor or touch drag. Left-click or press Spacebar to fire your active cannon weapon.',
    },
    {
      title: 'Blast Cover & Detonate Barrels',
      description:
        'Chip away at destructible brick obstacles to expose enemy positions, or shoot explosive hazard barrels for high radial splash damage.',
    },
    {
      title: 'Scavenge Weapon Crates & Survive',
      description:
        'Roll over glowing supply crates to restock standard ammo, repair armor plating, charge energy shields, and equip special munitions.',
    },
  ],
  rules: [
    {
      title: 'Limited Munitions & Scavenging',
      description:
        'Standard cannons carry a 5-round clip that slowly recharges over time. Crates dropped on the map or uncovered in rubble grant instant ammunition.',
    },
    {
      title: 'Destructible Environment',
      description:
        'Brick barriers crumble when taking shell damage. Solid steel perimeter walls never break and can be used to ricochet bouncing munitions around corners.',
    },
    {
      title: 'Explosive Hazards',
      description:
        'Orange hazard barrels detonate instantly when struck by projectiles, dealing devastating radial blast damage and throwing nearby tanks with high kinetic force.',
    },
    {
      title: 'Last Tank Standing',
      description:
        'Matches run until only one surviving tank remains in the arena, or until the round countdown timer runs out where the commander with the highest score wins.',
    },
  ],
  controls: [
    {
      key: GameControlKeys.UP_DOWN,
      action: 'Drive tank forward or reverse',
    },
    {
      key: GameControlKeys.LEFT_RIGHT,
      action: 'Steer tank hull left or right',
    },
    {
      key: 'Mouse Movement',
      action: 'Aim turret independently in 360 degrees',
    },
    {
      key: 'Left-Click / Spacebar',
      action: 'Fire primary cannon or special weapon',
    },
    {
      key: '1 to 6 Number Keys',
      action: 'Cycle and switch equipped special munitions',
    },
    {
      key: GameControlKeys.ESC,
      action: 'Pause match or return to deployment bay',
    },
  ],
  tips: [
    'Bouncing shells reflect up to two times off steel and brick surfaces. Use them to eliminate opponents hiding behind corners without exposing your chassis.',
    'If an opponent is aggressively tailgating you, switch to proximity mines and deploy a charge directly behind your tracks to catch them in a massive blast.',
    'Keep your distance when shooting orange explosive barrels; their blast radius is extensive and will damage your own armor if you are caught in the perimeter.',
  ],
  faq: [
    {
      question: 'How many players can participate in Tiny Tank Arena?',
      answer:
        'Tiny Tank Arena supports 2 to 6 tanks. You can deploy into solo matches against up to 5 smart AI bots, or create a private multiplayer room with integrated voice chat.',
    },
    {
      question: 'How do weapon crates work?',
      answer:
        'Glowing supply crates periodically appear in open terrain and have a 25% chance of dropping from shattered brick walls. Collecting a crate unlocks special ammunition or defensive shields.',
    },
    {
      question: 'Does the game support mobile and touchscreen controls?',
      answer:
        'Yes! Touch controls allow intuitive virtual stick steering and responsive tap-to-aim firing across phones and tablets.',
    },
  ],
});

export const tinyTankArenaContent = tinyTankArenaGame.content;
export const tinyTankArenaDefinition = tinyTankArenaGame.definition;
