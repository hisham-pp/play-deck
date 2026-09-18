/**
 * Builds the Word Chain dictionary that ships to the browser.
 *
 * Word Chain only ever needs words that begin with one known letter, so the
 * list is sharded by first letter and each shard is fetched on demand. A single
 * 2 MB blob would otherwise be downloaded to validate a handful of words.
 *
 * Output is generated, not committed: `predev` and `prebuild` run this script.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 12;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(repoRoot, 'apps/web/public/games/word-chain/dictionary');

/** Letters-only, sensibly sized entries — no hyphens, apostrophes or single letters. */
function isPlayable(word) {
  if (word.length < MIN_WORD_LENGTH || word.length > MAX_WORD_LENGTH) return false;
  for (let i = 0; i < word.length; i += 1) {
    const code = word.charCodeAt(i);
    if (code < 97 || code > 122) return false;
  }
  return true;
}

async function main() {
  const words = require('an-array-of-english-words');

  const shards = new Map(ALPHABET.map((letter) => [letter, []]));
  for (const raw of words) {
    const word = raw.toLowerCase();
    if (!isPlayable(word)) continue;
    shards.get(word[0]).push(word);
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const manifest = {};
  let total = 0;

  for (const letter of ALPHABET) {
    const shard = [...new Set(shards.get(letter))].sort();
    total += shard.length;
    manifest[letter] = shard.length;
    await writeFile(path.join(outputDir, `${letter}.txt`), shard.join('\n'), 'utf8');
  }

  await writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify({ total, minLength: MIN_WORD_LENGTH, maxLength: MAX_WORD_LENGTH, shards: manifest }, null, 2)}\n`,
    'utf8',
  );

  console.log(`word-chain dictionary: ${total} words across ${ALPHABET.length} shards`);
}

main().catch((error) => {
  console.error('Failed to generate the Word Chain dictionary:', error);
  process.exitCode = 1;
});
