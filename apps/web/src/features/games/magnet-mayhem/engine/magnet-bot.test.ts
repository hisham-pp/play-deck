import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluateBotInput } from './magnet-bot';
import { createInitialArenaState } from './magnet-engine';

describe('Magnet Mayhem — Bot AI', () => {
  const mockPlayers = [
    { id: 'p1', name: 'Human', avatar: '🧲', isBot: false, isHost: true },
    { id: 'bot-1', name: 'Bot Atlas', avatar: '🤖', isBot: true, isHost: false },
  ];

  it('seeks target and activates attract when energy is sufficient', () => {
    const state = createInitialArenaState(mockPlayers);
    const bot = state.players[1];
    bot.energy = 100;
    bot.stunnedTimer = 0;

    const decision = evaluateBotInput(bot, state);
    assert.ok(typeof decision.aimAngle === 'number');
    assert.equal(decision.action, 'attract');
  });

  it('conserves energy and idles when energy is low', () => {
    const state = createInitialArenaState(mockPlayers);
    const bot = state.players[1];
    bot.energy = 10; // Low energy
    bot.stunnedTimer = 0;

    const decision = evaluateBotInput(bot, state);
    assert.equal(decision.action, 'idle');
  });

  it('triggers repel when an opponent is very close', () => {
    const state = createInitialArenaState(mockPlayers);
    const bot = state.players[1];
    bot.energy = 80;
    bot.position = { x: 300, y: 300 };

    // Place rival very close
    state.players[0].position = { x: 340, y: 300 };

    const decision = evaluateBotInput(bot, state);
    assert.equal(decision.action, 'repel');
  });

  it('remains idle while stunned', () => {
    const state = createInitialArenaState(mockPlayers);
    const bot = state.players[1];
    bot.energy = 100;
    bot.stunnedTimer = 0.5;

    const decision = evaluateBotInput(bot, state);
    assert.equal(decision.action, 'idle');
  });
});
