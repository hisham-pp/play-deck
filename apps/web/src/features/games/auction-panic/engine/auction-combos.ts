import type { ComboSet } from '../types/auction-panic.types';

export const COMBO_SETS: ComboSet[] = [
  {
    id: 'pharaoh-legacy',
    name: "The Pharaoh's Legacy",
    requiredItemIds: ['pharaoh-mask', 'scarab-amulet', 'canopic-jar'],
    bonusPoints: 600,
    description: 'Assemble all 3 sacred relics of the ancient desert kings.',
  },
  {
    id: 'cyberpunk-trove',
    name: 'Cyberpunk Trove',
    requiredItemIds: ['neural-chip', 'plasma-blade', 'quantum-core'],
    bonusPoints: 550,
    description: 'Collect high-end cybernetic hardware from 2099.',
  },
  {
    id: 'masterpiece-vault',
    name: 'Masterpiece Vault',
    requiredItemIds: ['mona-sketch', 'golden-chalice', 'baroque-frame'],
    bonusPoints: 500,
    description: 'Curate a trio of European renaissance museum treasures.',
  },
  {
    id: 'oddity-cabinet',
    name: 'Curio Cabinet',
    requiredItemIds: ['crystal-skull', 'mermaid-fossil', 'mystic-orb'],
    bonusPoints: 450,
    description: 'Gather legendary supernatural specimens from the occult fringe.',
  },
];
