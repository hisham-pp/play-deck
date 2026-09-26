import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const physicsFootballGame = defineGameModule({
  id: 'physics-football',
  description:
    'Fast-paced 2D arcade soccer showdown. Control momentum, execute impulse strikes, bend shots off goalposts, and dominate the pitch in Physics Football on PlayDeck.',
  category: GameCategories.A,
  players: getPCount(1, 4),
  releaseDate: '2026-09-25',
  tags: [GameTags.A, GameTags.PH, GameTags.S, GameTags.LP, GameTags.AI],
  seo: {
    title: 'Physics Football — 2D Arcade Soccer | PlayDeck',
    description:
      'Fast-paced 2D arcade soccer showdown. Control momentum, execute impulse strikes, bend shots off goalposts, and dominate the pitch in Physics Football on PlayDeck.',
    keywords: [
      'physics football',
      '2d soccer game',
      'arcade football',
      'browser soccer',
      'haxball style game',
      'physics soccer online',
      'local multiplayer football',
      'tabletop soccer browser',
    ],
  },
  tagline: 'Master ball momentum, bend bank shots, and strike your way to glory.',
  overview: [
    'Physics Football is a high-octane 2D arcade soccer experience featuring authentic impulse physics, elastic collisions, and dynamic goalpost rebounds.',
    'Dribble, bump opponents off the ball, and unleash crushing power strikes into the back of the net across responsive turf arenas.',
    'Compete solo against the reactive StrikerBot AI or challenge friends in local two-player duel mode on desktop and mobile devices.',
  ],
  howToPlay: [
    {
      title: 'Steer your player',
      description:
        'Glide across the pitch using smooth directional controls with realistic acceleration and turf friction.',
    },
    {
      title: 'Dribble and position',
      description:
        'Body check the ball to nudge it forward and shield it from charging opponent strikers.',
    },
    {
      title: 'Trigger power kicks',
      description:
        'Press the kick button when in ball proximity to launch directional impulse strikes toward the opposing net.',
    },
    {
      title: 'Score goals to win',
      description:
        'Bypass the goalkeeper, bank shots off goalposts, and reach the target score before the match clock expires.',
    },
  ],
  rules: [
    {
      title: 'Goalmouth boundaries',
      description:
        'Side walls repel the ball, while open goalmouth netting registers goals whenever the ball fully crosses the goal line.',
    },
    {
      title: 'Goalpost deflection physics',
      description:
        'Cylindrical goalposts feature circular restitution, creating unpredictable bounces and dramatic crossbar shots.',
    },
    {
      title: 'Kick cooldown mechanics',
      description:
        'Players have a brief 350ms cooldown between consecutive power kicks to encourage tactical timing over spamming.',
    },
    {
      title: 'Kickoff reset sequence',
      description:
        'After every goal, both teams reset to standard kickoff formations with a short countdown before action resumes.',
    },
  ],
  controls: [
    {
      key: 'WASD / Arrow Keys',
      action: 'Steer Player 1 (Blue) across the pitch',
    },
    {
      key: 'Spacebar',
      action: 'Execute power strike for Player 1',
    },
    {
      key: 'Arrow Keys + Enter',
      action: 'Steer & strike for Player 2 (Local 2-Player mode)',
    },
    {
      key: 'On-Screen D-Pad & Kick Button',
      action: 'Full touch movement and shooting on mobile devices',
    },
  ],
  tips: [
    'Angle your player slightly behind the ball when striking to lift it into top corners.',
    'Use the side walls above the goal to bank bounce passes behind rushing defenders.',
    'Body checking an opponent right before they kick disrupts their shot angle.',
    'Goalposts are rigid—rebound shots off posts can catch goalkeepers out of position.',
  ],
  faq: [
    {
      question: 'How long does a standard match last?',
      answer:
        'Matches run for 90 seconds or conclude immediately once a player reaches the 3-goal target threshold.',
    },
    {
      question: 'Can I play with a controller or touch screen?',
      answer:
        'Yes, full touch controls are available on mobile, and desktop keyboard mapping supports two players simultaneously.',
    },
    {
      question: 'What happens if a match ends in a draw?',
      answer:
        'If the timer reaches zero while scores are level, the match concludes as an honorable draw.',
    },
  ],
});

export const physicsFootballContent = physicsFootballGame.content;
export const physicsFootballDefinition = physicsFootballGame.definition;
