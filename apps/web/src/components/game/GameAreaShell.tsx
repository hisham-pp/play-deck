'use client';

import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Game2048 } from '@/features/games/2048';
import { AlibiGame } from '@/features/games/alibi';
import { AnagramSprintGame } from '@/features/games/anagram-sprint';
import { AuctionPanicGame } from '@/features/games/auction-panic';
import { BadArchitectGame } from '@/features/games/bad-architect';
import { BallBounceGame } from '@/features/games/ball-bounce';
import { BombFactoryGame } from '@/features/games/bomb-factory';
import { BomberArenaGame } from '@/features/games/bomber-arena';
import { CarromGame } from '@/features/games/carrom';
import { ChessGame } from '@/features/games/chess';
import { ColorThiefGame } from '@/features/games/color-thief';
import { ConnectFourGame } from '@/features/games/connect-four';
import { CrosswordClashGame } from '@/features/games/crossword-clash';
import { DontPopItGame } from '@/features/games/dont-pop-it';
import { GiantGame } from '@/features/games/dont-wake-the-giant';
import { DrawingGuessingGame } from '@/features/games/drawing-guessing';
import { FishingCompetitionGame } from '@/features/games/fishing-competition';
import { FlappyArcadeGame } from '@/features/games/flappy-arcade';
import { FloorIsLavaGame } from '@/features/games/floor-is-lava';
import { GravityGolfGame } from '@/features/games/gravity-golf';
import { GravityShiftGame } from '@/features/games/gravity-shift';
import { GuessTheLieGame } from '@/features/games/guess-the-lie';
import { HideSeekGame } from '@/features/games/hide-and-seek';
import { HumanConveyorGame } from '@/features/games/human-conveyor-belt';
import { ImposterBuilderGame } from '@/features/games/imposter-builder';
import { KingdomDraftGame } from '@/features/games/kingdom-draft';
import { LootDashGame } from '@/features/games/loot-dash';
import { LudoGame } from '@/features/games/ludo';
import { MagnetMayhemGame } from '@/features/games/magnet-mayhem';
import { MinesweeperGame } from '@/features/games/minesweeper';
import { MiniGolfGame } from '@/features/games/mini-golf';
import { OneWordStoryGame } from '@/features/games/one-word-story';
import { PenFightGame } from '@/features/games/pen-fight';
import { PhysicsFootballGame } from '@/features/games/physics-football';
import { PlatformRaceGame } from '@/features/games/platform-race';
import { PongGame } from '@/features/games/pong';
import { PushYourLuckGame } from '@/features/games/push-your-luck';
import { ReactionArenaGame } from '@/features/games/reaction-arena';
import { ReverseRacingGame } from '@/features/games/reverse-racing';
import { RunicMemoryGame } from '@/features/games/runic-memory';
import { SecretMissionGame } from '@/features/games/secret-mission';
import { SecretSaboteurGame } from '@/features/games/secret-saboteur';
import { ShadowTagGame } from '@/features/games/shadow-tag';
import { SharedBrainGame } from '@/features/games/shared-brain';
import { SnakeGame } from '@/features/games/snake';
import { SnakeLadderGame } from '@/features/games/snake-and-ladder';
import { SpellingBeeGame } from '@/features/games/spelling-bee';
import { SpyNetworkGame } from '@/features/games/spy-network';
import { StickmanArcheryGame } from '@/features/games/stickman-archery';
import { StickmanBasketballGame } from '@/features/games/stickman-basketball';
import { StickmanClimberGame } from '@/features/games/stickman-climber';
import { StickmanParkourGame } from '@/features/games/stickman-parkour';
import { StickmanPlatformerGame } from '@/features/games/stickman-platformer';
import { StickmanRunnerGame } from '@/features/games/stickman-runner';
import { SudokuGame } from '@/features/games/sudoku';
import { SummitRushGame } from '@/features/games/summit-rush';
import { TelephoneDrawingGame } from '@/features/games/telephone-drawing';
import { TetrisGame } from '@/features/games/tetris';
import { TicTacToeGame } from '@/features/games/tic-tac-toe';
import { TinyIslandGame } from '@/features/games/tiny-island';
import { TinyTankGame } from '@/features/games/tiny-tank';
import { TowerBuilderGame } from '@/features/games/tower-builder';
import { TrainRushGame } from '@/features/games/train-rush';
import { TrustOrBetrayGame } from '@/features/games/trust-or-betray';
import { UnoCardsGame } from '@/features/games/uno-cards';
import { ElevatorGame } from '@/features/games/unstable-elevator';
import { WhoAmIGame } from '@/features/games/who-am-i';
import { WordBattleGame } from '@/features/games/word-battle';
import { WordChainGame } from '@/features/games/word-chain';
import { WordSearchGame } from '@/features/games/word-search-arena';
import { WrongAnswersGame } from '@/features/games/wrong-answers-only';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { GameStatusBadge, GameCategoryBadge, GameFeatureBadge } from './GameBadge';
import { GameFullscreenStage } from './GameFullscreenStage';
import { GameStage } from './GameStage';

/**
 * Every shipped game renders its own component. The catalog is a lookup rather
 * than a chain of branches so adding a game is one line, not one more `if`.
 */
