import type { GameContent } from '@playdeck/game-types';

export const fishingCompetitionContent: GameContent = {
  id: 'fishing-competition',
  seo: {
    title: 'Fishing Competition — Relaxing Angling Tournament | PlayDeck',
    description:
      'Cast, strike, and reel in trophy fish in Fishing Competition on PlayDeck. Balance line tension, navigate weather events, and top the leaderboard across five waters.',
    keywords: [
      'fishing competition game',
      'browser fishing game',
      'relaxing fishing simulator',
      'line tension fishing game',
      'multiplayer fishing online',
      'arcade angling tournament',
      'trophy fish game',
      'playdeck fishing',
    ],
  },
  tagline: 'Cast your line, manage line tension, and reel in legendary trophy catches.',
  overview: [
    'Fishing Competition is a relaxing yet thrilling angling tournament where players compete across diverse aquatic locations to land the heaviest catches.',
    'Charge your casting power to reach deeper waters, watch for bobber dips, strike at the perfect moment, and master line tension management to prevent snaps.',
    'Adapt to dynamic weather events like Golden Hour and Double Score Frenzy while filling your creel and climbing the tournament leaderboard.',
  ],
  howToPlay: [
    {
      title: 'Charge and cast your line',
      description:
        'Hold the Cast button or Spacebar to charge your casting power. Deeper casts increase the probability of rare and legendary fish.',
    },
    {
      title: 'Wait for bite ripples',
      description:
        'Keep your eyes on the floating bobber. When it plunges with a splash and exclamation cue, strike immediately to set the hook.',
    },
    {
      title: 'Manage reel line tension',
      description:
        'Hold the Reel button in controlled bursts to keep the tension needle inside the vibrant green sweet spot (35-75%).',
    },
    {
      title: 'Land the catch',
      description:
        'Deplete the fish distance to zero without snapping the line or letting it go slack to successfully haul your catch into your creel.',
    },
  ],
  rules: [
    {
      title: 'Tension threshold penalties',
      description:
        'Line tension above 75% risks snapping the line, while tension below 35% creates slack that allows fish to spit the hook.',
    },
    {
      title: 'Weather event bonuses',
      description:
        'Golden Hour triples the spawn rate of rare and legendary fish, while Double Score Frenzy doubles points for all landed catches.',
    },
    {
      title: 'Tournament timer',
      description:
        'Matches run on a countdown clock. Final rankings are calculated by cumulative score from all landed catches.',
    },
  ],
  controls: [
    {
      key: 'Hold Space / Tap Cast',
      action: 'Charge cast power and release to throw line',
    },
    {
      key: 'Tap Strike Button',
      action: 'Hook the biting fish within the reaction window',
    },
    {
      key: 'Hold Space / Tap Reel',
      action: 'Reel in fish while balancing line tension',
    },
    {
      key: 'Location Tabs',
      action: 'Switch between Lake, River, Ocean, Swamp, and Night waters',
    },
  ],
  tips: [
    'Higher cast power gives you access to the heaviest trophy fish in each location.',
    'Do not hold the reel button continuously—pulse it gently to maintain optimal sweet spot tension.',
    'When Golden Hour triggers, cast immediately to maximize your chances of catching a Legendary fish.',
    'If the line enters the red danger zone, release the reel immediately until the needle drops back to green.',
  ],
  faq: [
    {
      question: 'How many fishing locations are available?',
      answer:
        'There are five distinct fishing environments: Whispering Lake, Rapid Falls River, Deep Blue Horizon, Murky Mangrove Swamp, and Starlight Lagoon.',
    },
    {
      question: 'Can I play solo against AI bots?',
      answer:
        'Yes! Compete against three skilled AI anglers (AnglerBot, ReelMaster, and BaitBoss) who cast, fight fish, and score in real time.',
    },
    {
      question: 'What happens if my line snaps?',
      answer:
        'If line tension stays in the red zone for over a second, the line snaps and the fish escapes, resetting your rod for another cast.',
    },
  ],
};
