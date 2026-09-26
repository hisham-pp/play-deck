import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const imposterBuilderGame = defineGameModule({
  id: 'imposter-builder',
  description:
    'Everyone builds the same thing on an 8x8 canvas — but one player got subtly different instructions. Reveal all builds, discuss on voice, and vote for the Imposter.',
  category: GameCategories.CS,
  players: getPCount(4, 8),
  releaseDate: '2026-09-20',
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.SD],
  seo: {
    title: 'Imposter Builder — Social Deduction Grid Building Party Game',
    description:
      'Everyone builds the same object — except one player received subtly different instructions. Spot the odd build and unmask the imposter in this deduction party game.',
    keywords: [
      'imposter builder',
      'building party game',
      'social deduction',
      'grid building game',
      'find the imposter',
      'voice chat party game',
      'multiplayer party game',
      'creative building game',
    ],
  },
  tagline: 'Build the same thing — but one of you got different instructions! Find the Imposter!',
  overview: [
    'Imposter Builder is a creative social deduction party game where everyone receives the same building instructions. Everyone builds their interpretation on an 8×8 pixel canvas — but one player, the Imposter, quietly received subtly different instructions.',
    "After a timed build phase, all canvases are revealed simultaneously. Players discuss what they see, looking for the build that doesn't quite match the brief.",
    'The player who successfully identifies the Imposter Builder wins points. If the Imposter avoids detection, they score big! Voice chat makes the deception and detective work even more entertaining.',
  ],
  howToPlay: [
    {
      title: '1. Receive Building Instructions',
      description:
        'All players receive the same building prompt — except the Imposter, who gets a slightly different version.',
    },
    {
      title: '2. Build on the Canvas',
      description:
        'Use the 8×8 grid to build your interpretation. Choose colors and place blocks within the time limit.',
    },
    {
      title: '3. Simultaneous Reveal',
      description: "When time's up, all builds are revealed at once. Compare designs side by side.",
    },
    {
      title: '4. Discuss on Voice Chat',
      description:
        'Talk through what you notice. The Imposter must bluff about their instructions convincingly!',
    },
    {
      title: '5. Vote for the Imposter',
      description: 'Cast your vote for who you believe built based on different instructions.',
    },
  ],
  rules: [
    {
      title: 'Build Phase is Private',
      description: "Players cannot see each other's canvases during the build phase.",
    },
    {
      title: 'Imposter Must Bluff',
      description:
        'During discussion, the Imposter must describe their build as if they followed the normal instructions.',
    },
    {
      title: 'Majority Vote Wins',
      description: 'The player with the most votes at the end is declared the Imposter Builder.',
    },
    {
      title: 'Survival Bonus',
      description: 'If the Imposter avoids majority vote detection, they earn +250 bonus points.',
    },
  ],
  controls: [
    {
      key: 'Color Palette',
      action: 'Select the color for your next block placement',
    },
    {
      key: 'Grid Cells',
      action: 'Tap/click cells to toggle block fill on the 8×8 canvas',
    },
    {
      key: 'Reveal Button (Host)',
      action: 'Trigger simultaneous reveal when build time ends',
    },
    {
      key: 'Vote Button',
      action: 'Select the player you believe is the Imposter',
    },
    {
      key: 'Microphone',
      action: 'Discuss, bluff, and deduce via voice chat',
    },
  ],
  tips: [
    'Study all builds carefully during the reveal — look for missing elements or color differences.',
    'If you are the Imposter, describe your build confidently using the normal instructions vocabulary.',
    'Ask probing questions like "Why did you add that extra piece?" to catch the Imposter off guard.',
    'Build quickly! A half-finished canvas draws suspicion regardless of your instructions.',
  ],
  faq: [
    {
      question: 'How many players can play Imposter Builder?',
      answer: 'Imposter Builder supports 4 to 8 players. Bots fill empty slots.',
    },
    {
      question: 'What if there is a tied vote?',
      answer: 'A tied vote means the Imposter escapes. They earn their survival point bonus.',
    },
    {
      question: 'Can I see the normal instructions?',
      answer: 'No! You only see your own instructions during the build phase.',
    },
  ],
});

export const imposterBuilderContent = imposterBuilderGame.content;
export const imposterBuilderDefinition = imposterBuilderGame.definition;