const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  '2048': Game2048,
  'anagram-sprint': AnagramSprintGame,
  'auction-panic': AuctionPanicGame,
  'bad-architect': BadArchitectGame,
  'ball-bounce': BallBounceGame,
  'bomb-factory': BombFactoryGame,
  'bomber-arena': BomberArenaGame,
  carrom: CarromGame,
  chess: ChessGame,
  'color-thief': ColorThiefGame,
  'connect-four': ConnectFourGame,
  'crossword-clash': CrosswordClashGame,
  'dont-pop-it': DontPopItGame,
  'dont-wake-the-giant': GiantGame,
  'drawing-guessing': DrawingGuessingGame,
  'fishing-competition': FishingCompetitionGame,
  'flappy-arcade': FlappyArcadeGame,
  'floor-is-lava': FloorIsLavaGame,
  'gravity-golf': GravityGolfGame,
  'gravity-shift': GravityShiftGame,
  'guess-the-lie': GuessTheLieGame,
  'hide-and-seek': HideSeekGame,
  'human-conveyor-belt': HumanConveyorGame,
  'kingdom-draft': KingdomDraftGame,
  'loot-dash': LootDashGame,
  ludo: LudoGame,
  'magnet-mayhem': MagnetMayhemGame,
  minesweeper: MinesweeperGame,
  'mini-golf': MiniGolfGame,
  'one-word-story': OneWordStoryGame,
  'pen-fight': PenFightGame,
  'physics-football': PhysicsFootballGame,
  'platform-race': PlatformRaceGame,
  pong: PongGame,
  'push-your-luck': PushYourLuckGame,
  'reaction-arena': ReactionArenaGame,
  'reverse-racing': ReverseRacingGame,
  'runic-memory': RunicMemoryGame,
  'shadow-tag': ShadowTagGame,
  'shared-brain': SharedBrainGame,
  snake: SnakeGame,
  'snake-and-ladder': SnakeLadderGame,
  'stickman-archery': StickmanArcheryGame,
  'stickman-basketball': StickmanBasketballGame,
  'stickman-climber': StickmanClimberGame,
  'stickman-parkour': StickmanParkourGame,
  'stickman-platformer': StickmanPlatformerGame,
  'stickman-runner': StickmanRunnerGame,
  sudoku: SudokuGame,
  'summit-rush': SummitRushGame,
  tetris: TetrisGame,
  'tic-tac-toe': TicTacToeGame,
  'tiny-island': TinyIslandGame,
  'tiny-tank-arena': TinyTankGame,
  'tower-builder': TowerBuilderGame,
  'train-rush': TrainRushGame,
  'trust-or-betray': TrustOrBetrayGame,
  'secret-saboteur': SecretSaboteurGame,
  'unstable-elevator': ElevatorGame,
  'uno-cards': UnoCardsGame,
  'word-battle': WordBattleGame,
  'word-chain': WordChainGame,
  'word-search-arena': WordSearchGame,
  'wrong-answers-only': WrongAnswersGame,
  'telephone-drawing': TelephoneDrawingGame,
  'who-am-i': WhoAmIGame,
  'secret-mission': SecretMissionGame,
  'imposter-builder': ImposterBuilderGame,
  'spy-network': SpyNetworkGame,
  alibi: AlibiGame,
  'spelling-bee': SpellingBeeGame,
};

export function GameAreaShell({ game }: { game: GameDefinition }) {
  const { player, recordGamePlayed } = usePlayerStore();
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const [status, setStatus] = useState<'idle' | 'running' | 'over'>('idle');
  const [mockScore, setMockScore] = useState(0);

  const GameComponent = GAME_COMPONENTS[game.id];
  if (GameComponent) {
    return (
      <GameFullscreenStage game={game}>
        <GameComponent />
      </GameFullscreenStage>
    );
  }

  const handleStart = () => {
    if (!player) return;
    const session = startSession(game, player);
    addRecentSession(session);
    setStatus('running');
    setMockScore(0);
  };

  const handleScore = (delta: number) => {
    setMockScore((s) => Math.max(0, s + delta));
  };

  const handleEnd = (won: boolean) => {
    if (!player) return;
    const result = endSession(won ? player.id : undefined, !won);
    if (result && currentSession) {
      addRecentSession(currentSession);
    }
    void recordGamePlayed(won, game.category, game.id, mockScore);
    setStatus('over');
  };

  return (
    <GameFullscreenStage game={game}>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to games</span>
          </Link>
        </div>

        <div className="text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <GameStatusBadge status={game.status} label={game.badge} />
            <GameCategoryBadge category={game.category} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-deck-950 dark:text-white font-display">
            {game.name}
          </h1>
          <p className="text-sm text-deck-600 dark:text-deck-400 max-w-md">{game.description}</p>
        </div>

        <div className="relative rounded-xl border border-surface-border bg-surface-raised overflow-hidden shadow-arcade">
          <div className="h-10 px-4 border-b border-surface-border bg-surface-overlay flex items-center justify-between text-xs text-deck-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-deck-800 dark:text-deck-200">
                V1 Shell Session
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {game.players.min === game.players.max
                    ? `${game.players.min} Player`
                    : `${game.players.min} - ${game.players.max} Players`}
                </span>
              </div>
              {status === 'running' && (
                <span className="font-mono text-amber-500 font-bold">SCORE: {mockScore}</span>
              )}
            </div>
          </div>

          <div className="min-h-[380px] flex flex-col items-center justify-center p-8 text-center bg-surface-base/50 arcade-texture">
            <GameStage
              game={game}
              status={status}
              currentSession={currentSession}
              onStart={handleStart}
              onScoreChange={handleScore}
              onEnd={handleEnd}
            />
          </div>

          <div className="p-4 border-t border-surface-border bg-surface-overlay/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-deck-500">
              <span>
                Players: {game.players.min} - {game.players.max}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <GameFeatureBadge feature="multiplayer" label="Coming Soon" size="xs" />
            </div>
          </div>
        </div>
      </div>
    </GameFullscreenStage>
  );
}
