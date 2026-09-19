import type { GameContent } from '@playdeck/game-types';

export const anagramSprintContent: GameContent = {
  id: 'anagram-sprint',
  seo: {
    title: 'Play Anagram Sprint Online Free — Word Unscramble Race',
    description:
      'Race to unscramble the word before anyone else. Free multiplayer anagram game with speed scoring, streak bonuses and voice chat for up to 8 players.',
    keywords: [
      'anagram game',
      'word unscramble game',
      'word scramble online',
      'multiplayer word game',
      'jumble word game',
      'free anagram solver game',
    ],
  },
  tagline: 'Same letters, same second, one keyboard between you and the answer.',
  overview: [
    'Anagram Sprint deals everyone the same jumbled word at the same moment. Seven letters land on the tray, the clock starts, and whoever types the real word first takes the biggest share of the round. Answer second and you still score — just less of it.',
    'Play it alone against the clock or open a room for up to eight racers with voice chat running while you think out loud. Words climb from everyday six-letter warm-ups to the kind of twelve-letter tangle that eats a whole round, and a shuffle button rearranges the tiles whenever your eyes stop seeing it.',
  ],
  howToPlay: [
    {
      title: 'Pick a mode',
      description:
        'Solo is ten words against the clock. Classic, Survival, Blitz and Team all run in an online room — Survival costs a life for every word you miss.',
    },
    {
      title: 'Read the tray',
      description:
        'The amber tiles are every letter of the answer, in the wrong order. Use all of them, no more and no fewer.',
    },
    {
      title: 'Type and hit enter',
      description:
        'A guess made from the right letters that is not a word costs you one of your four tries. A typo built from the wrong letters costs you nothing but time.',
    },
    {
      title: 'Shuffle when you stall',
      description:
        'The shuffle button rearranges the tiles on your screen only. Nobody else sees it move, and the clock keeps running.',
    },
    {
      title: 'Bank the streak',
      description:
        'Every word you take in a row adds to a streak bonus that keeps growing to five. Miss one and it goes back to zero.',
    },
  ],
  rules: [
    {
      title: 'Everyone gets the same word',
      description:
        'The whole card is dealt from a single shared number, so all eight screens show the same letters in the same order from the first round to the last.',
    },
    {
      title: 'Placement is decided by the clock',
      description:
        'You are ranked by how long you took, not by whose answer reached the room first. A slow connection never costs you a place.',
    },
    {
      title: 'Any real word made of those letters counts',
      description:
        'The word that was dealt always clears the round, and so does any other word in the bank built from exactly the same letters.',
    },
    {
      title: 'Four guesses per word',
      description:
        'Wrong rearrangements are capped rather than punished. Spend all four and you sit the round out; the clock still runs for everyone else.',
    },
    {
      title: 'Speed, difficulty and streak all pay',
      description:
        'A hard word is worth 100 to the first player home, dropping to 80%, 65% and 50% for the seats behind them, plus up to 50 for the clock you left unspent and 10 per streak step.',
    },
  ],
  controls: [
    { key: 'A–Z', action: 'Type your answer' },
    { key: 'Enter', action: 'Submit the word' },
    { key: 'Backspace', action: 'Correct your entry' },
    { key: 'Tab', action: 'Reach the shuffle and hint buttons' },
    { key: 'Click / tap', action: 'Shuffle the tiles or reveal the hint' },
  ],
  tips: [
    'Look for the endings first. Spotting -ing, -ion or -ed at a glance leaves you three or four letters to arrange instead of eight.',
    'Shuffle early rather than late. Once your eyes have locked onto a wrong arrangement they rarely unlock without the tiles moving.',
    'The speed bonus is worth half a hard word. Typing a decent answer fast beats agonising over the perfect one.',
    'In Survival, take the hint. A lost life costs far more than the seconds the clue eats.',
    'In Team mode only the pooled score matters, so call out the letters you have ruled out — that is what the voice chat is for.',
  ],
  faq: [
    {
      question: 'How many people can play?',
      answer:
        'One on your own, or two to eight in an online room. Share the room code or the invite link and everyone lands on the same letters.',
    },
    {
      question: 'Does shuffling the tiles help my opponents?',
      answer:
        'No. The shuffle only rearranges your own tray — it is a thinking aid, not a move, so it never leaves your screen.',
    },
    {
      question: 'What happens if my answer is a different word with the same letters?',
      answer:
        'It counts. Any word in the bank made from exactly those letters clears the round, so you never lose a race on a technicality.',
    },
    {
      question: 'What are the modes?',
      answer:
        'Solo runs ten words alone. Classic races a fixed card, Survival takes a life for every miss, Blitz runs fifteen words on a short fuse, and Team pools two sides into one score.',
    },
    {
      question: 'Is there voice chat?',
      answer:
        'Yes. Online rooms carry PlayDeck voice chat for every seat, so you can talk through the letters while the clock runs.',
    },
  ],
};
