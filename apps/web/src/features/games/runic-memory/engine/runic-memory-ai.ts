import type { AIDifficulty, RunicCard } from '../types/runic-memory.types';

export class RunicMemoryAi {
  public difficulty: AIDifficulty;
  // Map of cardIndex -> runeId that the AI currently remembers
  private memory = new Map<number, string>();

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  public resetMemory(): void {
    this.memory.clear();
  }

  /**
   * Observe a card that was revealed. Depending on difficulty, AI might or might not memorize it.
   */
  public observeCard(card: RunicCard): void {
    if (card.isMatched) {
      this.memory.delete(card.index);
      return;
    }

    const retentionProbability =
      this.difficulty === 'easy' ? 0.35 : this.difficulty === 'medium' ? 0.75 : 0.96;

    if (Math.random() <= retentionProbability) {
      this.memory.set(card.index, card.runeId);
    } else {
      // Occasional memory decay
      this.memory.delete(card.index);
    }
  }

  /**
   * Clean up matched cards from memory.
   */
  public forgetMatched(matchedIndices: number[]): void {
    matchedIndices.forEach((idx) => this.memory.delete(idx));
  }

  /**
   * Selects the first card of a turn.
   */
  private chooseFirstCard(board: RunicCard[], availableCards: RunicCard[]): number {
    // Check if AI knows of two cards that share the same runeId
    const runeIndexMap = new Map<string, number[]>();
    for (const [idx, runeId] of this.memory.entries()) {
      const card = board[idx];
      if (card && !card.isMatched) {
        const list = runeIndexMap.get(runeId) || [];
        list.push(idx);
        runeIndexMap.set(runeId, list);
      }
    }

    for (const [, indices] of runeIndexMap.entries()) {
      if (indices.length >= 2) {
        // AI knows a winning pair! Pick the first one.
        return indices[0];
      }
    }

    // If no known pair, prefer flipping a card that is NOT yet in memory (exploratory move)
    const unknownCards = availableCards.filter((c) => !this.memory.has(c.index));
    const pool = unknownCards.length > 0 ? unknownCards : availableCards;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return pick.index;
  }

  /**
   * Selects the second card of a turn after the first card is flipped.
   */
  private chooseSecondCard(
    firstIndex: number,
    board: RunicCard[],
    availableCards: RunicCard[],
  ): number {
    const firstCard = board[firstIndex];
    if (!firstCard) return availableCards[0].index;

    // Record the first card's identity in memory
    this.memory.set(firstIndex, firstCard.runeId);

    // Check if AI remembers the location of the partner card
    for (const [idx, runeId] of this.memory.entries()) {
      if (idx !== firstIndex && runeId === firstCard.runeId) {
        const candidate = board[idx];
        if (candidate && !candidate.isMatched) {
          return idx; // Found the matching rune!
        }
      }
    }

    // AI doesn't know where the match is. Avoid cards known to have DIFFERENT runes.
    const nonMatchingIndices = new Set(
      Array.from(this.memory.entries())
        .filter(([idx, runeId]) => idx !== firstIndex && runeId !== firstCard.runeId)
        .map(([idx]) => idx),
    );

    const safeCandidates = availableCards.filter((c) => !nonMatchingIndices.has(c.index));
    const finalPool = safeCandidates.length > 0 ? safeCandidates : availableCards;
    const randomChoice = finalPool[Math.floor(Math.random() * finalPool.length)];
    return randomChoice.index;
  }

  /**
   * Selects the next card index to flip.
   * @param board The current state of all cards on the board.
   * @param selectedIndices Indices of cards currently flipped in this turn (0 or 1 card).
   */
  public chooseCard(board: RunicCard[], selectedIndices: number[]): number | null {
    const availableCards = board.filter((c) => !c.isMatched && !selectedIndices.includes(c.index));
    if (availableCards.length === 0) return null;

    if (selectedIndices.length === 0) {
      return this.chooseFirstCard(board, availableCards);
    }

    return this.chooseSecondCard(selectedIndices[0], board, availableCards);
  }
}
