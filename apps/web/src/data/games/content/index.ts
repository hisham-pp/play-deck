import type { GameContent } from '@playdeck/game-types';
import { game2048Content } from './2048';
import { alibiContent } from './alibi';
import { anagramSprintContent } from './anagram-sprint';
import { auctionPanicContent } from './auction-panic';
import { badArchitectContent } from './bad-architect';
import { ballBounceContent } from './ball-bounce';
import { bombFactoryContent } from './bomb-factory';
import { bomberArenaContent } from './bomber-arena';
import { carromContent } from './carrom';
import { colorThiefContent } from './color-thief';
import { connectFourContent } from './connect-four';
import { crosswordClashContent } from './crossword-clash';
import { dontPopItContent } from './dont-pop-it';
import { dontWakeTheGiantContent } from './dont-wake-the-giant';
import { drawingGuessingContent } from './drawing-guessing';
import { fishingCompetitionContent } from './fishing-competition';
import { flappyArcadeContent } from './flappy-arcade';
import { floorIsLavaContent } from './floor-is-lava';
import { gravityGolfContent } from './gravity-golf';
import { gravityShiftContent } from './gravity-shift';
import { guessTheLieContent } from './guess-the-lie';
import { hideAndSeekContent } from './hide-and-seek';
import { humanConveyorBeltContent } from './human-conveyor-belt';
import { imposterBuilderContent } from './imposter-builder';
import { kingdomDraftContent } from './kingdom-draft';
import { lootDashContent } from './loot-dash';
import { ludoContent } from './ludo';
import { magnetMayhemContent } from './magnet-mayhem';
import { chessContent } from './master-chess';
import { minesweeperContent } from './minesweeper';
import { miniGolfContent } from './mini-golf';
import { oneWordStoryContent } from './one-word-story';
import { penFightContent } from './pen-fight';
import { physicsFootballContent } from './physics-football';
import { platformRaceContent } from './platform-race';
import { pongContent } from './pong';
import { pushYourLuckContent } from './push-your-luck';
import { reactionArenaContent } from './reaction-arena';
import { reverseRacingContent } from './reverse-racing';
import { runicMemoryContent } from './runic-memory';
import { secretMissionContent } from './secret-mission';
import { secretSaboteurContent } from './secret-saboteur';
import { shadowTagContent } from './shadow-tag';
import { sharedBrainContent } from './shared-brain';
import { snakeContent } from './snake';
import { snakeAndLadderContent } from './snake-and-ladder';
import { spellingBeeContent } from './spelling-bee';
import { spyNetworkContent } from './spy-network';
import { stickmanArcheryContent } from './stickman-archery';
import { stickmanClimberContent } from './stickman-climber';
import { stickmanParkourContent } from './stickman-parkour';
import { stickmanPlatformerContent } from './stickman-platformer';
import { stickmanRunnerContent } from './stickman-runner';
import { stickmanSwordFightContent } from './stickman-sword-fight';
import { sudokuContent } from './sudoku';
import { summitRushContent } from './summit-rush';
import { telephoneDrawingContent } from './telephone-drawing';
import { tetrisContent } from './tetris';
import { ticTacToeContent } from './tic-tac-toe';
import { tinyIslandContent } from './tiny-island';
import { tinyTankArenaContent } from './tiny-tank-arena';
import { towerBuilderContent } from './tower-builder';
import { trainRushContent } from './train-rush';
import { trustOrBetrayContent } from './trust-or-betray';
import { unoCardsContent } from './uno-cards';
import { unstableElevatorContent } from './unstable-elevator';
import { whoAmIContent } from './who-am-i';
import { wordBattleContent } from './word-battle';
import { wordChainContent } from './word-chain';
import { wordSearchArenaContent } from './word-search-arena';
import { wrongAnswersOnlyContent } from './wrong-answers-only';

const ALL_CONTENT: GameContent[] = [
  snakeContent,
  tetrisContent,
  ticTacToeContent,
  penFightContent,
  physicsFootballContent,
  platformRaceContent,
  carromContent,
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
  unoCardsContent,
  shadowTagContent,
  bombFactoryContent,
  bomberArenaContent,
  anagramSprintContent,
  gravityGolfContent,
  reactionArenaContent,
  reverseRacingContent,
  sharedBrainContent,
  gravityShiftContent,
  dontPopItContent,
  dontWakeTheGiantContent,
  floorIsLavaContent,
  magnetMayhemContent,
  tinyTankArenaContent,
  towerBuilderContent,
  lootDashContent,
  trustOrBetrayContent,
  secretSaboteurContent,
  auctionPanicContent,
  kingdomDraftContent,
  oneWordStoryContent,
  badArchitectContent,
  guessTheLieContent,
  wrongAnswersOnlyContent,
  telephoneDrawingContent,
  whoAmIContent,
  secretMissionContent,
  imposterBuilderContent,
  spyNetworkContent,
  alibiContent,
  spellingBeeContent,
  stickmanArcheryContent,
  stickmanClimberContent,
  stickmanParkourContent,
  stickmanPlatformerContent,
  stickmanRunnerContent,
  stickmanSwordFightContent,
  wordSearchArenaContent,
  drawingGuessingContent,
  fishingCompetitionContent,
  hideAndSeekContent,
  wordBattleContent,
  trainRushContent,
  crosswordClashContent,
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
