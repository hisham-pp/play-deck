import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const dontWakeTheGiantGame = defineGameModule({
  id: 'dont-wake-the-giant',
  name: "Don't Wake the Giant",
  description:
    'Rob a sleeping giant together. Every footstep, grab and collision fills one shared noise meter — and if it fills, he wakes and the whole crew loses.',
  category: GameCategories.CS,
  players: getPCount(3, 6),
  releaseDate: '2026-09-19',
  tags: [GameTags.M_P, GameTags.V_C, GameTags.CO, GameTags.AI, GameTags.LP],
  featured: true,
  seo: {
    title: "Don't Wake the Giant — Co-op Stealth Party Game",
    description:
      "Play Don't Wake the Giant free online. Rob a sleeping giant with up to 6 friends, share one noise meter, and slip out of the door before he wakes.",
    keywords: [
      "don't wake the giant",
      'co-op stealth game',
      'cooperative party game online',
      'shared noise meter game',
      'sneaking game multiplayer',
      'free co-op browser game',
      'voice chat party game',
    ],
  },
  tagline: 'One shared noise meter. One shared ending. Move quietly.',
  overview: [
    "Don't Wake the Giant is a cooperative stealth game for three to six players set in the chamber of a giant asleep on the floor. Treasure is scattered all around him, and the only thing standing between your crew and a clean getaway is how much noise you make taking it.",
    'Every action feeds one meter that everybody shares. Walking is quiet, running is not, and barging into a wall or a team-mate is worse than either. Lifting a relic is worth six times a trinket and makes four times the noise, so the argument over what is worth taking is the game.',
    'At half a meter the giant stirs and his arms shift, closing off routes you had planned around. At three quarters they start sweeping the floor and anyone caught by one sets off the loudest sound in the room. Fill the meter and he opens his eyes, and the heist ends for everybody at once.',
    'Play offline with a crew of AI burglars, or open an online room for up to six players with real-time WebRTC voice chat — which is where the game really lives, because the coordination has to happen in a whisper.',
  ],
  howToPlay: [
    {
      title: 'Pick your gait before you move',
      description:
        'Tiptoeing is almost silent but barely faster than standing still. Walking is the honest middle. Running covers ground quickly and puts four times as much into the meter as a walk.',
    },
    {
      title: 'Take what is in reach',
      description:
        'Stand next to a treasure and press to lift it. The prompt tells you exactly what it is worth and exactly what it will cost the meter, so every pickup is a decision rather than a reflex.',
    },
    {
      title: 'Use the soft ground',
      description:
        'Moss patches and old rugs swallow most of the sound made on top of them. Plan the loud parts of a route to happen where the floor will cover for you.',
    },
    {
      title: 'Carry it out of the door',
      description:
        'Loot only counts once it leaves the chamber. When the floor is cleared or the clock runs out the door opens, and anything still in your arms when the escape ends is left behind.',
    },
  ],
  rules: [
    {
      title: 'The meter is shared',
      description:
        'There is one noise meter for the whole crew and it never resets. It settles slowly on its own, so waiting somewhere quiet is a real tactic rather than wasted time.',
    },
    {
      title: 'Value costs noise',
      description:
        'Trinkets are cheap and quiet, relics are valuable and loud. Carrying more also makes you slower and louder, so a full pack is a liability on the way back to the door.',
    },
    {
      title: 'The giant escalates in stages',
      description:
        'At 50 per cent he stirs and shifts his arms. At 75 per cent those arms sweep the floor as moving hazards. At 100 per cent he wakes and everyone loses, no matter who filled it.',
    },
    {
      title: 'Charms buy you room',
      description:
        'A lullaby chime pulls the shared meter back down for everyone. A muffle wrap quiets one thief for eight seconds. Each one is single use, so spend them at the right moment.',
    },
  ],
  controls: [
    {
      key: 'W / A / S / D or Arrows',
      action: 'Move',
    },
    {
      key: 'Shift',
      action: 'Run — fast and loud',
    },
    {
      key: 'C / Ctrl',
      action: 'Tiptoe — quiet and slow',
    },
    {
      key: 'E / Space',
      action: 'Take the treasure or charm in reach',
    },
    {
      key: 'Touch / On-Screen Pad',
      action: 'Mobile stick, gait toggle and take button',
    },
  ],
  tips: [
    'Spread out. Two people converging on the same goblet usually end up colliding, which is louder than either pickup.',
    'Send one person for the relics and everyone else for trinkets — a single loud thief is easier to budget for than four medium ones.',
    'Save the lullaby chime until the meter is past three quarters; spending it early wastes most of its relief on a meter that was going to settle anyway.',
    'When the arms start sweeping, stop moving and read the arc before crossing. Getting swatted costs more than the detour ever would.',
    'Head back towards the door before the heist clock runs out. The escape window is short, and loot you are still holding is loot you never took.',
  ],
  faq: [
    {
      question: "How many players can join Don't Wake the Giant?",
      answer:
        'The chamber seats three to six. In offline matches, or in an online room that has not filled up, AI burglars take the remaining seats and play the same rules you do.',
    },
    {
      question: 'What happens if the noise meter fills?',
      answer:
        'The giant opens his eyes and the heist ends immediately for the entire crew. Nothing anyone was carrying counts, which is why the meter belongs to everyone rather than to whoever filled it.',
    },
    {
      question: 'Do I need voice chat to play?',
      answer:
        'No, but it is the point. Online rooms include built-in WebRTC peer-to-peer voice chat, and coordinating a route in a whisper is most of the fun.',
    },
    {
      question: 'Can I get loot out if my team-mates wake him?',
      answer:
        'No. This is a fully cooperative game with one shared outcome — either the crew gets out together with the giant still asleep, or nobody does.',
    },
  ],
});

export const dontWakeTheGiantContent = dontWakeTheGiantGame.content;
export const dontWakeTheGiantDefinition = dontWakeTheGiantGame.definition;
