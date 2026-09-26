import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const wrongAnswersOnlyGame = defineGameModule({
  id: 'wrong-answers-only',
  description:
    'A question appears. Players deliberately submit believable-but-wrong answers. Everyone votes for the funniest or most creative fake answer.',
  category: GameCategories.CS,
  players: getPCount(3, 8),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.S],
  seo: {
    title: 'Wrong Answers Only — Creative Fake Answers Party Game',
    description:
      'A hilarious party show where players submit ridiculous fake answers to bizarre prompts, read them aloud, and vote for the funniest lies in real time.',
    keywords: [
      'wrong answers only',
      'party game',
      'fake answers trivia',
      'funny party show',
      'voice chat party game',
      'multiplayer comedy game',
      'hilarious bluffing',
    ],
  },
  tagline: 'Leave the facts at home. Only the funniest and most creative lies take the crown!',
  overview: [
    'Wrong Answers Only is the ultimate comedy game-show party experience where accuracy is strictly penalized and creative deception reigns supreme. In each round, a real question appears—from curious science to bizarre hypothetical dilemmas.',
    'Instead of typing the correct answer, every player must submit a believable, absurd, or hilarious fake answer before the countdown clock ticks down.',
    'Once submissions are in, the floor opens to a dramatic read-aloud showcase over voice chat or automated audio narration. Players then vote on secret ballots for their favorite punchlines, earning points and crowd favorite streaks.',
  ],
  howToPlay: [
    {
      title: '1. The Prompt Appears',
      description:
        'A trivia fact, hypothetical conundrum, or absurd question is displayed on everyone’s screen simultaneously.',
    },
    {
      title: '2. Craft Your Falsehood',
      description:
        'Type your most entertaining, punny, or plausible fake answer before the countdown timer expires.',
    },
    {
      title: '3. Dramatic Read-Aloud',
      description:
        'All fake answers are unveiled anonymously. Take turns reading them aloud over voice chat or use built-in narration.',
    },
    {
      title: '4. Vote & Crown the Winner',
      description:
        'Vote for the funniest or most creative fake answer (you cannot vote for your own). Earn points for votes and bonus multipliers.',
    },
  ],
  rules: [
    {
      title: 'Wrong Answers Only',
      description:
        'Correct answers are forbidden and boring! The goal is pure entertainment, wit, and creative absurdity.',
    },
    {
      title: 'Self-Voting Prohibition',
      description:
        'Players cannot vote for their own submitted answer. Your ballot must go to a worthy opponent.',
    },
    {
      title: 'Scoring Breakdown',
      description:
        'Each vote received earns 1 point. The most-voted answer receives a +3 point Crowd Favorite bonus. Winning consecutive rounds earns a +2 point Streak bonus.',
    },
    {
      title: 'Time Limits',
      description:
        'Players have 45 seconds to submit their lies and 30 seconds to lock in their votes before the stage auto-progresses.',
    },
  ],
  controls: [
    {
      key: 'Keyboard Text Input',
      action: 'Type your fake answer into the input field',
    },
    {
      key: 'Enter / Submit Button',
      action: 'Lock in your answer before the timer expires',
    },
    {
      key: 'Click Answer Card',
      action: 'Select your vote during the voting phase',
    },
    {
      key: 'Microphone (M)',
      action: 'Talk and react on voice chat during discussion',
    },
    {
      key: 'Read Aloud Button',
      action: 'Listen to automated text-to-speech recitation',
    },
  ],
  tips: [
    'Believable lies that sound like genuine trivia often surprise other players and harvest massive votes.',
    'Short, snappy punchlines and absurd wordplay stand out especially well during dramatic read-alouds.',
    'Pay attention to what makes your group laugh—tailoring humor to your audience wins consistent crowd favorites.',
    'Keep your poker face on voice chat while everyone is reading the answers so nobody suspects which one is yours.',
  ],
  faq: [
    {
      question: 'How many players can participate?',
      answer:
        'Wrong Answers Only is designed for 3 to 8 players. If your group is small or you are playing solo, comedic AI bots automatically join the lobby.',
    },
    {
      question: 'How does the scoring system work?',
      answer:
        'You receive 1 point per vote your fake answer earns, +3 bonus points if your answer earns the most votes, and an extra +2 streak bonus for back-to-back victories.',
    },
    {
      question: 'Do I need a microphone to play?',
      answer:
        'While integrated WebRTC voice chat makes reading answers and laughing together unforgettable, you can also use text chat and built-in speech narration.',
    },
  ],
});

export const wrongAnswersOnlyContent = wrongAnswersOnlyGame.content;
export const wrongAnswersOnlyDefinition = wrongAnswersOnlyGame.definition;
