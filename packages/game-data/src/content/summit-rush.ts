import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const summitRushGame = defineGameModule({
  id: 'summit-rush',
  description:
    'Hill-climb through endless ridges in a springy dune buggy. Balance on the throttle, grab fuel, land flips, upgrade your ride, and race a friend online with voice chat.',
  category: GameCategories.A,
  players: getPCount(1, 2),
  releaseDate: GameReleaseDates.D_2026_09_17,
  tags: [
    GameTags.A,
    GameTags.PH,
    GameTags.DRIVING,
    GameTags.UPGRADES,
    GameTags.ONLINE_RACE,
    GameTags.V_C,
  ],
  seo: {
    title: 'Play Summit Rush — Free Hill Climb Racing Game',
    description:
      'Play Summit Rush free in your browser. Climb endless ridges in a physics-driven buggy, manage fuel, land flips, upgrade your ride and race a friend online.',
    keywords: [
      'hill climb racing online',
      'free driving physics game',
      'uphill buggy game',
      'summit rush game',
      'online racing with voice chat',
      'browser climbing game',
    ],
  },
  tagline: 'Hill-climb through endless ridges in a springy dune buggy — balance, fuel, and flips.',
  overview: [
    'Summit Rush is a physics hill-climber. You drive a springy dune buggy across procedurally generated terrain with two inputs — throttle and brake — and everything interesting comes from how the suspension, weight transfer and gravity interact with those two pedals.',
    'Distance is limited by fuel, which you collect along the route, and by your neck: land on your roof and the run is over. Clean flips and big air pay out bonuses you spend on upgrades to the engine, suspension, grip and tank. Online mode races a friend over a room code with voice chat on the same channel.',
  ],
  howToPlay: [
    {
      title: 'Hit the throttle',
      description:
        'Press the gas to accelerate. On an incline, the buggy’s nose lifts as torque transfers to the rear.',
    },
    {
      title: 'Balance in the air',
      description:
        'Throttle rotates you backwards in flight and brake rotates you forwards. Use both to line up the landing.',
    },
    {
      title: 'Collect fuel',
      description:
        'Fuel cans along the route top up your tank. Run dry and the run ends wherever you stop.',
    },
    {
      title: 'Land flips for bonuses',
      description:
        'Complete a rotation and land on your wheels to bank a bonus. Landing on the roof ends the run.',
    },
    {
      title: 'Spend on upgrades',
      description:
        'Put your earnings into engine, suspension, grip or fuel capacity to push the next run further.',
    },
  ],
  rules: [
    {
      title: 'Fuel limits the run',
      description: 'The tank drains continuously while driving. Reaching empty ends the attempt.',
    },
    {
      title: 'A crash ends the run',
      description: 'If the driver’s head touches the ground, the run is over regardless of fuel.',
    },
    {
      title: 'Distance is the score',
      description:
        'How far you climb is the primary score, with flips and air time paying bonus coins on top.',
    },
    {
      title: 'Upgrades persist',
      description:
        'Upgrades you buy carry across runs, so each attempt starts stronger than the last.',
    },
  ],
  controls: [
    {
      key: 'D / →',
      action: 'Throttle',
    },
    {
      key: 'A / ←',
      action: 'Brake / reverse',
    },
    {
      key: 'Space / Enter',
      action: 'Start / throttle',
    },
    {
      key: 'P / Esc',
      action: 'Pause / resume',
    },
    {
      key: 'R',
      action: 'Restart run',
    },
    {
      key: 'Touch pedals',
      action: 'Gas and brake on mobile',
    },
  ],
  tips: [
    'Feather the throttle uphill. Flooring it spins the wheels and flips you backwards long before it gets you to the crest.',
    'Brake on the way down a slope to keep the nose up, then release into the climb to carry momentum through the trough.',
    'Never leave a fuel can behind because you are moving fast. Momentum is replaceable; an empty tank is not.',
    'Upgrade the engine and fuel tank before suspension. Reach is what unlocks the later, more lucrative terrain.',
    'In flight, correct early and gently. Big throttle stabs late in a jump are how clean flips become roof landings.',
  ],
  faq: [
    {
      question: 'What kind of game is Summit Rush?',
      answer:
        'It is a physics-based hill-climbing driving game — throttle and brake only, with terrain and suspension doing the rest.',
    },
    {
      question: 'Can I race a friend?',
      answer:
        'Yes. Online mode pairs you over a room code and includes voice chat on the same realtime channel as the race.',
    },
    {
      question: 'How do upgrades work?',
      answer:
        'Coins earned from distance and stunt bonuses buy permanent upgrades to the engine, suspension, grip and fuel tank.',
    },
    {
      question: 'Does it work on mobile?',
      answer: 'Yes. On-screen gas and brake pedals replace the keyboard on touch devices.',
    },
  ],
});

export const summitRushContent = summitRushGame.content;
export const summitRushDefinition = summitRushGame.definition;
