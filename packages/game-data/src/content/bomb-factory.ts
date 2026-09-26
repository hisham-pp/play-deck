import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const bombFactoryGame = defineGameModule({
  id: 'bomb-factory',
  name: 'Bomb Factory',
  description:
    'Players collaboratively assemble machines under time pressure, but each player sees different information.',
  category: GameCategories.P,
  players: getPCount(2, 6),
  releaseDate: '2026-09-18',
  tags: [
    GameTags.M_P,
    GameTags.V_C,
    GameTags.CO,
    GameTags.LP,
    GameTags.PZ,
    GameTags.VOICE_ESSENTIAL,
  ],
  seo: {
    title: 'Bomb Factory — Asymmetric Co-op Assembly Online',
    description:
      'Play Bomb Factory free online. A tense cooperative puzzle where players assemble volatile machines under time pressure using divided blueprints and voice chat.',
    keywords: [
      'bomb factory',
      'asymmetric co-op game',
      'keep talking and nobody explodes browser',
      'blueprint puzzle multiplayer',
      'cooperative puzzle game',
      'voice chat browser game',
      'free online co-op game',
    ],
  },
  tagline: 'Divided blueprints, volatile machines, ticking clocks. Talk or blow.',
  overview: [
    'Bomb Factory is an asymmetric cooperative assembly game for 2 to 6 players. A top-secret machine blueprint has been divided into distinct dossiers, distributed secretly among your crew.',
    'One specialist knows the component sequence, another knows the correct assembly bays, a third knows the dial calibrations, and another knows the fatal safety hazards. The only tool you have to combine them is clear, urgent communication over real-time voice chat.',
    'Take turns operating the central assembly workbench while your teammates guide your hands through the schematics. Clear increasingly complex machinery before the shift clock strikes zero.',
  ],
  howToPlay: [
    {
      title: 'Open your private dossier',
      description:
        'Inspect your unique schematic channel. Never show your screen to other players — your voice is your only communication conduit.',
    },
    {
      title: 'Guide the designated operator',
      description:
        'The operator on the workbench needs a part, bay, dial number, and tool. Verify the step against your safety regulations before giving the go-ahead.',
    },
    {
      title: 'Assemble components step-by-step',
      description:
        'Select the designated component, drop it in the target bay, dial the frequency, and apply the correct tool to seat the rivet.',
    },
    {
      title: 'Survive the full shift',
      description:
        'Complete all machine assemblies in the quota before the timer expires. Faults shave precious seconds off your shift clock.',
    },
  ],
  rules: [
    {
      title: 'Information asymmetry is absolute',
      description:
        'No single player possesses enough information to assemble a component alone. Every step requires input from multiple crew specialists.',
    },
    {
      title: 'Rotating operator role',
      description:
        'The physical workbench operator rotates across machines or steps, ensuring every member takes turn on the line and in the manuals.',
    },
    {
      title: 'Faults penalize time and score',
      description:
        'Seating the wrong component or applying an improper tool triggers a loud line fault and dock time penalties from the shift clock.',
    },
    {
      title: 'Difficulty scaling',
      description:
        'Higher difficulty ratings increase machine step complexity, shrink tolerance margins, and add deceptive hazard rules.',
    },
  ],
  controls: [
    {
      key: 'Mouse / Touch',
      action: 'Select part, bay, tool, and adjust dial',
    },
    {
      key: 'Enter / Engage',
      action: 'Commit current step assembly',
    },
    {
      key: 'V / Space',
      action: 'Push-to-talk voice communication',
    },
    {
      key: 'Tab',
      action: 'Toggle dossier view',
    },
  ],
  tips: [
    'Establish consistent phonetic callouts for bays and parts early in the shift.',
    'Always confirm safety hazards before the operator presses the engage button.',
    'Keep communications concise — excessive chatter can mask critical warnings.',
  ],
  faq: [
    {
      question: 'Is a microphone required to play Bomb Factory?',
      answer:
        'Yes, Bomb Factory is designed around asymmetric voice communication. PlayDeck includes built-in low-latency WebRTC voice chat directly in the browser.',
    },
    {
      question: 'Can Bomb Factory be played locally on a single device?',
      answer:
        'Yes, local drill mode lets players pass a single device or share a screen by revealing only their designated seat dossier when prompted.',
    },
  ],
});

export const bombFactoryContent = bombFactoryGame.content;
export const bombFactoryDefinition = bombFactoryGame.definition;
