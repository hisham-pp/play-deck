import type { GameContent } from '@playdeck/game-types';
import { game2048Content } from './2048';
import { anagramSprintContent } from './anagram-sprint';
import { ballBounceContent } from './ball-bounce';
import { bombFactoryContent } from './bomb-factory';
import { colorThiefContent } from './color-thief';
import { connectFourContent } from './connect-four';
import { dontWakeTheGiantContent } from './dont-wake-the-giant';
import { flappyArcadeContent } from './flappy-arcade';
import { floorIsLavaContent } from './floor-is-lava';
import { gravityGolfContent } from './gravity-golf';
import { gravityShiftContent } from './gravity-shift';
import { humanConveyorBeltContent } from './human-conveyor-belt';
import { ludoContent } from './ludo';
import { magnetMayhemContent } from './magnet-mayhem';
import { chessContent } from './master-chess';
import { minesweeperContent } from './minesweeper';
import { miniGolfContent } from './mini-golf';
import { penFightContent } from './pen-fight';
import { pongContent } from './pong';
import { pushYourLuckContent } from './push-your-luck';
import { reverseRacingContent } from './reverse-racing';
import { runicMemoryContent } from './runic-memory';
import { shadowTagContent } from './shadow-tag';
import { sharedBrainContent } from './shared-brain';
import { snakeContent } from './snake';
import { snakeAndLadderContent } from './snake-and-ladder';
import { sudokuContent } from './sudoku';
import { summitRushContent } from './summit-rush';
import { tetrisContent } from './tetris';
import { ticTacToeContent } from './tic-tac-toe';
import { tinyIslandContent } from './tiny-island';
import { unstableElevatorContent } from './unstable-elevator';
import { wordChainContent } from './word-chain';

const ALL_CONTENT: GameContent[] = [
  snakeContent,
  tetrisContent,
  ticTacToeContent,
  penFightContent,
  ludoContent,
  sudokuContent,
  chessContent,
  connectFourContent,
  runicMemoryContent,
  minesweeperContent,
  game2048Content,
  ballBounceContent,
  pongContent,
  summitRushContent,
  flappyArcadeContent,
  humanConveyorBeltContent,
  miniGolfContent,
  pushYourLuckContent,
  snakeAndLadderContent,
  tinyIslandContent,
  wordChainContent,
  colorThiefContent,
  unstableElevatorContent,
  shadowTagContent,
  bombFactoryContent,
  anagramSprintContent,
  gravityGolfContent,
  reverseRacingContent,
  sharedBrainContent,
  gravityShiftContent,
  dontWakeTheGiantContent,
  floorIsLavaContent,
  magnetMayhemContent,
];

/**
 * Editorial content keyed by `GameDefinition.id`. Adding a game means adding
 * one file in this folder and one entry above — nothing else in the app needs
 * to change for its page to render and be indexed.
 */
export const GAME_CONTENT: Record<string, GameContent> = Object.fromEntries(
  ALL_CONTENT.map((content) => [content.id, content]),
);

export function getGameContent(gameId: string): GameContent | undefined {
  return GAME_CONTENT[gameId];
}
