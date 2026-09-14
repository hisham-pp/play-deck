import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SPEAKING_RELEASE_MS, SPEAKING_THRESHOLD } from '../voice.constants';
import { computeRms, isSpeakingLevel, resolveSpeaking } from './voice-levels';

describe('Voice level Tests', () => {
  it('reads silence as a zero level', () => {
    const silence = new Uint8Array(256).fill(128);
    assert.equal(computeRms(silence), 0);
  });

  it('reads a loud waveform as a high level', () => {
    const loud = new Uint8Array(256);
    loud.forEach((_value, index) => {
      loud[index] = index % 2 === 0 ? 255 : 0;
    });
    assert.ok(computeRms(loud) > SPEAKING_THRESHOLD);
  });

  it('holds the speaking flag through the release window, then clears it', () => {
    const lastSpokeAt: Record<string, number> = {};
    const start = 1_000;

    assert.equal(resolveSpeaking('peer', 0.4, start, lastSpokeAt), true);
    // Gap between words: still counted as speaking.
    assert.equal(resolveSpeaking('peer', 0, start + SPEAKING_RELEASE_MS - 1, lastSpokeAt), true);
    // Genuinely stopped.
    assert.equal(resolveSpeaking('peer', 0, start + SPEAKING_RELEASE_MS + 1, lastSpokeAt), false);
  });

  it('never latches on for a peer that has not spoken', () => {
    assert.equal(resolveSpeaking('quiet', 0, 5_000, {}), false);
    assert.equal(isSpeakingLevel(0), false);
    assert.equal(isSpeakingLevel(SPEAKING_THRESHOLD), true);
  });
});
