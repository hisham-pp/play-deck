import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GameCategories } from '../enums/category.enum';
import { GameStatuses } from '../enums/status.enum';
import { resolveGameAssets, resolveGameBanner, resolveGameIcon } from './asset-resolver';
import { BaseGameEntry, defineGame, defineGamePackage } from './base-game';
import { BADGE_COMING_SOON, BADGE_READY_TO_PLAY } from './constants';

describe('BaseGameEntry & Asset Resolution', () => {
  it('instantiates BaseGameEntry with auto-resolved properties', () => {
    const entry = new BaseGameEntry({
      id: 'base-test',
      name: 'Base Test Game',
      description: 'Testing BaseGameEntry class directly.',
      category: GameCategories.A,
      players: { min: 1, max: 2 },
      status: GameStatuses.AVAILABLE,
    });

    assert.equal(entry.id, 'base-test');
    assert.equal(entry.thumbnailUrl, '/games/base-test/icon.svg');
    assert.equal(entry.bannerUrl, '/games/base-test/cover.svg');
    assert.equal(entry.isAvailable(), true);
    assert.equal(entry.toDefinition().id, 'base-test');
  });

  it('automatically resolves thumbnail and banner URLs based on game id', () => {
    const game = defineGame({
      id: 'super-arcade',
      name: 'Super Arcade',
      description: 'An exciting arcade game.',
      category: GameCategories.A,
      players: { min: 1, max: 2 },
      status: GameStatuses.AVAILABLE,
    });

    assert.equal(game.id, 'super-arcade');
    assert.equal(game.slug, 'super-arcade');
    assert.equal(game.thumbnailUrl, '/games/super-arcade/icon.svg');
    assert.equal(game.bannerUrl, '/games/super-arcade/cover.svg');
    assert.equal(game.badge, BADGE_READY_TO_PLAY);
    assert.equal(game.featured, true);
    assert.deepEqual(game.tags, []);
  });

  it('allows explicit overrides for thumbnail, banner URLs and featured', () => {
    const game = defineGame({
      id: 'custom-art',
      name: 'Custom Art Game',
      description: 'Custom art paths.',
      category: GameCategories.P,
      players: { min: 1, max: 4 },
      status: GameStatuses.COMING_SOON,
      thumbnailUrl: '/custom/icon.png',
      bannerUrl: '/custom/banner.webp',
      badge: 'Exclusive',
      featured: false,
    });

    assert.equal(game.thumbnailUrl, '/custom/icon.png');
    assert.equal(game.bannerUrl, '/custom/banner.webp');
    assert.equal(game.badge, 'Exclusive');
    assert.equal(game.featured, false);
  });

  it('supports custom extension resolution', () => {
    const icon = resolveGameIcon('tetris', 'png');
    const banner = resolveGameBanner('tetris', 'webp');
    assert.equal(icon, '/games/tetris/icon.png');
    assert.equal(banner, '/games/tetris/cover.webp');

    const assets = resolveGameAssets('tetris', { iconExt: 'webp', bannerExt: 'png' });
    assert.equal(assets.thumbnailUrl, '/games/tetris/icon.webp');
    assert.equal(assets.bannerUrl, '/games/tetris/cover.png');
  });

  it('assigns Coming Soon badge for coming-soon status when badge omitted', () => {
    const game = defineGame({
      id: 'future-quest',
      name: 'Future Quest',
      description: 'Coming next year.',
      category: GameCategories.A,
      players: { min: 1, max: 8 },
      status: GameStatuses.COMING_SOON,
    });

    assert.equal(game.badge, BADGE_COMING_SOON);
  });

  it('creates full game package with definition and content bundle', () => {
    const pkg = defineGamePackage({
      id: 'bundled-game',
      name: 'Bundled Game',
      description: 'Test bundle.',
      category: GameCategories.A,
      players: { min: 1, max: 2 },
      status: GameStatuses.AVAILABLE,
      content: {
        id: 'bundled-game',
        tagline: 'The ultimate test bundle',
        seo: {
          title: 'Bundled Game — Play Deck',
          description: 'Play the test bundled game directly in your browser with no installation.',
          keywords: ['bundled', 'arcade'],
        },
        overview: ['Overview prose paragraph here.'],
        howToPlay: [{ title: 'Start', description: 'Click play' }],
        rules: [{ title: 'Rule 1', description: 'Have fun' }],
        controls: [{ key: 'Space', action: 'Jump' }],
        tips: ['Stay alert'],
        faq: [{ question: 'Is it free?', answer: 'Yes' }],
      },
    });

    assert.equal(pkg.definition.id, 'bundled-game');
    assert.equal(pkg.content?.id, 'bundled-game');
    assert.equal(pkg.content?.tagline, 'The ultimate test bundle');
  });
});
