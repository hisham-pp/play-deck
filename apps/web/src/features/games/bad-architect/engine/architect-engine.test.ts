import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ArchitectPlayer } from '../types/bad-architect.types';
import { generateBotBuildGrid, generateBotVotes } from './architect-bot';
import {
  calculateRoundScores,
  calculateSimilarityScore,
  createInitialArchitectState,
  rotateArchitect,
  tallyArchitectAwards,
} from './architect-engine';
import { BLUEPRINTS, createEmptyGrid } from './blueprints';

describe('Bad Architect — Engine Tests', () => {
  const blueprint = BLUEPRINTS[0]!; // Cottage

  const samplePlayers: ArchitectPlayer[] = [
    {
      id: 'p1',
      displayName: 'Alice (Architect)',
      avatar: '📐',
      role: 'architect',
      buildGrid: createEmptyGrid(),
      hasSubmitted: false,
      similarityScore: 0,
      score: 0,
      awardsReceived: [],
    },
    {
      id: 'p2',
      displayName: 'Bob (Builder)',
      avatar: '🔨',
      role: 'builder',
      buildGrid: createEmptyGrid(),
      hasSubmitted: false,
      similarityScore: 0,
      score: 0,
      awardsReceived: [],
    },
    {
      id: 'p3',
      displayName: 'Chloe (Bot)',
      avatar: '🤖',
      isBot: true,
      botSkill: 'high',
      role: 'builder',
      buildGrid: createEmptyGrid(),
      hasSubmitted: false,
      similarityScore: 0,
      score: 0,
      awardsReceived: [],
    },
  ];

  describe('Similarity Scoring', () => {
    it('returns 100% for an exact identical grid', () => {
      const score = calculateSimilarityScore(blueprint.grid, blueprint.grid);
      assert.strictEqual(score, 100);
    });

    it('returns 0% for an empty grid against a non-empty target', () => {
      const empty = createEmptyGrid();
      const score = calculateSimilarityScore(blueprint.grid, empty);
      assert.strictEqual(score, 0);
    });

    it('penalizes stray blocks outside the target shape', () => {
      const copy = blueprint.grid.map((row) => [...row]);
      // Add stray blocks in row 0
      copy[0]![0] = '#ef4444';
      copy[0]![1] = '#ef4444';
      copy[0]![6] = '#ef4444';
      copy[0]![7] = '#ef4444';

      const scoreWithStrays = calculateSimilarityScore(blueprint.grid, copy);
      assert.ok(scoreWithStrays < 100 && scoreWithStrays >= 80);
    });
  });

  describe('Game State & Role Rotation', () => {
    it('creates initial state with building phase and correct architect', () => {
      const state = createInitialArchitectState({
        players: samplePlayers,
        blueprint,
      });

      assert.strictEqual(state.phase, 'building');
      assert.strictEqual(state.architectId, 'p1');
      assert.strictEqual(state.currentBlueprint.id, blueprint.id);
    });

    it('rotates architect role to next player in circular order', () => {
      const { updatedPlayers, nextArchitectId } = rotateArchitect(samplePlayers, 'p1');

      assert.strictEqual(nextArchitectId, 'p2');
      const nextArch = updatedPlayers.find((p) => p.id === 'p2');
      assert.strictEqual(nextArch?.role, 'architect');
      const prevArch = updatedPlayers.find((p) => p.id === 'p1');
      assert.strictEqual(prevArch?.role, 'builder');
    });
  });

  describe('Awards & Scoring', () => {
    it('tallies Closest Match and Funniest Disaster awards based on votes', () => {
      const builders: ArchitectPlayer[] = [
        { ...samplePlayers[1]!, similarityScore: 85 },
        { ...samplePlayers[2]!, similarityScore: 20 },
      ];

      const votes = [
        { voterId: 'p1', targetPlayerId: 'p2', awardType: 'closest_match' as const },
        { voterId: 'p3', targetPlayerId: 'p2', awardType: 'closest_match' as const },
        { voterId: 'p1', targetPlayerId: 'p3', awardType: 'funniest_disaster' as const },
      ];

      const awards = tallyArchitectAwards(builders, votes);
      assert.strictEqual(awards.length, 2);

      const closest = awards.find((a) => a.awardType === 'closest_match');
      assert.strictEqual(closest?.winnerId, 'p2');

      const disaster = awards.find((a) => a.awardType === 'funniest_disaster');
      assert.strictEqual(disaster?.winnerId, 'p3');

      // Test score calculation
      const updated = calculateRoundScores(samplePlayers, 'p1', awards, votes);
      const bob = updated.find((p) => p.id === 'p2');
      assert.ok(bob && bob.score > 0);
      const architect = updated.find((p) => p.id === 'p1');
      assert.ok(architect !== undefined);
    });
  });

  describe('Bot Construction Simulation', () => {
    it('generates a populated grid from bot builder', () => {
      const botGrid = generateBotBuildGrid(samplePlayers[2]!, blueprint);
      const filledCount = botGrid.flat().filter(Boolean).length;
      assert.ok(filledCount > 5);

      const score = calculateSimilarityScore(blueprint.grid, botGrid);
      assert.ok(score > 30);
    });

    it('generates votes from bot builder', () => {
      const botVotes = generateBotVotes(samplePlayers[2]!, [samplePlayers[1]!, samplePlayers[2]!]);
      assert.strictEqual(botVotes.length, 2);
      assert.strictEqual(botVotes[0]!.voterId, 'p3');
      assert.strictEqual(botVotes[0]!.targetPlayerId, 'p2');
    });
  });
});
