import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const flappyArcadeGame = defineGameModule({
  id: 'flappy-arcade',
  description:
    'Pilot the cyber-glider through hazardous energy conduits. Tap or press space to thrust against gravity, dodge pulsing pylons, and climb the flight leaderboards.',
  category: GameCategories.A,
  players: getPCount(1),
  releaseDate: GameReleaseDates.D_2026_09_18,
  tags: [GameTags.A, GameTags.S, GameTags.HS, GameTags.RETRO],
  seo: {
    title: 'Play Flappy Arcade Online Free — Tap to Fly Game',
    description:
      'Fly the cyber-glider through glowing conduits. Tap or press space to thrust against gravity, dodge pulsing pylons, and climb the flight leaderboards.',
    keywords: [
      'flappy arcade',
      'flappy bird online free',
      'tap to fly game',
      'play flappy arcade',
      'flying arcade game',
      'browser obstacle game',
    ],
  },
  tagline: 'Thrust against gravity, thread the conduits, and chase the record.',
  overview: [
    'Flappy Arcade brings classic tap-to-fly mechanics into PlayDeck’s cyber-arcade universe. Take flight in a lightweight pulse glider navigating a perilous gauntlet of high-energy conduits and hazardous neon barriers.',
    'Every tap fires a burst of thrust upward before gravity pulls you back down. The challenge lies in timing your altitude to glide through narrow clearance gaps as the pace steadily accelerates. Simple to learn in seconds, yet intensely competitive when chasing all-time flight records.',
  ],
  howToPlay: [
    {
      title: 'Tap or press space to thrust',
      description:
        'Press Space, the up arrow key, or tap the screen to fire an upward burst of altitude.',
    },
    {
      title: 'Counteract constant gravity',
      description:
        'Without active thrust, your glider accelerates downward toward the energy floor.',
    },
    {
      title: 'Thread through conduit gaps',
      description:
        'Carefully align your vertical flight path to pass cleanly through each pair of energy pylons.',
    },
    {
      title: 'Survive the speed ramp',
      description:
        'As your score climbs, the conduit scroll speed increases and clearance gaps narrow.',
    },
  ],
  rules: [
    {
      title: 'One point per conduit',
      description:
        'Clearing the center threshold of an energy conduit awards one point to your score.',
    },
    {
      title: 'Zero collision tolerance',
      description:
        'Touching any conduit wall, the upper boundary, or the ground immediately terminates flight.',
    },
    {
      title: 'Dynamic difficulty escalation',
      description:
        'Conduit spacing and flight velocity dynamically scale upward as your score increases.',
    },
    {
      title: 'Persistent high score',
      description:
        'Your personal best score and flight medals are automatically saved to your profile.',
    },
  ],
  controls: [
    {
      key: 'Space / ↑ / W',
      action: 'Fire thruster (gain altitude)',
    },
    {
      key: 'Left Click / Tap',
      action: 'Mobile / mouse thrust',
    },
    {
      key: 'P',
      action: 'Pause / resume flight',
    },
  ],
  tips: [
    'Rhythm beats panic. Small, rhythmic taps keep your altitude much more stable than sudden desperate bursts.',
    'Aim for the lower third of the gap. Since you rise quickly with each tap, entering from slightly below gives you more margin.',
    'Anticipate the next conduit early. Adjust your altitude while approaching rather than trying to correct at the last second.',
    'Stay calm as speed ramps up. The physics feel faster, but consistent cadence will still guide you safely through.',
  ],
  faq: [
    {
      question: 'Is Flappy Arcade free to play?',
      answer:
        'Yes. Flappy Arcade is 100% free and playable right in your web browser with no download or sign-up needed.',
    },
    {
      question: 'Can I play on mobile or tablet?',
      answer:
        'Yes. Flappy Arcade features responsive touch controls optimized for smartphones and tablets.',
    },
    {
      question: 'How are flight medals earned?',
      answer:
        'Earn the Bronze Wing medal at 10 points, Silver Pilot at 25 points, and the coveted Gold Ace medal at 50 points.',
    },
    {
      question: 'Does the game save my high score?',
      answer:
        'Yes. Your best score and detailed flight history are automatically saved in local browser storage.',
    },
  ],
});

export const flappyArcadeContent = flappyArcadeGame.content;
export const flappyArcadeDefinition = flappyArcadeGame.definition;
