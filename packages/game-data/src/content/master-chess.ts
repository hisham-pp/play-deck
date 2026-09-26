import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const chessGame = defineGameModule({
  id: 'chess',
  name: 'Master Chess',
  description:
    'Full tournament rules on a 3D board: castling, en passant, promotion, check, stalemate and every draw. Pass and play, or challenge a friend online with voice and chat.',
  category: GameCategories.B,
  players: getPCount(2),
  releaseDate: '2026-09-13',
  tags: [
    GameTags.GRANDMASTER,
    GameTags.B,
    GameTags.TD,
    GameTags.LP,
    GameTags.ONLINE_1V1,
    GameTags.V_C,
  ],
  seo: {
    title: 'Play Master Chess Online — 3D Board, Full Rules',
    description:
      'Play chess free on a 3D board with full tournament rules: castling, en passant, promotion, check, stalemate and draws. Pass and play or online 1v1 with voice chat.',
    keywords: [
      'play chess online',
      '3d chess game',
      'free chess no download',
      'chess 2 player online',
      'chess with voice chat',
      'chess pass and play',
    ],
  },
  tagline: 'Full tournament rules on a 3D board — pass and play, or challenge a friend online.',
  overview: [
    'Master Chess implements the complete FIDE move set rather than a simplified subset. Castling on both sides, en passant capture, pawn promotion to any piece, check and checkmate detection, stalemate, the fifty-move rule, threefold repetition and insufficient material are all handled by the engine, so a position resolves the way it would over the board.',
    'Play it two ways. Pass and play shares one device, rotating the 3D board between turns. Online 1v1 pairs you with a friend over a room code, with voice chat and text chat riding the same realtime channel as the game itself, so you can talk through the endgame while you play it.',
  ],
  howToPlay: [
    {
      title: 'Choose a mode',
      description:
        'Start a local pass-and-play game on one device, or create a room code and send it to a friend for an online match.',
    },
    {
      title: 'Select a piece',
      description:
        'Click or tap one of your pieces. Every legal destination is highlighted on the board, including captures.',
    },
    {
      title: 'Make the move',
      description:
        'Click a highlighted square to move. Illegal moves — including any move that would leave your own king in check — are rejected.',
    },
    {
      title: 'Handle special moves',
      description:
        'Castle by moving the king two squares toward the rook. Promote by choosing a piece when a pawn reaches the far rank.',
    },
    {
      title: 'Deliver checkmate',
      description:
        'Win by attacking the enemy king so that no legal move escapes the attack. The engine calls the result automatically.',
    },
  ],
  rules: [
    {
      title: 'Standard piece movement',
      description:
        'Every piece moves under full FIDE rules, including the pawn double-step from its starting rank.',
    },
    {
      title: 'Castling',
      description:
        'Legal when neither king nor rook has moved, the squares between are empty, and the king is not moving into, out of, or through check.',
    },
    {
      title: 'En passant',
      description:
        'A pawn that advances two squares past an enemy pawn may be captured as if it had advanced one — but only on the immediately following move.',
    },
    {
      title: 'Promotion',
      description:
        'A pawn reaching the eighth rank promotes to a queen, rook, bishop or knight of your choosing.',
    },
    {
      title: 'Draws',
      description:
        'Stalemate, the fifty-move rule, threefold repetition and insufficient material are all detected and end the game as a draw.',
    },
  ],
  controls: [
    {
      key: 'Click / tap piece',
      action: 'Select and show legal moves',
    },
    {
      key: 'Click / tap square',
      action: 'Move to a highlighted square',
    },
    {
      key: 'Drag',
      action: 'Orbit the 3D board',
    },
    {
      key: 'Arrow keys',
      action: 'Navigate squares (accessible grid)',
    },
    {
      key: 'Enter / Space',
      action: 'Select or confirm square',
    },
  ],
  tips: [
    'Control the centre early. Pawns on e4 and d4 give your pieces more squares than anything you can achieve on the flanks.',
    'Develop knights and bishops before moving the same piece twice — a lead in development is worth more than an early pawn.',
    'Castle inside the first ten moves in most openings. A king in the centre is the most common cause of a lost middlegame.',
    'Before every move, check what your opponent’s last move attacks. Most blunders are missed threats, not missed tactics.',
    'In the endgame, activate the king. It is a strong piece once the queens come off and passive kings lose drawn positions.',
  ],
  faq: [
    {
      question: 'Does this chess game support castling and en passant?',
      answer:
        'Yes. The engine implements the complete rule set including castling both sides, en passant, promotion, and all draw conditions.',
    },
    {
      question: 'Can I play chess online against a friend?',
      answer:
        'Yes. Create a room, share the code, and play 1v1 online with voice chat and text chat built in.',
    },
    {
      question: 'Can two people play on the same device?',
      answer: 'Yes. Pass-and-play mode shares one screen and rotates the board between turns.',
    },
    {
      question: 'Is the board 2D or 3D?',
      answer:
        'The board renders in 3D and you can orbit the camera, while a keyboard-accessible grid is available for screen reader and keyboard play.',
    },
  ],
});

export const chessContent = chessGame.content;
export const chessDefinition = chessGame.definition;
