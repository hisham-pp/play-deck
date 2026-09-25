import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canFormFromRack,
  calculateWordScore,
  createInitialWordBattleState,
  findAvailableWordsForRack,
  generateLetterRack,
  isWordInDictionary,
  resolveDuplicateScores,
  startRound,
  stepWordBattleEngine,
  submitPlayerWord,
  validateSubmission,
  type SubmittedWord,
} from './word-battle-engine';

test('Word Battle Engine - canFormFromRack respects letter inventory and counts', () => {
  const rack = ['S', 'T', 'A', 'R', 'E', 'D', 'S'];

  // Valid words
  assert.equal(canFormFromRack('STAR', rack), true);
  assert.equal(canFormFromRack('STARS', rack), true); // 2 S's present
  assert.equal(canFormFromRack('STARED', rack), true);
  assert.equal(canFormFromRack('DATES', rack), true);

  // Missing letter
  assert.equal(canFormFromRack('PLANET', rack), false);
  assert.equal(canFormFromRack('BLAZE', rack), false);

  // Letter count overflow (rack only has 1 'E', STEER needs 2)
  assert.equal(canFormFromRack('STEER', rack), false);

  // Letter count overflow (rack has 2 'S's, cannot use 3)
  assert.equal(canFormFromRack('ASSESS', rack), false);

  // Too short (< 3 letters)
  assert.equal(canFormFromRack('AT', rack), false);
  assert.equal(canFormFromRack('S', rack), false);
});

test('Word Battle Engine - isWordInDictionary checks embedded and external sets', () => {
  assert.equal(isWordInDictionary('STAR'), true);
  assert.equal(isWordInDictionary('planet'), true);
  assert.equal(isWordInDictionary('NOTAREALWORDXYZ'), false);

  const customSet = new Set(['NEOLOGISM', 'CYBERDECK']);
  assert.equal(isWordInDictionary('NEOLOGISM', customSet), true);
  assert.equal(isWordInDictionary('CYBERDECK', customSet), true);
});

test('Word Battle Engine - calculateWordScore handles lengths, rare letters and pangrams', () => {
  const rack = ['P', 'L', 'A', 'N', 'E', 'T', 'S'];

  // 4 letters: base 200
  const score4 = calculateWordScore('PLAN', rack);
  assert.equal(score4.baseScore, 200);
  assert.equal(score4.isPangram, false);

  // 5 letters: base 400
  const score5 = calculateWordScore('PLANT', rack);
  assert.equal(score5.baseScore, 400);

  // 7 letters pangram: base 1100 + pangram bonus 500
  const score7 = calculateWordScore('PLANETS', rack);
  assert.equal(score7.baseScore, 1100);
  assert.equal(score7.isPangram, true);
  assert.equal(score7.bonusScore >= 500, true);
  assert.equal(score7.totalScore, 1600);

  // Rare letter bonus (Z = 150)
  const scoreZ = calculateWordScore('ZERO', ['Z', 'E', 'R', 'O', 'A', 'B', 'C']);
  assert.equal(scoreZ.bonusScore >= 150, true);

  // Speed mode combo multiplier
  const speedComboScore = calculateWordScore('STAR', ['S', 'T', 'A', 'R', 'E'], 'speed', 4);
  assert.equal(speedComboScore.totalScore > score4.totalScore, true);
});

test('Word Battle Engine - validateSubmission rejects invalid inputs', () => {
  const rack = ['S', 'T', 'A', 'R', 'E', 'D', 'S'];
  const submitted: string[] = ['STAR'];

  // Valid
  const valid = validateSubmission('DATES', rack, submitted);
  assert.equal(valid.isValid, true);

  // Too short
  const tooShort = validateSubmission('NO', rack, submitted);
  assert.equal(tooShort.isValid, false);
  assert.equal(tooShort.reason, 'too-short');

  // Not in rack
  const invalidLetters = validateSubmission('LION', rack, submitted);
  assert.equal(invalidLetters.isValid, false);
  assert.equal(invalidLetters.reason, 'invalid-letters');

  // Already submitted
  const alreadySub = validateSubmission('STAR', rack, submitted);
  assert.equal(alreadySub.isValid, false);
  assert.equal(alreadySub.reason, 'already-submitted');

  // Not in dictionary
  const fakeWord = validateSubmission('STARD', rack, submitted);
  assert.equal(fakeWord.isValid, false);
  assert.equal(fakeWord.reason, 'not-in-dictionary');
});

