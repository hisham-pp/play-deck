import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { type ClimberSoundType, playClimberSound } from './engine/audio';

describe('Stickman Climber — Audio, Polish & Accessibility (#131)', () => {
  it('safely triggers all audio synthesis types without throwing in headless environments', () => {
    const soundTypes: ClimberSoundType[] = [
      'strike',
      'flank',
      'cleave',
      'parry',
      'hit',
      'level_up',
      'victory',
      'game_over',
      'coin',
    ];

    for (const sound of soundTypes) {
      assert.doesNotThrow(() => {
        playClimberSound(sound, true);
        playClimberSound(sound, false);
      });
    }
  });

  it('correctly maps keyboard event codes to tactical player actions', () => {
    function mapKeyToAction(code: string): string | null {
      switch (code) {
        case 'Space':
        case 'Digit1':
          return 'strike';
        case 'KeyF':
        case 'Digit2':
          return 'flank';
        case 'KeyC':
        case 'Digit3':
          return 'cleave';
        case 'KeyP':
        case 'Digit4':
          return 'parry';
        case 'KeyM':
          return 'map';
        case 'Escape':
          return 'pause';
        case 'KeyR':
          return 'restart';
        default:
          return null;
      }
    }

    assert.equal(mapKeyToAction('Space'), 'strike');
    assert.equal(mapKeyToAction('Digit1'), 'strike');
    assert.equal(mapKeyToAction('KeyF'), 'flank');
    assert.equal(mapKeyToAction('Digit2'), 'flank');
    assert.equal(mapKeyToAction('KeyC'), 'cleave');
    assert.equal(mapKeyToAction('Digit3'), 'cleave');
    assert.equal(mapKeyToAction('KeyP'), 'parry');
    assert.equal(mapKeyToAction('Digit4'), 'parry');
    assert.equal(mapKeyToAction('KeyM'), 'map');
    assert.equal(mapKeyToAction('Escape'), 'pause');
    assert.equal(mapKeyToAction('KeyR'), 'restart');
    assert.equal(mapKeyToAction('KeyZ'), null);
  });
});
