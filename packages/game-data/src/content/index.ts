import type { GameContent, GameDefinition } from '@playdeck/game-types';
import type { GamePackage } from '../core/base-game';
import { game2048Game } from './2048';
import { alibiGame } from './alibi';
import { anagramSprintGame } from './anagram-sprint';
import { auctionPanicGame } from './auction-panic';
import { badArchitectGame } from './bad-architect';
import { ballBounceGame } from './ball-bounce';
import { bombFactoryGame } from './bomb-factory';
import { bomberArenaGame } from './bomber-arena';
import { carromGame } from './carrom';
import { colorThiefGame } from './color-thief';
import { connectFourGame } from './connect-four';
import { crosswordClashGame } from './crossword-clash';
import { dontPopItGame } from './dont-pop-it';
import { dontWakeTheGiantGame } from './dont-wake-the-giant';
import { drawingGuessingGame } from './drawing-guessing';
import { fishingCompetitionGame } from './fishing-competition';
import { flappyArcadeGame } from './flappy-arcade';
import { floorIsLavaGame } from './floor-is-lava';
import { gravityGolfGame } from './gravity-golf';
import { gravityShiftGame } from './gravity-shift';
import { guessTheLieGame } from './guess-the-lie';
import { hangmanDuelGame } from './hangman-duel';
import { hideAndSeekGame } from './hide-and-seek';
import { humanConveyorBeltGame } from './human-conveyor-belt';
import { imposterBuilderGame } from './imposter-builder';
import { kingdomDraftGame } from './kingdom-draft';
import { lootDashGame } from './loot-dash';
import { ludoGame } from './ludo';
import { magnetMayhemGame } from './magnet-mayhem';
import { chessGame } from './master-chess';
import { minesweeperGame } from './minesweeper';
import { miniGolfGame } from './mini-golf';
import { oneWordStoryGame } from './one-word-story';
import { penFightGame } from './pen-fight';
import { physicsFootballGame } from './physics-football';
import { platformRaceGame } from './platform-race';
import { pongGame } from './pong';
import { pushYourLuckGame } from './push-your-luck';
import { reactionArenaGame } from './reaction-arena';
import { reverseRacingGame } from './reverse-racing';
import { runicMemoryGame } from './runic-memory';
import { secretMissionGame } from './secret-mission';
import { secretSaboteurGame } from './secret-saboteur';
import { shadowTagGame } from './shadow-tag';
import { sharedBrainGame } from './shared-brain';
import { snakeGame } from './snake';
import { snakeAndLadderGame } from './snake-and-ladder';
import { spellingBeeGame } from './spelling-bee';
import { spyNetworkGame } from './spy-network';
import { stickmanArcheryGame } from './stickman-archery';
import { stickmanBasketballGame } from './stickman-basketball';
import { stickmanClimberGame } from './stickman-climber';
import { stickmanNinjaGame } from './stickman-ninja';
import { stickmanParkourGame } from './stickman-parkour';
import { stickmanPlatformerGame } from './stickman-platformer';
import { stickmanRacingGame } from './stickman-racing';
import { stickmanRunnerGame } from './stickman-runner';
import { stickmanShooterGame } from './stickman-shooter';
import { stickmanSwordFightGame } from './stickman-sword-fight';
import { sudokuGame } from './sudoku';
import { summitRushGame } from './summit-rush';
import { telephoneDrawingGame } from './telephone-drawing';
import { tetrisGame } from './tetris';
import { ticTacToeGame } from './tic-tac-toe';
import { tinyIslandGame } from './tiny-island';
import { tinyTankArenaGame } from './tiny-tank-arena';
import { towerBuilderGame } from './tower-builder';
import { trainRushGame } from './train-rush';
import { trustOrBetrayGame } from './trust-or-betray';
import { unoCardsGame } from './uno-cards';
import { unstableElevatorGame } from './unstable-elevator';
import { whoAmIGame } from './who-am-i';
import { wordBattleGame } from './word-battle';
import { wordChainGame } from './word-chain';
import { wordSearchArenaGame } from './word-search-arena';
import { wrongAnswersOnlyGame } from './wrong-answers-only';

