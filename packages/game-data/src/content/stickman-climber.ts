import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const stickmanClimberGame = defineGameModule({
  id: 'stickman-climber',
  name: 'Stickman Climber',
  description:
    'Scale a dangerous vertical tower, defeat escalating enemies, upgrade your weapon, and climb your way toward the next arena.',
  category: GameCategories.A,
  players: getPCount(1),
  releaseDate: '2026-09-23',
  tags: [
    GameTags.ACT,
    GameTags.VERTICAL,
    GameTags.SWORD,
    GameTags.CLIMB,
    GameTags.BOSS_FIGHT,
    GameTags.HS,
  ],
  seo: {
    title: 'Stickman Climber — Vertical Action Game | PlayDeck',
    description:
      'Climb a dangerous vertical tower, battle escalating enemies, upgrade powerful weapons, and conquer each arena in Stickman Climber on PlayDeck.',
    keywords: [
      'stickman climber',
      'vertical action game',
      'tower climber game',
      'stickman combat game',
      'browser climbing action',
      'arcade tower climb',
    ],
  },
  tagline: 'Ascend the spire, slash through foes, and forge your legend.',
  overview: [
    'Stickman Climber is a fast-paced vertical action combat game where your agile stickman hero ascends a hazardous tower crawling with fierce adversaries.',
    'Each floor pits you against escalating enemy waves requiring sharp timing, weapon strikes, and defensive maneuvers. Vanquish foes to earn experience, gather gold, and unlock powerful weapons.',
    'Level up your stats, transition through increasingly perilous arenas, and master your blade as you climb toward the summit in this arcade action experience.',
  ],
  howToPlay: [
    {
      title: 'Engage in combat',
      description: 'Click Attack or press Space to strike enemies and deplete their health pool.',
    },
    {
      title: 'Defeat enemy waves',
      description:
        'Overcome each wave of tower sentinels to advance upward to the next elevation level.',
    },
    {
      title: 'Earn XP and coins',
      description:
        'Harvest experience points and coins from defeated foes to bolster your stats and gear.',
    },
    {
      title: 'Upgrade your arsenal',
      description:
        'Unlock and wield upgraded blades from the Wooden Sword to Iron Blades and lethal Katanas.',
    },
  ],
  rules: [
    {
      title: 'Health management',
      description:
        'Sustaining excessive damage will deplete your health. Defeat enemies before they overwhelm you.',
    },
    {
      title: 'Level progression',
      description:
        'Clear all targets on the current floor to unlock subsequent ascending challenges.',
    },
    {
      title: 'Weapon tiers',
      description:
        'Higher tier weapons deal increased damage output per strike, speeding up enemy clears.',
    },
    {
      title: 'Run recovery',
      description:
        'Leveling up refreshes your health pool to 100%, priming you for higher altitude encounters.',
    },
  ],
  controls: [
    {
      key: 'Space / Attack Button',
      action: 'Strike enemy with active weapon',
    },
    {
      key: 'Level Up Button',
      action: 'Advance to next floor and upgrade weapon',
    },
    {
      key: 'P / Pause Button',
      action: 'Pause or resume session',
    },
    {
      key: 'Restart Button',
      action: 'Reset your climb back to Level 1',
    },
  ],
  tips: [
    'Time your strikes steadily rather than spamming wildly to anticipate enemy response cycles.',
    'Level up as soon as you have cleared your current wave to restore your hero to maximum health.',
    'Watch your weapon upgrade notifications to optimize damage output in later stages.',
    'Keep an eye on accumulated gold for potential future equipment enhancements.',
  ],
  faq: [
    {
      question: 'How do I advance to higher levels?',
      answer:
        'Deplete the current enemy wave HP through weapon attacks or click Level Up to ascend to the next tower tier.',
    },
    {
      question: 'What weapons can I unlock?',
      answer:
        'You start with a Wooden Sword, which can be upgraded to an Iron Blade and subsequently to a Katana.',
    },
    {
      question: 'Is Stickman Climber playable on mobile devices?',
      answer:
        'Yes. All actions including Attack, Level Up, and Pause are accessible via responsive on-screen touch buttons.',
    },
  ],
});

export const stickmanClimberContent = stickmanClimberGame.content;
export const stickmanClimberDefinition = stickmanClimberGame.definition;
