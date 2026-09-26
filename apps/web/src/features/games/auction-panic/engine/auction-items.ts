import type { AuctionItem } from '../types/auction-panic.types';

export { COMBO_SETS } from './auction-combos';

const CAT_ANTIQUITIES = 'antiquities' as const;
const CAT_GALACTIC_TECH = 'galactic-tech' as const;
const CAT_FINE_ART = 'fine-art' as const;
const CAT_ODDITIES = 'oddities' as const;
const CAT_JUNK = 'junk' as const;

const RARITY_COMMON = 'common' as const;
const RARITY_UNCOMMON = 'uncommon' as const;
const RARITY_RARE = 'rare' as const;
const RARITY_LEGENDARY = 'legendary' as const;
const RARITY_CURSED = 'cursed' as const;

const SET_PHARAOH = 'pharaoh-legacy' as const;
const SET_CYBERPUNK = 'cyberpunk-trove' as const;
const SET_MASTERPIECE = 'masterpiece-vault' as const;
const SET_ODDITY = 'oddity-cabinet' as const;

function makeItem(
  id: string,
  name: string,
  category: AuctionItem['category'],
  rarity: AuctionItem['rarity'],
  hint: string,
  crypticDescription: string,
  baseValue: number,
  icon: string,
  extra?: Partial<AuctionItem>,
): AuctionItem {
  return {
    id,
    name,
    category,
    rarity,
    hint,
    crypticDescription,
    baseValue,
    isJunk: extra?.isJunk ?? false,
    icon,
    ...extra,
  };
}