export * from './2048';
export * from './alibi';
export * from './anagram-sprint';
export * from './auction-panic';
export * from './bad-architect';
export * from './ball-bounce';
export * from './bomb-factory';
export * from './bomber-arena';
export * from './carrom';
export * from './color-thief';
export * from './connect-four';
export * from './crossword-clash';
export * from './dont-pop-it';
export * from './dont-wake-the-giant';
export * from './drawing-guessing';
export * from './fishing-competition';
export * from './flappy-arcade';
export * from './floor-is-lava';
export * from './gravity-golf';
export * from './gravity-shift';
export * from './guess-the-lie';
export * from './hangman-duel';
export * from './hide-and-seek';
export * from './human-conveyor-belt';
export * from './imposter-builder';
export * from './kingdom-draft';
export * from './loot-dash';
export * from './ludo';
export * from './magnet-mayhem';
export * from './master-chess';
export * from './minesweeper';
export * from './mini-golf';
export * from './one-word-story';
export * from './pen-fight';
export * from './physics-football';
export * from './platform-race';
export * from './pong';
export * from './push-your-luck';
export * from './reaction-arena';
export * from './reverse-racing';
export * from './runic-memory';
export * from './secret-mission';
export * from './secret-saboteur';
export * from './shadow-tag';
export * from './shared-brain';
export * from './snake';
export * from './snake-and-ladder';
export * from './spelling-bee';
export * from './spy-network';
export * from './stickman-archery';
export * from './stickman-basketball';
export * from './stickman-climber';
export * from './stickman-ninja';
export * from './stickman-parkour';
export * from './stickman-platformer';
export * from './stickman-racing';
export * from './stickman-runner';
export * from './stickman-shooter';
export * from './stickman-sword-fight';
export * from './sudoku';
export * from './summit-rush';
export * from './telephone-drawing';
export * from './tetris';
export * from './tic-tac-toe';
export * from './tiny-island';
export * from './tiny-tank-arena';
export * from './tower-builder';
export * from './train-rush';
export * from './trust-or-betray';
export * from './uno-cards';
export * from './unstable-elevator';
export * from './who-am-i';
export * from './word-battle';
export * from './word-chain';
export * from './word-search-arena';
export * from './wrong-answers-only';

export const ALL_GAMES: GamePackage[] = [
  game2048Game,
  alibiGame,
  anagramSprintGame,
  auctionPanicGame,
  badArchitectGame,
  ballBounceGame,
  bombFactoryGame,
  bomberArenaGame,
  carromGame,
  colorThiefGame,
  connectFourGame,
  crosswordClashGame,
  dontPopItGame,
  dontWakeTheGiantGame,
  drawingGuessingGame,
  fishingCompetitionGame,
  flappyArcadeGame,
  floorIsLavaGame,
  gravityGolfGame,
  gravityShiftGame,
  guessTheLieGame,
  hangmanDuelGame,
  hideAndSeekGame,
  humanConveyorBeltGame,
  imposterBuilderGame,
  kingdomDraftGame,
  lootDashGame,
  ludoGame,
  magnetMayhemGame,
  chessGame,
  minesweeperGame,
  miniGolfGame,
  oneWordStoryGame,
  penFightGame,
  physicsFootballGame,
  platformRaceGame,
  pongGame,
  pushYourLuckGame,
  reactionArenaGame,
  reverseRacingGame,
  runicMemoryGame,
  secretMissionGame,
  secretSaboteurGame,
  shadowTagGame,
  sharedBrainGame,
  snakeAndLadderGame,
  snakeGame,
  spellingBeeGame,
  spyNetworkGame,
  stickmanArcheryGame,
  stickmanBasketballGame,
  stickmanClimberGame,
  stickmanNinjaGame,
  stickmanParkourGame,
  stickmanPlatformerGame,
  stickmanRacingGame,
  stickmanRunnerGame,
  stickmanShooterGame,
  stickmanSwordFightGame,
  sudokuGame,
  summitRushGame,
  telephoneDrawingGame,
  tetrisGame,
  ticTacToeGame,
  tinyIslandGame,
  tinyTankArenaGame,
  towerBuilderGame,
  trainRushGame,
  trustOrBetrayGame,
  unoCardsGame,
  unstableElevatorGame,
  whoAmIGame,
  wordBattleGame,
  wordChainGame,
  wordSearchArenaGame,
  wrongAnswersOnlyGame,
];

export const GAME_DEFINITIONS: GameDefinition[] = ALL_GAMES.map((game) => game.definition);

export const GAME_CONTENT: Record<string, GameContent> = Object.fromEntries(
  ALL_GAMES.filter((game): game is GamePackage & { content: GameContent } =>
    Boolean(game.content),
  ).map((game) => [game.definition.id, game.content]),
);

export function getGameContent(gameId: string): GameContent | undefined {
  return GAME_CONTENT[gameId];
}
