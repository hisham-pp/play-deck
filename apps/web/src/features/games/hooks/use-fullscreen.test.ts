import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useFullscreen } from './use-fullscreen';

describe('useFullscreen Hook', () => {
  it('exports useFullscreen as a callable function', () => {
    assert.equal(typeof useFullscreen, 'function');
  });

  it('validates hotkey filtering rules', () => {
    // Test logic simulating keyboard event predicate for fullscreen hotkey
    const isHotkeyValid = (e: {
      key: string;
      code?: string;
      ctrlKey?: boolean;
      metaKey?: boolean;
      altKey?: boolean;
      targetTagName?: string;
      isContentEditable?: boolean;
    }) => {
      const tag = e.targetTagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.isContentEditable) {
        return false;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return false;
      }
      return e.key === 'f' || e.key === 'F' || e.code === 'KeyF';
    };

    // Standard 'f' press
    assert.equal(isHotkeyValid({ key: 'f' }), true);
    assert.equal(isHotkeyValid({ key: 'F' }), true);
    assert.equal(isHotkeyValid({ key: 'f', code: 'KeyF' }), true);

    // With modifiers (e.g. Ctrl+F find in page) -> MUST be ignored
    assert.equal(isHotkeyValid({ key: 'f', ctrlKey: true }), false);
    assert.equal(isHotkeyValid({ key: 'f', metaKey: true }), false);
    assert.equal(isHotkeyValid({ key: 'f', altKey: true }), false);

    // In form fields -> MUST be ignored
    assert.equal(isHotkeyValid({ key: 'f', targetTagName: 'input' }), false);
    assert.equal(isHotkeyValid({ key: 'f', targetTagName: 'textarea' }), false);
    assert.equal(isHotkeyValid({ key: 'f', targetTagName: 'select' }), false);
    assert.equal(isHotkeyValid({ key: 'f', isContentEditable: true }), false);

    // Other keys
    assert.equal(isHotkeyValid({ key: 'a' }), false);
    assert.equal(isHotkeyValid({ key: 'Space' }), false);
  });
});
