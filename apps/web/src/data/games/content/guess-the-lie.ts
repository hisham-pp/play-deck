import type { GameContent } from '@playdeck/game-types';

export const guessTheLieContent: GameContent = {
  id: 'guess-the-lie',
  seo: {
    title: 'Guess the Lie — Social Deduction Q&A Party Game',
    description:
      'Spot the bluff or fool your friends in Guess the Lie. One player crafts a believable lie while others tell the truth. Debate over voice chat and vote on the lie.',
    keywords: [
      'guess the lie',
      'social deduction party game',
      'bluffing game',
      'q and a party game',
      'voice chat deduction',
      'multiplayer deception game',
      'trivia bluff game',
    ],
  },
  tagline: 'Everyone tells the truth except one secret liar. Can you spot the deception?',
  overview: [
    'Guess the Lie is an exhilarating social deduction party game where communication and sharp intuition collide. In each round, a curated question appears across factual trivia, bizarre personal confessions, or creative scenarios.',
    'Every participant submits a truthful answer—except for one secretly designated Liar, who must construct a plausible, believable fabrication that blends seamlessly into the crowd.',
    'Once all answers are revealed anonymously, the floor opens to lively debate over integrated WebRTC voice chat. Interrogate suspects, defend your honest quirks, and cast your vote before the dramatic reveal.',
  ],
  howToPlay: [
    {
      title: '1. The Secret Role Assignment',
      description:
        'At the start of each round, one player is secretly assigned as the Liar while everyone else becomes Truth-tellers.',
    },
    {
      title: '2. Answer Submission',
      description:
        'A prompt is revealed. Truth-tellers type genuine answers; the Liar types a clever, believable bluff before the timer expires.',
    },
    {
      title: '3. Voice Interrogation & Debate',
      description:
        'All answers are presented anonymously. Hop onto microphone voice chat to cross-examine suspects and deduce who sounds guilty.',
    },
    {
      title: '4. The Accusation Vote & Unmasking',
      description:
        'Players lock in their votes for the answer they believe is the lie. Points are awarded, the liar is unveiled, and roles rotate.',
    },
  ],
  rules: [
    {
      title: 'Strict Role Secrecy',
      description:
        'The identity of the Liar is kept completely secret until the round conclusion. Never reveal your assigned role early.',
    },
    {
      title: 'Truth-Teller Honesty',
      description:
        'Truth-tellers must answer accurately to the best of their knowledge. Deliberate misdirection is reserved exclusively for the active Liar.',
    },
    {
      title: 'Liar Self-Voting Ban',
      description:
        'The Liar cannot vote for their own submitted answer. They must strategically vote for an innocent player to deflect attention.',
    },
    {
      title: 'Circular Liar Rotation',
      description:
        'The secret Liar role rotates evenly among all participants each round so every player gets multiple chances to bluff and interrogate.',
    },
  ],
  controls: [
    {
      key: 'Keyboard Text Input',
      action: 'Type your answer or bluff into the submission field',
    },
    {
      key: 'Enter Key / Submit Button',
      action: 'Lock in your answer before the timer countdown reaches zero',
    },
    {
      key: 'Click Card to Vote',
      action: 'Select which anonymous card you believe contains the fabrication',
    },
    {
      key: 'Microphone (M)',
      action: 'Speak during the open voice debate stage to interrogate or defend',
    },
    {
      key: 'Read Aloud (TTS)',
      action: 'Trigger automatic text-to-speech dramatic narration of answers',
    },
  ],
  tips: [
    'As the Liar, avoid absurd cartoonish lies—subtle, realistic details fool opponents far more effectively.',
    'As a Truth-teller, don’t hesitate to share genuinely unusual facts; strange truths often cause opponents to vote for you, granting bonus points!',
    'Listen closely to voice tone and hesitation during the debate—bluffing players often stumble when asked for follow-up details.',
    'Check spelling and phrasing consistency: sometimes linguistic style reveals an author’s true identity.',
  ],
  faq: [
    {
      question: 'How many players can play Guess the Lie?',
      answer:
        'Guess the Lie supports 3 to 8 players. In smaller gatherings or solo sessions, intelligent AI bot players automatically join to flesh out the interrogation room.',
    },
    {
      question: 'How does the scoring system work?',
      answer:
        'Truth-tellers gain 100 points for spotting the lie. The Liar gains 50 points per fooled player (+150 majority bonus), and truthful players whose answers were wrongly accused earn a 25-point Suspicious Truth bonus.',
    },
    {
      question: 'Is a microphone required to play?',
      answer:
        'Voice chat makes the cross-examination hilarious and intense, but players can also use live text chat or external calls.',
    },
  ],
};
