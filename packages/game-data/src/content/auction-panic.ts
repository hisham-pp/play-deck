import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const auctionPanicGame = defineGameModule({
  id: 'auction-panic',
  description:
    'Bid on mystery items with limited coins, then discover what you actually bought. Uncover legendary treasures, avoid cursed junk, and trigger combo set bonuses in 2–6 player rooms.',
  category: GameCategories.S,
  players: getPCount(2, 6),
  releaseDate: '2026-09-20',
  tags: [GameTags.ST, GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.S],
  seo: {
    title: 'Auction Panic — Mystery Bidding & Treasure Game | PlayDeck',
    description:
      'Bid on cryptic mystery items, outwit rival collectors, and assemble lucrative combo sets in fast-paced 2–6 player high-stakes auctions on PlayDeck.',
    keywords: [
      'auction panic',
      'mystery auction game',
      'bidding game online',
      'multiplayer auction game',
      'party bluffing game',
      'storage wars game',
      'collecting game online',
    ],
  },
  tagline:
    'Bid on sealed crates with cryptic clues, uncover priceless relics or total junk, and build an unbeatable collection.',
  overview: [
    'Auction Panic is a fast-paced 2 to 6 player multiplayer mystery auction game where fortune favors the bold and the observant.',
    'Each round, an auction lot is presented with a cryptic hint and category silhouette. Players manage a finite coin budget, engaging in real-time bidding wars before the auctioneer gavel drops.',
    'Unwrapping the lot reveals its true appraised value—from legendary golden artifacts to worthless attic junk and cursed trinkets. High-stakes modifier rounds like Blind Auctions, Double-or-Nothing lots, and Steal rounds ensure no lead is ever safe.',
    'Complete multi-item thematic combo sets to bank massive bonus points and secure your place at the top of the collectors podium.',
  ],
  howToPlay: [
    {
      title: 'Inspect the Mystery Lot',
      description:
        'Read the cryptic hint and category silhouette carefully to estimate whether the item is a valuable treasure or cheap junk.',
    },
    {
      title: 'Manage Your Bankroll',
      description:
        'Place live bids against opponents or use quick increment buttons. Watch the timer—late bids add extra seconds.',
    },
    {
      title: 'Unwrap and Appraise',
      description:
        'When the hammer falls, the item is revealed! Discover genuine market value, profit margins, or surprise penalties.',
    },
    {
      title: 'Survive Special Rounds',
      description:
        'Out-gamble opponents during Blind Auctions, risk it all on Double-or-Nothing crates, or snatch rival prizes during Steal rounds.',
    },
    {
      title: 'Assemble Combo Sets',
      description:
        'Collect 3-item thematic sets like The Pharaohs Legacy or Cyberpunk Trove to earn game-winning bonus valuations.',
    },
  ],
  rules: [
    {
      title: 'Starting Budget',
      description: 'Each player begins the auction with a fixed starting budget of 1,000 coins.',
    },
    {
      title: 'Minimum Bid Increment',
      description:
        'Standard auction bids must exceed the current highest bid by at least 10 coins.',
    },
    {
      title: 'Blind Auctions',
      description:
        'Blind auction bids are placed secretly and revealed simultaneously upon hammer fall.',
    },
    {
      title: 'Double or Nothing',
      description:
        'Double-or-Nothing rounds double both the positive appraisal value and any negative penalties.',
    },
    {
      title: 'Steal Rounds',
      description:
        'Winning a Steal round allows the highest bidder to take any revealed item from an opponents collection.',
    },
    {
      title: 'Final Valuation',
      description:
        'Final score equals remaining coins + total item portfolio value + combo set bonuses minus cursed penalties.',
    },
  ],
  controls: [
    {
      key: 'Click / Tap',
      action: 'Select quick bid increments or submit bids on the floor.',
    },
    {
      key: 'Number Input',
      action: 'Type custom bid amounts to aggressively out-bid rivals.',
    },
    {
      key: 'Keyboard B / Enter',
      action: 'Instant bid confirmation shortcut.',
    },
  ],
  tips: [
    'Do not exhaust your entire budget on early lots; saving coins for late double-or-nothing crates can reverse the game.',
    'Pay attention to item hints: mentions of gold, prototype, and ancient kings reliably indicate high rarity.',
    'Track opponents collections to block them from completing 3-piece combo sets.',
    'In Blind auctions, bid an odd number just above common round thresholds (e.g. $165 instead of $150).',
  ],
  faq: [
    {
      question: 'How many players can participate in Auction Panic?',
      answer:
        'Auction Panic supports 2 to 6 players. You can play solo against intelligent AI bot bidders or host private rooms for friends.',
    },
    {
      question: 'What happens if I buy a junk or cursed item?',
      answer:
        'Junk items yield very low or negative values, while cursed items deduct penalty points during final valuation. Be careful when bidding blindly!',
    },
    {
      question: 'Is voice chat supported during bidding?',
      answer:
        'Yes! Real-time WebRTC voice chat is integrated into room lobbies and auctions, perfect for bluffing and negotiating.',
    },
  ],
});

export const auctionPanicContent = auctionPanicGame.content;
export const auctionPanicDefinition = auctionPanicGame.definition;
