import type { GameContent } from '@playdeck/game-types';

export const snakeAndLadderContent: GameContent = {
  id: 'snake-and-ladder',
  seo: {
    title: 'Snake & Ladder — Play Online Free with Friends | PlayDeck',
    description:
      'Play Snake & Ladder free online. Classic 10x10 board, animated climbs and slides, 2-4 players, pass-and-play or online rooms with voice chat. No download needed.',
    keywords: [
      'snake and ladder',
      'snakes and ladders online',
      'play snake and ladder free',
      'snake ladder multiplayer',
      'online board game with friends',
      'dice board game',
      '4 player board game online',
      'snake and ladder with voice chat',
    ],
  },
  tagline: 'Climb the ladders, dodge the snakes, race to 100.',
  overview: [
    'Snake & Ladder is the board game almost everyone learns first: roll a die, walk your token that many squares, and hope you land on a ladder rather than a snake. PlayDeck runs the classic 100-square board with nine ladders and ten snakes, drawn fresh rather than scanned from a box lid.',
    'There is nothing to install and no account to make. Pick two to four players, choose whether the empty seats are friends passing one device or bots, and start rolling. Every climb and slide plays out square by square, so you can see exactly how a roll turned into a fall from 98 back down to 78.',
    'Online rooms take the same board to four players anywhere. The host shares a six-digit code or a link, everyone lands in the same room, and voice chat rides along on the same connection so you can groan at the snakes together.',
  ],
  howToPlay: [
    {
      title: 'Pick your table',
      description:
        'Choose Play Offline for pass-and-play and bots, or Play Online to open a room with a shareable six-digit code.',
    },
    {
      title: 'Seat two to four players',
      description:
        'Each seat gets its own colour and shape, so tokens stay tellable apart without relying on colour alone. Any seat can be a bot.',
    },
    {
      title: 'Roll the die',
      description:
        'Press the Roll button, or just tap Space or R. The die settles and your token walks out the number one square at a time.',
    },
    {
      title: 'Take the ladder, take the snake',
      description:
        'Landing on a ladder foot carries you up to its top. Landing on a snake head drops you to its tail. There is no choice to make — the board decides.',
    },
    {
      title: 'Land exactly on 100',
      description:
        'First token home wins. With the exact-finish rule on, a roll that would overshoot 100 simply forfeits the move.',
    },
  ],
  rules: [
    {
      title: 'The board runs 1 to 100',
      description:
        'Square 1 sits bottom-left and the numbering snakes back and forth up the grid, so 100 ends up top-left.',
    },
    {
      title: 'Ladders climb, snakes slide',
      description:
        'Nine ladders carry tokens up and ten snakes drop them down. No jump ever lands on another jump, so a single roll never moves you twice.',
    },
    {
      title: 'A six rolls again',
      description:
        'Rolling a six keeps the die with you — but three sixes in a row forfeits the turn and the third roll does not move your token.',
    },
    {
      title: 'Exact roll to finish',
      description:
        'On by default: you must land exactly on 100. Turn it off and an overshoot bounces your token back off the final square instead.',
    },
    {
      title: 'Six to leave the start',
      description:
        'Optional. With it on, tokens wait off the board until their player rolls a first six, which makes for a slower, more classic opening.',
    },
    {
      title: 'Placings, not just the win',
      description:
        'A four-player match keeps going after the winner is home so the remaining places are settled, unless you end it at the first finisher.',
    },
  ],
  controls: [
    { key: 'Space or R', action: 'Roll the die' },
    { key: 'Click Roll Dice', action: 'Roll the die' },
    { key: 'Tab / Enter', action: 'Move between and activate on-screen controls' },
  ],
  tips: [
    'There is no skill in the rolling — Snake & Ladder is pure chance, which is exactly why it works as a game to talk over. Treat it as a conversation with a board attached.',
    'The ladder at 80 goes straight to 100, so the eighties are the stretch where a match can end abruptly.',
    'The snake at 98 is the cruellest on the board, dropping a token twenty squares from the finish line. With the exact-finish rule on, sitting on 97 is safer than it looks.',
    'Landing on 1, 4 or 9 early is worth far more than it appears: those three ladders can put you past square 30 on your first turn.',
    'Playing with bots is the quickest way to learn the board — they roll at a human pace, so you can watch where the jumps actually lead.',
    'Turn on reduced motion in preferences if the square-by-square walk feels slow; tokens then snap to their settled square.',
  ],
  faq: [
    {
      question: 'Is Snake & Ladder free to play on PlayDeck?',
      answer:
        'Yes. It runs in your browser with no download, no payment and no account. Open the page and start rolling.',
    },
    {
      question: 'How many people can play?',
      answer:
        'Two to four. Empty seats can be filled by bots, by friends sharing one device, or by players joining your online room.',
    },
    {
      question: 'Can I play Snake & Ladder online with friends?',
      answer:
        'Yes. Open an online room and share the six-digit code or the join link. Up to four players can sit at the same board from anywhere.',
    },
    {
      question: 'Is there voice chat?',
      answer:
        'Yes, in online rooms. Voice runs over the same connection as the game, so joining a room is enough — there is nothing extra to set up.',
    },
    {
      question: 'Do I have to land exactly on 100 to win?',
      answer:
        'By default, yes: a roll that would take you past 100 forfeits the move. You can switch that rule off before the match, and overshoots then bounce back off square 100.',
    },
    {
      question: 'What happens if someone disconnects mid-match?',
      answer:
        'Their seat and square are kept. If they are still away when their turn comes round, the host rolls for them after a short pause so the game keeps moving, and they pick up their token when they return.',
    },
    {
      question: 'Are the bots hard to beat?',
      answer:
        'No, and they could not be. Snake & Ladder has no decisions in it — every player, human or bot, just rolls. The bots exist to fill seats, not to give you a challenge.',
    },
  ],
};
