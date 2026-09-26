import { defineGameModule } from '../core/base-game';
import { GameCategories, GameControlKeys, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const whoAmIGame = defineGameModule({
  id: 'who-am-i',
  name: 'Who Am I?',
  description:
    'Everyone gets a hidden identity assigned to them — visible to all OTHER players but NOT to themselves. Ask yes/no questions to discover your own identity.',
  category: GameCategories.CS,
  players: getPCount(3, 8),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.SD, GameTags.S],
  seo: {
    title: 'Who Am I? — Headband Mystery Identity Party Game',
    description:
      'Everyone sees your secret identity except you! Ask clever yes-or-no questions, eliminate clues, and deduce who you are in this classic party game.',
    keywords: [
      'who am i',
      'headband party game',
      'guess who am i',
      'twenty questions',
      'party deduction game',
      'social deduction',
      'voice chat party game',
      'multiplayer guessing game',
    ],
  },
  tagline: 'Everyone knows who you are except you! Ask smart questions and solve the mystery.',
  overview: [
    'Who Am I? brings the beloved parlor headband game to your browser with real-time multiplayer and integrated voice chat. Each player is dealt a secret identity pinned to their virtual headband—visible to everyone in the room except themselves.',
    'On your turn, ask the group strategic Yes/No questions to narrow down categories, professions, fictional universes, or bizarre traits. Other players vote with quick chips or answer over live audio.',
    'When intuition strikes, make your final accusation or pass to live another round. Solve your identity in the fewest questions possible to claim the coveted Master Detective crown!',
  ],
  howToPlay: [
    {
      title: '1. Secret Headbands Dealt',
      description:
        'Every player receives a mystery character, animal, or object displayed on their headband for others to see.',
    },
    {
      title: '2. Ask Yes/No Questions',
      description:
        'When your turn arrives, ask a strategic question to narrow down who or what you might be.',
    },
    {
      title: '3. Group Votes on Answers',
      description:
        'All other players respond with YES, NO, or MAYBE via instant chips or on voice chat.',
    },
    {
      title: '4. Guess Your Identity',
      description:
        'Take a bold final guess! If correct, you solve your identity and lock in big points.',
    },
    {
      title: '5. Pass or Keep Deducting',
      description:
        'Not sure yet? Pass your turn to gather more clues on the next round without penalty.',
    },
  ],
  rules: [
    {
      title: 'Strict Headband Secrecy',
      description:
        'Your own identity is strictly hidden behind a mystery card until you solve it or the game concludes.',
    },
    {
      title: 'Truthful Answers Only',
      description:
        'Players must answer questions truthfully according to the attributes of the target player’s identity.',
    },
    {
      title: 'Guessing Risk & Reward',
      description:
        'A correct guess awards up to 500 points with bonuses for speed. An incorrect guess deducts 30 points.',
    },
    {
      title: 'Master Detective Award',
      description:
        'The player who solves their mystery identity with the fewest questions receives a +150 point bonus.',
    },
  ],
  controls: [
    {
      key: 'Question Input & Suggestions',
      action: 'Type custom questions or click quick prompt suggestions',
    },
    {
      key: 'YES / NO / MAYBE Buttons',
      action: 'Cast quick answers when opponents ask questions',
    },
    {
      key: 'Final Guess Bar',
      action: 'Type your identity guess and submit before time expires',
    },
    {
      key: 'Pass Button',
      action: 'Conclude your turn without risking a wrong guess',
    },
    {
      key: GameControlKeys.MIC_VOICE,
      action: 'Ask questions and laugh with friends over voice chat',
    },
  ],
  tips: [
    'Start broad! Inquire if you are human, alive today, or fictional to eliminate massive portions of the deck immediately.',
    'Pay attention to questions other players ask and how the group reacts for subtle contextual hints.',
    'Keep your detective notebook in mind—refer to the Q&A log to avoid repeating previously answered clues.',
    'Turn your mic on! Banter and subtle inflections during voice answers make the deductions twice as fun.',
  ],
  faq: [
    {
      question: 'How many players can participate?',
      answer:
        'Who Am I? supports 3 to 8 players. In solo or smaller sessions, AI guesser bots can join the table with automated reasoning.',
    },
    {
      question: 'Can I choose specific identity categories?',
      answer:
        'Yes! The host can choose from Animals, Movie Characters, Famous People, Historical Figures, Professions, Everyday Objects, or All Mixed Up.',
    },
    {
      question: 'What happens if I make a wrong guess?',
      answer:
        'An incorrect guess incurs a small -30 point penalty and ends your turn, but you stay in the game to ask more questions next round.',
    },
  ],
});

export const whoAmIContent = whoAmIGame.content;
export const whoAmIDefinition = whoAmIGame.definition;
