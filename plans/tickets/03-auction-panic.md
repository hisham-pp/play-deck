## Auction Panic

Create a fast-paced multiplayer Auction Panic game for Play Deck.

Players: 2-6

CORE CONCEPT
Players bid on mystery items with limited money, then discover
what they actually bought. Some items are treasures, some are junk.

GAMEPLAY

- Each player starts with a fixed budget.
- A mystery item is presented with a vague hint (silhouette, cryptic description, category).
- Players bid in real-time. Bids are visible to everyone.
- Highest bidder wins the item and pays their bid.
- The item is then revealed: it could be high-value treasure or worthless junk.
- After all items are auctioned, total item values determine the winner.
- Some items have combo bonuses (collect a set for extra points).
- Some items have negative effects (reduce your score, force you to bid on the next item).

SPECIAL ROUNDS

- Blind auction: bids are hidden until reveal.
- Forced bid: everyone must bid at least the minimum.
- Double or nothing: winner gets 2x value or loses their bid.
- Steal round: winner can steal an item from another player instead.

VOICE INTEGRATION
Voice chat enables trash talk, bluffing about item values, and alliance-breaking.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Budget allocation → Auction rounds → Item reveals → Final scoring.

UI
Show:

- Current mystery item (hint only)
- Bid interface (slider or buttons)
- Player budgets
- Won items collection
- Current highest bid
- Timer
- Voice status

VISUAL STYLE

- Exciting auction house aesthetic.
- Dramatic item reveal animations.
- Mystery packaging for unrevealed items.
- Satisfying bid confirmation effects.
- Trophy case for won items.

ACCESSIBILITY

- Keyboard bidding controls.
- Large touch targets.
- Screen-reader item descriptions.
- High contrast, reduced motion.

TECHNICAL
Separate:

- Item generator (value, hints, categories)
- Auction engine (bidding rules, timing)
- Scoring (combos, penalties)
- Multiplayer sync
- Voice adapter
- UI

---

### Ref

`plans/README.md` (Section 3: Auction Panic)
