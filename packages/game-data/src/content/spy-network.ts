import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameControlKeys } from '../enums/controls.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const spyNetworkGame = defineGameModule({
  id: 'spy-network',
  description:
    "One player is the spy who doesn't know the secret location. Players ask each other questions; the spy bluffs along. Vote for the spy before they guess the location!",
  category: GameCategories.CS,
  players: getPCount(4, 8),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.SD],
  seo: {
    title: 'Spy Network — Espionage Social Deduction Party Game',
    description:
      "One player is the spy who doesn't know the secret location. Ask cunning questions, spot the impostor, and vote them out in this thrilling espionage party game.",
    keywords: [
      'spy network',
      'social deduction game',
      'spy party game',
      'find the spy',
      'espionage game',
      'voice chat party',
      'multiplayer deduction',
      'location guessing game',
    ],
  },
  tagline: "One among you doesn't know the secret location. Find the spy before they find it!",
  overview: [
    'Spy Network is a tense social deduction party game inspired by the classic Spyfall concept. One player is secretly assigned the role of spy and has no idea where the group is located.',
    'Players take turns asking location-themed questions to probe for knowledge gaps. The spy must bluff convincingly while gathering enough clues to guess the location before being exposed.',
    'After Q&A rounds, everyone votes for who they believe is the spy. A correct unanimous vote catches the spy — but if the spy survives and guesses the location correctly, they claim the ultimate victory!',
  ],
  howToPlay: [
    {
      title: '1. Location Assignment',
      description:
        'Everyone receives the secret location — except the spy, who only knows they are a spy.',
    },
    {
      title: '2. Question & Answer Rounds',
      description:
        'Players take turns asking and answering location-themed questions. Questions must be honest but can be vague.',
    },
    {
      title: '3. Spot the Impostor',
      description:
        "Look for inconsistencies! The spy must guess answers without revealing they don't know the location.",
    },
    {
      title: '4. Vote',
      description:
        'After discussion, all players vote simultaneously on who they believe is the spy.',
    },
    {
      title: "5. Reveal & Spy's Last Chance",
      description:
        'The spy is revealed. If not caught by majority vote, or if they guess the location correctly, they win!',
    },
  ],
  rules: [
    {
      title: 'Honest Answers Required',
      description:
        'Non-spy players must answer questions truthfully as they relate to the secret location.',
    },
    {
      title: 'Vague is Fine',
      description:
        'Questions should hint at the location without directly naming it, to avoid immediately revealing it to the spy.',
    },
    {
      title: 'Spy Survives Bonus',
      description: 'If the majority does not vote for the spy, the spy earns 300 survival points.',
    },
    {
      title: 'Location Guess Bonus',
      description:
        'If the spy correctly guesses the secret location during the reveal, they earn +150 bonus points.',
    },
  ],
  controls: [
    {
      key: 'Question & Answer Fields',
      action: 'Submit your Q&A exchange on your turn',
    },
    {
      key: 'Vote Button',
      action: 'Cast your vote for who you think is the spy',
    },
    {
      key: 'Location Guess Dropdown (Spy only)',
      action: 'Guess the secret location at reveal',
    },
    {
      key: GameControlKeys.MIC_VOICE,
      action: 'Discuss, question, and bluff on live voice chat',
    },
  ],
  tips: [
    'If you are the spy, ask very general questions like "Is this place usually busy?" to avoid revealing your ignorance.',
    'Non-spies: ask specific local knowledge questions — a spy has no context to draw on.',
    "If someone hesitates too long before answering, that's a red flag!",
    'The spy should take note of every clue given by other players to guess the location at the end.',
  ],
  faq: [
    {
      question: 'How many players can play Spy Network?',
      answer: 'Spy Network supports 4 to 8 players. Bot agents fill empty spots in smaller rooms.',
    },
    {
      question: 'What if the vote is tied?',
      answer:
        'A tied vote counts as a failure to catch the spy. The spy earns their survival points.',
    },
    {
      question: 'Can the spy skip guessing the location?',
      answer:
        "Yes! The spy can choose not to guess at the reveal if they're unsure. No penalty is applied for not guessing.",
    },
  ],
});

export const spyNetworkContent = spyNetworkGame.content;
export const spyNetworkDefinition = spyNetworkGame.definition;