export const AUCTION_ITEMS_CATALOG: AuctionItem[] = [
  // Antiquities
  makeItem('pharaoh-mask', 'Gilded Burial Mask', CAT_ANTIQUITIES, RARITY_LEGENDARY, 'Gleams under torchlight; heavy solid gold with lapis lazuli eyes.', 'Unearthed from the Valley of the Kings. Weighs 12 kilograms of pure gold.', 950, '👑', { comboSetId: SET_PHARAOH }),
  makeItem('scarab-amulet', 'Obsidian Scarab Amulet', CAT_ANTIQUITIES, RARITY_RARE, 'Carved beetle amulet pulsing with faint mystical energy.', 'Anointed by priests during the third dynasty. Highly sought by occultists.', 550, '🪲', { comboSetId: SET_PHARAOH }),
  makeItem('canopic-jar', 'Alabaster Canopic Jar', CAT_ANTIQUITIES, RARITY_UNCOMMON, 'A sealed stone jar adorned with a falcon head stopper.', 'Preserved royal urn containing ancient perfumes and resins.', 400, '🏺', { comboSetId: SET_PHARAOH }),

  // Galactic Tech
  makeItem('quantum-core', 'Sub-Zero Quantum Core', CAT_GALACTIC_TECH, RARITY_LEGENDARY, 'Humming cylindrical reactor cell venting cryogenic vapor.', 'Power source capable of warping local spacetime. Extremely valuable.', 1000, '🔮', { comboSetId: SET_CYBERPUNK }),
  makeItem('plasma-blade', 'Overcharged Plasma Blade', CAT_GALACTIC_TECH, RARITY_RARE, 'Chrome hilt emitting a blinding ionizing beam.', 'Military-grade prototype from an orbital black-site laboratory.', 600, '⚡', { comboSetId: SET_CYBERPUNK }),
  makeItem('neural-chip', 'Cortex Neural Interface', CAT_GALACTIC_TECH, RARITY_UNCOMMON, 'Microscopic gold wire array encased in synthetic diamond.', 'Direct brain-computer link used by high-frequency market operators.', 420, '💾', { comboSetId: SET_CYBERPUNK }),

  // Fine Art
  makeItem('mona-sketch', 'Original Charcoal Study', CAT_FINE_ART, RARITY_LEGENDARY, 'Framed parchment with delicate hand-drawn enigmatic smile.', 'Lost preliminary study by an Italian polymath. Verified by top auction houses.', 900, '🎨', { comboSetId: SET_MASTERPIECE }),
  makeItem('golden-chalice', 'Imperial Coronation Chalice', CAT_FINE_ART, RARITY_RARE, 'Chased goblet encrusted with emeralds and rubies.', 'Used in 16th-century European coronation ceremonies.', 620, '🏆', { comboSetId: SET_MASTERPIECE }),
  makeItem('baroque-frame', 'Hand-Carved Gilt Frame', CAT_FINE_ART, RARITY_UNCOMMON, 'Opulent wooden frame with ornate floral filigree.', 'Empty 18th-century Venetian frame valued for its pristine gold leaf.', 380, '🖼️', { comboSetId: SET_MASTERPIECE }),

  // Oddities
  makeItem('crystal-skull', 'Prismatic Quartz Skull', CAT_ODDITIES, RARITY_RARE, 'Translucent skull refracting rainbow beams onto the gallery walls.', 'Carved against the grain of natural quartz with impossible precision.', 650, '💀', { comboSetId: SET_ODDITY }),
  makeItem('mermaid-fossil', 'Fiji Mummified Specimen', CAT_ODDITIES, RARITY_UNCOMMON, 'Bizarre chimera skeleton preserved in a glass dome.', 'Victorian carnival spectacle of ape and fish taxidermy. Rare novelty value.', 430, '🧜', { comboSetId: SET_ODDITY }),
  makeItem('mystic-orb', 'Swirling Aether Orb', CAT_ODDITIES, RARITY_UNCOMMON, 'Heavy sphere containing bioluminescent mist.', 'Victorian parlor curiosity filled with phosphorescent deep-sea plankton oil.', 390, '🧿', { comboSetId: SET_ODDITY }),

  // Standalone Treasures
  makeItem('pirate-chest', 'Sunken Doubloon Chest', CAT_ANTIQUITIES, RARITY_LEGENDARY, 'Barnacle-encrusted ironbound chest with a heavy padlock.', 'Recovered from a Caribbean galleon. Bursting with silver and gold coins.', 850, '📦'),
  makeItem('diamond-watch', 'Tourbillon Pocket Chronometer', CAT_FINE_ART, RARITY_RARE, 'Intricate ticking timepiece featuring diamond escapement.', 'Swiss master craft. Accurate to one second per millennium.', 700, '⏱️'),

  // Cursed & Dangerous Items
  makeItem('haunted-doll', 'Porcelain Victorian Doll', CAT_ODDITIES, RARITY_CURSED, 'Antique porcelain face with glass eyes that seem to track you.', 'Previous owners reported chilly breezes and unexplained missing coins.', -250, '🪆', { isCursed: true, penalty: 250 }),
  makeItem('gremlin-crate', 'Scratched Wooden Shipping Crate', CAT_ODDITIES, RARITY_CURSED, 'Something inside is violently shaking the box and growling.', 'Whatever was inside chewed through the packaging and caused havoc.', -300, '📦', { isCursed: true, penalty: 300 }),

  // Junk Items
  makeItem('rusty-can', 'Vintage Rusty Tin Can', CAT_JUNK, RARITY_COMMON, 'A cylindrical container wrapped in faded, peeling tin foil.', 'It was just an empty soup can from 1984. Total junk.', 15, '🥫', { isJunk: true }),
  makeItem('broken-toaster', 'Two-Slice Retro Toaster', CAT_JUNK, RARITY_COMMON, 'Metallic kitchen appliance with vintage chrome sheen.', 'Missing heating coils and power cord. Worthless junk.', 10, '🍞', { isJunk: true }),
  makeItem('moldy-sandwich', 'Petrified Deli Sub', CAT_JUNK, RARITY_COMMON, 'Wrapped in brown paper parchment labeled "Special Delivery".', 'A six-month-old meatball sub that turned green. Negative appraisal value.', -50, '🥪', { isJunk: true }),
  makeItem('deflated-balloon', 'Latex Birthday Relic', CAT_JUNK, RARITY_COMMON, 'Wrinkled colorful rubber membrane with attached string.', 'A sad deflated helium balloon from someone elses party.', 5, '🎈', { isJunk: true }),
  makeItem('loose-screws', 'Mystery Jar of Hardware', CAT_JUNK, RARITY_COMMON, 'Heavy glass jar rattling with miscellaneous metallic pieces.', 'Assorted mismatched wood screws and washers from a garage cleanup.', 20, '🔩', { isJunk: true }),
];
