import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const alibiGame = defineGameModule({
  id: 'alibi',
  name: 'Alibi',
  description:
    "Everyone receives a slightly different version of an event. One player's alibi has deliberate inconsistencies. Compare details on voice chat and unmask the suspect!",
  category: GameCategories.CS,
  players: getPCount(4, 8),
  releaseDate: '2026-09-20',
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.SD],
  featured: true,
  seo: {
    title: 'Alibi — Story Inconsistency Deduction Party Game',
    description:
      "Everyone receives a slightly different version of an event. One player's alibi has deliberate flaws. Compare details on voice chat and unmask the suspect!",
    keywords: [
      'alibi game',
      'story deduction',
      'inconsistency party game',
      'find the liar',
      'social deduction',
      'voice chat party game',
      'detective party game',
      'multiplayer deduction',
    ],
  },
  tagline: "Compare your stories. Whose alibi doesn't add up?",
  overview: [
    'Alibi is a voice-driven deduction party game where players receive slightly different versions of the same scenario. One player — the suspect — has a version laced with deliberate inconsistencies.',
    'After reading their stories, players discuss the event details on voice chat: "What color was the car?" "What time did it happen?" These innocent-sounding questions expose the cracks in the suspect\'s alibi.',
    "After heated discussion, everyone votes on whose story doesn't quite match. The best detective earns points. But if the suspect deceives everyone, they triumph!",
  ],
  howToPlay: [
    {
      title: '1. Receive Your Story Version',
      description:
        'Each player receives the same base scenario with minor details. One player (the suspect) gets a version with deliberate inconsistencies.',
    },
    {
      title: '2. Read and Memorize',
      description:
        'Carefully read your story version and remember the specific details you were given.',
    },
    {
      title: '3. Discuss on Voice Chat',
      description: 'Talk about the event. Ask probing questions to compare details across players.',
    },
    {
      title: '4. Vote on the Suspect',
      description:
        'When discussion ends, vote simultaneously for the player whose alibi you believe contains inconsistencies.',
    },
    {
      title: '5. Reveal & Score',
      description:
        'The suspect is revealed and their inconsistencies exposed. Points awarded for correct votes!',
    },
  ],
  rules: [
    {
      title: 'Story Privacy',
      description:
        'Never directly read your story aloud or quote it verbatim. Describe details in your own words.',
    },
    {
      title: 'Suspect Must Blend In',
      description:
        'The suspect must convince others their story matches by deflecting from their inconsistencies.',
    },
    {
      title: 'Correct Detection Bonus',
      description: 'Every player who votes for the actual suspect earns +150 points.',
    },
    {
      title: 'Suspect Survival Bonus',
      description:
        'If the suspect avoids majority detection, they earn +300 points for successfully maintaining their cover.',
    },
  ],
  controls: [
    {
      key: 'Story Card',
      action: 'View your private story version and note any special differences',
    },
    {
      key: 'Vote Button',
      action: 'Select the player whose story you believe has inconsistencies',
    },
    {
      key: 'Microphone',
      action: 'Compare stories and probe for inconsistencies on voice chat',
    },
    {
      key: 'Discussion Phase',
      action: 'Host advances phases when ready',
    },
  ],
  tips: [
    'Ask very specific detail questions — dates, colors, locations — to expose inconsistencies quickly.',
    'If you are the suspect, let others lead the conversation and agree with details when possible.',
    'Take note of any player who hesitates or changes their answer when pressed.',
    'A suspect who is too confident can be just as suspicious as a nervous one!',
  ],
  faq: [
    {
      question: 'How many players can play Alibi?',
      answer: 'Alibi supports 4 to 8 players. Bot detectives fill empty lobby seats.',
    },
    {
      question: 'Does the suspect know they are the suspect?',
      answer:
        'Yes! The suspect sees their inconsistencies highlighted so they can try to cover them up.',
    },
    {
      question: 'What if the vote is tied?',
      answer:
        'A tied vote fails to identify the suspect. The suspect earns their survival bonus points.',
    },
  ],
});

export const alibiContent = alibiGame.content;
export const alibiDefinition = alibiGame.definition;
