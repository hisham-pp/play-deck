import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameControlKeys } from '../enums/controls.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const badArchitectGame = defineGameModule({
  id: 'bad-architect',
  description:
    'One player describes a secret blueprint using voice chat alone. Builders lay blocks on an 8x8 canvas, then reveal and vote on hilarious disasters.',
  category: GameCategories.CS,
  players: getPCount(2, 8),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.CO, GameTags.S],
  seo: {
    title: 'Bad Architect — Voice-Only Construction Party Game',
    description:
      'Direct builders with words alone in Bad Architect, a chaotic voice party game. Describe secret blueprints, place blocks on an 8x8 grid, and vote on disasters.',
    keywords: [
      'bad architect',
      'voice party game',
      'construction game',
      'pixel art building game',
      'multiplayer building game',
      'co-op drawing game',
      'browser party game',
    ],
  },
  tagline: 'Describe with voice. Build in the dark. Vote on the chaos.',
  overview: [
    'Bad Architect is a riotous multiplayer construction party game where communication is everything. One player takes on the mantle of Lead Architect, staring at a top-secret pixel-art blueprint that nobody else can see.',
    'Equipped with only their microphone and wits, the Architect must verbally explain the structure row-by-row and coordinate-by-coordinate while the rest of the crew scurries to assemble blocks onto an 8×8 grid.',
    'When the timer dings, all creations are revealed side-by-side with the original blueprint. Players vote for the Closest Match and the most hilarious Funniest Disaster before rotating roles for the next round.',
  ],
  howToPlay: [
    {
      title: '1. The Lead Architect Briefing',
      description:
        'Each round, one player is chosen as Lead Architect. They receive a secret 8×8 blueprint showing colored block coordinates and helpful architectural anchors.',
    },
    {
      title: '2. Voice-Only Guidance',
      description:
        'The Architect uses voice chat to describe where blocks belong. They can name coordinates, specify colors, and outline silhouettes—no typing or drawing allowed.',
    },
    {
      title: '3. Rapid Construction',
      description:
        'Builders listen intently, picking colors from the palette and clicking or dragging across their grid before the build timer runs out.',
    },
    {
      title: '4. The Grand Unveiling & Voting',
      description:
        'The true blueprint is revealed next to everyone’s build. Players cast votes for Closest Match (+300 pts) and Funniest Disaster (+200 pts).',
    },
  ],
  rules: [
    {
      title: 'Microphone Exclusivity',
      description:
        'The Lead Architect must relay instructions exclusively through audio or voice chat. No screen sharing or typing in chat is permitted.',
    },
    {
      title: 'Standard 8×8 Canvas',
      description:
        'All builds exist on a standardized 8-row by 8-column canvas. Each cell can hold one color block or remain empty.',
    },
    {
      title: 'Strict Timer Deadlines',
      description:
        'Builders must lock in their structures before the countdown reaches zero. Incomplete blueprints are submitted automatically.',
    },
    {
      title: 'Circular Architect Rotation',
      description:
        'The role of Lead Architect rotates evenly across all participants each round so everyone gets a turn giving orders and laying blocks.',
    },
  ],
  controls: [
    {
      key: 'Left Click / Drag',
      action: 'Place selected color block onto an 8×8 grid cell',
    },
    {
      key: 'Color Palette',
      action: 'Switch active block pigment (Red, Blue, Green, Amber, etc.)',
    },
    {
      key: 'Eraser Button',
      action: 'Toggle eraser mode to wipe individual misplaced blocks',
    },
    {
      key: 'Clear Button',
      action: 'Reset your entire canvas back to clean slate',
    },
    {
      key: 'Submit Blueprint',
      action: 'Lock in your completed structure before timer expires',
    },
    {
      key: GameControlKeys.MIC_VOICE,
      action: 'Speak to convey coordinates when acting as Lead Architect',
    },
  ],
  tips: [
    'Establish anchor points early: tell builders your total height, base width, and bottom row start column first.',
    'Use standard chess coordinate notation (e.g., Row 4, Columns C through F) to prevent directional confusion.',
    'Keep your color calls concise: say "Row 7, columns D and E: red block" rather than lengthy descriptions.',
    'Builders should outline the external contour before filling in interior accent colors.',
  ],
  faq: [
    {
      question: 'How many players can participate in Bad Architect?',
      answer:
        'Bad Architect supports 2 to 8 players. In solo or smaller groups, intelligent AI bot builders can join to populate the room and vote.',
    },
    {
      question: 'Is a physical microphone required to play?',
      answer:
        'Voice chat makes the game significantly more fun, but players can also use any voice communication software (or in-room live chat) to relay instructions.',
    },
    {
      question: 'How is the Closest Match calculated?',
      answer:
        'Our engine calculates an exact algorithmic similarity percentage by comparing overlapping colored blocks against the true blueprint, combined with player votes.',
    },
  ],
});

export const badArchitectContent = badArchitectGame.content;
export const badArchitectDefinition = badArchitectGame.definition;
