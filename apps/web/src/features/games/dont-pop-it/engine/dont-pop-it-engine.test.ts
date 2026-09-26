import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateTension,
  createDontPopItGame,
  generateBoardTiles,
  getAiTileSelection,
  selectTile,
  startNextRound,
} from './dont-pop-it-engine';

describe("Don't Pop It Engine", () => {
  it('generates a shuffled board with correct size and pop count', () => {
    const tiles = generateBoardTiles(5, 3);
    assert.equal(tiles.length, 25);
    const pops = tiles.filter((t) => t.type === 'pop');
    assert.equal(pops.length, 3);
    assert.ok(tiles.every((t) => !t.revealed));
  });

  it('calculates tension percentage accurately as tiles decrease', () => {
    const tiles = generateBoardTiles(5, 3);
    const initialTension = calculateTension(tiles, 3);
    assert.ok(initialTension > 0 && initialTension <= 100);

    // If only 3 tiles remain and all 3 are pops, tension should be 100%
    const criticalTiles = [
      { id: 0, row: 0, col: 0, type: 'pop' as const, revealed: false },
      { id: 1, row: 0, col: 1, type: 'pop' as const, revealed: false },
      { id: 2, row: 0, col: 2, type: 'pop' as const, revealed: false },
    ];
    assert.equal(calculateTension(criticalTiles, 3), 100);
  });

  it('initializes game state with default players and playing status', () => {
    const state = createDontPopItGame();
    assert.equal(state.status, 'playing');
    assert.equal(state.round, 1);
    assert.equal(state.players.length, 2);
    assert.equal(state.players[0].name, 'Player 1');
    assert.equal(state.players[0].score, 0);
    assert.equal(state.players[1].name, 'Pop-Bot 3000');
    assert.equal(state.currentTurnIndex, 0);
  });

  it('awards points and advances turn on safe tile reveal', () => {
    const state = createDontPopItGame();
    // Overwrite tile 0 to be safe
    state.tiles[0] = { id: 0, row: 0, col: 0, type: 'safe', revealed: false };

    const nextState = selectTile(state, 0);
    assert.equal(nextState.tiles[0].revealed, true);
    assert.equal(nextState.players[0].score, 10);
    assert.equal(nextState.currentTurnIndex, 1);
    assert.ok(nextState.lastActionMessage.includes('Safe tile'));
  });

  it('awards bonus and double points correctly', () => {
    let state = createDontPopItGame();
    state.tiles[0] = { id: 0, row: 0, col: 0, type: 'bonus', revealed: false };
    state = selectTile(state, 0);
    assert.equal(state.players[0].score, 25);

    // Double tile
    state.tiles[1] = { id: 1, row: 0, col: 1, type: 'double', revealed: false };
    state.currentTurnIndex = 0; // force player 1
    state = selectTile(state, 1);
    assert.equal(state.players[0].score, 50);
  });

  it('gives shield and protects player from pop hazard', () => {
    let state = createDontPopItGame();
    state.tiles[0] = { id: 0, row: 0, col: 0, type: 'shield', revealed: false };
    state = selectTile(state, 0);
    assert.equal(state.players[0].hasShield, true);

    // Player 1 now hits a pop tile
    state.tiles[1] = { id: 1, row: 0, col: 1, type: 'pop', revealed: false };
    state.currentTurnIndex = 0;
    state = selectTile(state, 1);

    // Player should survive because shield broke!
    assert.equal(state.players[0].hasShield, false);
    assert.equal(state.players[0].isEliminated, false);
    assert.ok(state.lastRevealedTile?.shieldSaved);
    assert.ok(state.lastActionMessage.includes('shield shattered'));
  });

  it('eliminates player without shield on pop and triggers round over', () => {
    const state = createDontPopItGame();
    state.tiles[0] = { id: 0, row: 0, col: 0, type: 'pop', revealed: false };

    const nextState = selectTile(state, 0);
    assert.equal(nextState.players[0].isEliminated, true);
    assert.equal(nextState.status, 'round_over');
    assert.ok(nextState.players[1].score >= 50); // Winner got survival bonus
  });

  it('manages next round transition and game over after max rounds', () => {
    let state = createDontPopItGame({ maxRounds: 2 });
    assert.equal(state.round, 1);

    state = startNextRound(state);
    assert.equal(state.round, 2);
    assert.equal(state.status, 'playing');

    state = startNextRound(state);
    assert.equal(state.status, 'game_over');
  });

  it('AI chooses unrevealed tile sensibly', () => {
    const state = createDontPopItGame();
    const choice = getAiTileSelection(state);
    assert.ok(choice >= 0 && choice < state.tiles.length);
    assert.equal(state.tiles[choice].revealed, false);
  });
});
