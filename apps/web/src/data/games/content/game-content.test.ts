import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GAME_DEFINITIONS } from '../index';
import { GAME_CONTENT, getGameContent } from './index';

const MAX_SEO_TITLE_LENGTH = 65;
const MIN_SEO_DESCRIPTION_LENGTH = 110;
const MAX_SEO_DESCRIPTION_LENGTH = 165;

describe('Game content registry — coverage', () => {
  it('has a content module for every game in the catalog', () => {
    const missing = GAME_DEFINITIONS.filter((game) => !getGameContent(game.id)).map(
      (game) => game.id,
    );
    assert.deepEqual(missing, [], `games missing a content module: ${missing.join(', ')}`);
  });

  it('has no orphaned content without a matching game', () => {
    const ids = new Set(GAME_DEFINITIONS.map((game) => game.id));
    const orphans = Object.keys(GAME_CONTENT).filter((id) => !ids.has(id));
    assert.deepEqual(orphans, [], `content with no game definition: ${orphans.join(', ')}`);
  });

  it('keys every entry by its own id', () => {
    for (const [key, content] of Object.entries(GAME_CONTENT)) {
      assert.equal(content.id, key);
    }
  });
});

describe('Game content registry — SEO fields', () => {
  it('keeps titles within the search result snippet limit', () => {
    for (const content of Object.values(GAME_CONTENT)) {
      assert.ok(
        content.seo.title.length <= MAX_SEO_TITLE_LENGTH,
        `${content.id} title is ${content.seo.title.length} chars (max ${MAX_SEO_TITLE_LENGTH})`,
      );
    }
  });

  it('keeps descriptions within the snippet range', () => {
    for (const content of Object.values(GAME_CONTENT)) {
      const { length } = content.seo.description;
      assert.ok(
        length >= MIN_SEO_DESCRIPTION_LENGTH && length <= MAX_SEO_DESCRIPTION_LENGTH,
        `${content.id} description is ${length} chars (want ${MIN_SEO_DESCRIPTION_LENGTH}-${MAX_SEO_DESCRIPTION_LENGTH})`,
      );
    }
  });

  it('ships keywords and populated content sections for each game', () => {
    for (const content of Object.values(GAME_CONTENT)) {
      assert.ok(content.seo.keywords.length > 0, `${content.id} has no keywords`);
      assert.ok(content.tagline.length > 0, `${content.id} has no tagline`);
      assert.ok(content.overview.length > 0, `${content.id} has no overview prose`);
      assert.ok(content.howToPlay.length > 0, `${content.id} has no how-to-play steps`);
      assert.ok(content.rules.length > 0, `${content.id} has no rules`);
      assert.ok(content.controls.length > 0, `${content.id} has no controls`);
      assert.ok(content.tips.length > 0, `${content.id} has no tips`);
      assert.ok(content.faq.length > 0, `${content.id} has no FAQ entries`);
    }
  });
});

describe('Game catalog — canonical URLs', () => {
  it('has a unique slug per game', () => {
    const slugs = GAME_DEFINITIONS.map((game) => game.slug);
    assert.equal(new Set(slugs).size, slugs.length, 'duplicate slugs would collide on /games/*');
  });

  it('never lets one game\u2019s id shadow another game\u2019s slug', () => {
    const slugs = new Map(GAME_DEFINITIONS.map((game) => [game.slug, game.id]));
    for (const game of GAME_DEFINITIONS) {
      const owner = slugs.get(game.id);
      assert.ok(
        owner === undefined || owner === game.id,
        `id "${game.id}" collides with the slug of "${owner}"`,
      );
    }
  });
});
