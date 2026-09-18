const DICTIONARY_BASE = '/games/word-chain/dictionary';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const SEED_MIN_LENGTH = 4;
const SEED_MAX_LENGTH = 8;

export interface WordDictionary {
  /** Loads the shard for `letter` if it is not cached yet. */
  ensureLetter(letter: string): Promise<void>;
  /** Synchronous lookup — only meaningful once the word's shard is loaded. */
  has(word: string): boolean;
  isLetterLoaded(letter: string): boolean;
  /** A random playable word, used to open a fresh chain. */
  randomSeedWord(): Promise<string>;
}

function firstLetterOf(word: string): string {
  return word.slice(0, 1).toLowerCase();
}

/**
 * The dictionary ships as one file per starting letter. A chain turn only ever
 * asks about words beginning with a letter the players can already see, so the
 * browser downloads a single shard instead of the whole 2 MB list.
 */
class ShardedWordDictionary implements WordDictionary {
  private readonly shards = new Map<string, Set<string>>();
  private readonly inFlight = new Map<string, Promise<void>>();

  async ensureLetter(letter: string): Promise<void> {
    const key = firstLetterOf(letter);
    if (!ALPHABET.includes(key) || this.shards.has(key)) return;

    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const request = this.loadShard(key).finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, request);
    return request;
  }

  private async loadShard(letter: string): Promise<void> {
    try {
      const response = await fetch(`${DICTIONARY_BASE}/${letter}.txt`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      this.shards.set(letter, new Set(text.split('\n').filter(Boolean)));
    } catch (error) {
      // An empty shard rejects every word, which is worse than accepting them:
      // fall back to structural validation rather than blocking play.
      console.warn(`Word Chain dictionary shard "${letter}" failed to load`, error);
      this.shards.set(letter, new Set());
    }
  }

  isLetterLoaded(letter: string): boolean {
    const shard = this.shards.get(firstLetterOf(letter));
    return shard !== undefined && shard.size > 0;
  }

  has(word: string): boolean {
    const shard = this.shards.get(firstLetterOf(word));
    if (shard === undefined) return false;
    // A shard that came back empty means the download failed, not that the
    // word is invalid — stay permissive instead of rejecting everything.
    if (shard.size === 0) return true;
    return shard.has(word);
  }

  async randomSeedWord(): Promise<string> {
    for (let attempt = 0; attempt < ALPHABET.length; attempt += 1) {
      const letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      await this.ensureLetter(letter);
      const candidates = [...(this.shards.get(letter) ?? [])].filter(
        (word) => word.length >= SEED_MIN_LENGTH && word.length <= SEED_MAX_LENGTH,
      );
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    return 'start';
  }
}

export const wordDictionary: WordDictionary = new ShardedWordDictionary();