test('Word Battle Engine - resolveDuplicateScores applies duplicate rules correctly', () => {
  const subs: SubmittedWord[] = [
    {
      word: 'PLANET',
      playerId: 'player-1',
      playerName: 'Player 1',
      timestamp: 100,
      baseScore: 700,
      bonusScore: 0,
      totalScore: 700,
      isDuplicate: false,
      duplicateWithPlayerIds: [],
      isPangram: false,
    },
    {
      word: 'PLANET',
      playerId: 'bot-1',
      playerName: 'Bot 1',
      timestamp: 105,
      baseScore: 700,
      bonusScore: 0,
      totalScore: 700,
      isDuplicate: false,
      duplicateWithPlayerIds: [],
      isPangram: false,
    },
    {
      word: 'LEAST',
      playerId: 'player-1',
      playerName: 'Player 1',
      timestamp: 110,
      baseScore: 400,
      bonusScore: 0,
      totalScore: 400,
      isDuplicate: false,
      duplicateWithPlayerIds: [],
      isPangram: false,
    },
  ];

  // 1. Cancelled duplicate rule (duplicates score 0)
  const cancelled = resolveDuplicateScores(subs, 'cancelled');
  const sub1 = cancelled.find((s) => s.playerId === 'player-1' && s.word === 'PLANET');
  const sub2 = cancelled.find((s) => s.playerId === 'bot-1' && s.word === 'PLANET');
  const uniqueSub = cancelled.find((s) => s.word === 'LEAST');

  assert.equal(sub1?.isDuplicate, true);
  assert.equal(sub1?.totalScore, 0);
  assert.equal(sub2?.isDuplicate, true);
  assert.equal(sub2?.totalScore, 0);
  assert.equal(uniqueSub?.isDuplicate, false);
  assert.equal(uniqueSub?.totalScore, 400);

  // 2. Reduced duplicate rule (duplicates score 50%)
  const reduced = resolveDuplicateScores(subs, 'reduced');
  const reducedSub = reduced.find((s) => s.word === 'PLANET');
  assert.equal(reducedSub?.totalScore, 350);

  // 3. None duplicate rule (keeps full points)
  const none = resolveDuplicateScores(subs, 'none');
  const noneSub = none.find((s) => s.word === 'PLANET');
  assert.equal(noneSub?.totalScore, 700);
});

test('Word Battle Engine - rack generation and word finding', () => {
  const rackInfo = generateLetterRack(1);
  assert.equal(rackInfo.letters.length >= 7, true);

  const available = findAvailableWordsForRack(rackInfo.letters);
  assert.equal(available.length > 0, true);
});

test('Word Battle Engine - anagram battle mode grants extra pangram bonus', () => {
  const rack = ['P', 'L', 'A', 'N', 'E', 'T', 'S'];
  const classicScore = calculateWordScore('PLANETS', rack, 'classic');
  const anagramScore = calculateWordScore('PLANETS', rack, 'anagram-battle');

  // Anagram battle gives an extra +500 bounty for full rack solve
  assert.equal(anagramScore.totalScore, classicScore.totalScore + 500);
});

test('Word Battle Engine - longest-word mode multiplies base score for length >= 6', () => {
  const rack = ['P', 'L', 'A', 'N', 'E', 'T', 'S'];
  const classic6 = calculateWordScore('PLANET', rack, 'classic');
  const longest6 = calculateWordScore('PLANET', rack, 'longest-word');

  assert.equal(longest6.baseScore, Math.floor(classic6.baseScore * 1.5));
});

test('Word Battle Engine - bot simulation steps and submits words automatically', () => {
  let state = createInitialWordBattleState({ totalRounds: 1, botCount: 2 });
  state = startRound(state, 1);

  // Set first bot cooldown to 0 to simulate imminent submit
  state.players[1].nextBotSubmitCooldown = 0.05;

  // Step engine by 0.1s
  state = stepWordBattleEngine(state, 0.1);

  const botPlayer = state.players.find((p) => p.id === 'bot-1');
  assert.equal(Boolean(botPlayer && botPlayer.wordsSubmitted.length > 0), true);
  assert.equal(state.submissions.length > 0, true);
});

test('Word Battle Engine - round flow from lobby to playing, submit, review and game over', () => {
  let state = createInitialWordBattleState({ totalRounds: 2, roundDurationSeconds: 45 });
  assert.equal(state.phase, 'lobby');
  assert.equal(state.players.length, 3); // 1 human + 2 bots

  // Start Round 1
  state = startRound(state, 1);
  assert.equal(state.phase, 'playing');
  assert.equal(state.currentRound.roundNumber, 1);
  assert.equal(state.currentRound.timeRemaining, 45);

  // Find a valid word from the rack to submit
  const validWords = findAvailableWordsForRack(state.currentRound.letters);
  assert.equal(validWords.length > 0, true);
  const testWord = validWords[0];

  const submitRes = submitPlayerWord(state, 'player-1', testWord);
  assert.equal(submitRes.result.isValid, true);
  state = submitRes.state;

  const human = state.players.find((p) => p.id === 'player-1');
  assert.equal(human?.wordsSubmitted.includes(testWord), true);
  assert.equal(Boolean(human && human.roundScore > 0), true);

  // Step engine with dt to trigger timer expiration and complete round
  state = stepWordBattleEngine(state, 50); // dt 50s > 45s
  assert.equal(state.phase, 'round-review');
  assert.equal(state.submissions.length > 0, true);

  // Advance to Round 2
  state = startRound(state, 2);
  assert.equal(state.phase, 'playing');
  assert.equal(state.currentRound.roundNumber, 2);

  // Step engine to expire round 2 (final round)
  state = stepWordBattleEngine(state, 50);
  assert.equal(state.phase, 'game-over');
});
