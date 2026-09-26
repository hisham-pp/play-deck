import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const penFightGame = defineGameModule({
  id: 'pen-fight',
  description:
    'The classic desktop duel, remade in 3D. Flick your pen to knock your rival off the arena table before they knock you off first.',
  category: GameCategories.A,
  players: getPCount(1, 2),
  releaseDate: GameReleaseDates.D_2026_09_12,
  tags: [GameTags.TD, GameTags.PH, GameTags.LP, GameTags.AI, GameTags.NOSTALGIA],
  seo: {
    title: 'Play Pen Fight Online — 3D Desk Duel Game',
    description:
      'Play Pen Fight free in your browser. Flick your pen across a 3D desk and knock your rival off the table before they knock you off. Local 2-player or vs AI.',
    keywords: [
      'pen fight game',
      'pen fight online',
      '3d pen fight',
      'desk game online',
      'pen fight 2 player',
      'school pen game',
    ],
  },
  tagline:
    'The classic desk duel, remade in 3D physics — flick, collide, and knock them off the edge.',
  overview: [
    'Pen Fight is the game every school desk hosted: two pens, one table, and whoever gets knocked off first loses. PlayDeck rebuilds it with a real 3D physics simulation, so mass, spin, friction and the angle of a collision all matter exactly the way they did on a wooden bench.',
    'Flick your pen with a drag — direction and distance set the aim and the power. A glancing hit spins your rival toward the edge; a full-power strike can send them straight off, but overcommit and your own pen carries past the rim. Play a friend locally or take on the AI.',
  ],
  howToPlay: [
    {
      title: 'Line up the flick',
      description:
        'Press and drag from your pen. The direction of the drag sets your aim and its length sets the power.',
    },
    {
      title: 'Release to strike',
      description:
        'Let go and the pen launches. Physics takes over from there — there is no steering once it is moving.',
    },
    {
      title: 'Knock them off',
      description:
        'Drive your opponent’s pen over the edge of the table. Any pen that leaves the surface is out.',
    },
    {
      title: 'Mind your own momentum',
      description:
        'Your pen keeps its momentum after a hit. A shot with too much power can carry you off the table too.',
    },
  ],
  rules: [
    {
      title: 'Off the table is out',
      description:
        'A pen that leaves the playing surface for any reason is eliminated, including your own on an over-hit.',
    },
    {
      title: 'One flick per turn',
      description:
        'Players alternate flicks. You cannot influence the pen once it has been released.',
    },
    {
      title: 'Physics decides everything',
      description:
        'Collisions resolve through the simulation — mass, spin and contact angle all affect the outcome.',
    },
    {
      title: 'Last pen standing wins',
      description: 'The round goes to whoever still has a pen on the table.',
    },
  ],
  controls: [
    {
      key: 'Drag from pen',
      action: 'Aim and set power',
    },
    {
      key: 'Release',
      action: 'Flick the pen',
    },
    {
      key: 'Drag empty space',
      action: 'Orbit the camera',
    },
  ],
  tips: [
    'Aim for the end of their pen, not the middle. An off-centre hit imparts spin and slides them sideways toward an edge.',
    'Use partial power when your rival is already near the rim — a light nudge finishes the job without risking your own position.',
    'Retreat is a legitimate move. Flicking yourself toward the centre of the table denies them an easy angle next turn.',
    'Watch the corners. A pen parked near a corner has two edges to fall off and very little room to recover.',
  ],
  faq: [
    {
      question: 'What is Pen Fight?',
      answer:
        'It is the classic schoolyard desk game: two pens on a table, and you flick yours to knock your opponent off the edge.',
    },
    {
      question: 'Can I play Pen Fight with a friend?',
      answer: 'Yes. Local 2-player on one device is supported, as well as playing against the AI.',
    },
    {
      question: 'Is the physics real?',
      answer:
        'Yes. Collisions run through a 3D physics simulation, so spin, mass and contact angle genuinely affect where each pen ends up.',
    },
    {
      question: 'Does it work on a phone?',
      answer: 'Yes. Drag with your finger to aim and release to flick.',
    },
  ],
});

export const penFightContent = penFightGame.content;
export const penFightDefinition = penFightGame.definition;
