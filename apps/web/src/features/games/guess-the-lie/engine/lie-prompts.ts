import type { LiePrompt, PromptCategory } from '../types/guess-the-lie.types';

export const LIE_PROMPTS: LiePrompt[] = [
  // Factual Prompts
  {
    id: 'fac-1',
    category: 'factual',
    question: 'Name an official national capital city located on an island.',
    exampleTruths: [
      'Reykjavik (Iceland)',
      'Tokyo (Japan)',
      'Havana (Cuba)',
      'Wellington (New Zealand)',
    ],
    exampleLies: [
      'Zurich (Switzerland)',
      'Sydney (Australia)',
      'Barcelona (Spain)',
      'Dubrovnik (Croatia)',
    ],
    hint: 'Think of island nations around the world!',
  },
  {
    id: 'fac-2',
    category: 'factual',
    question: 'Name a chemical element whose symbol does NOT match its English name.',
    exampleTruths: [
      'Gold (Au)',
      'Iron (Fe)',
      'Lead (Pb)',
      'Potassium (K)',
      'Sodium (Na)',
      'Mercury (Hg)',
    ],
    exampleLies: ['Helium (He)', 'Oxygen (Ox)', 'Zinc (Zi)', 'Cobalt (Cb)', 'Carbon (Cn)'],
    hint: 'Latin or historical roots often differ from English names.',
  },
  {
    id: 'fac-3',
    category: 'factual',
    question: 'Name a mammal that cannot jump.',
    exampleTruths: ['Elephant', 'Sloth', 'Hippopotamus', 'Rhino'],
    exampleLies: ['Kangaroo', 'Cheetah', 'Alpine Goat', 'Red Fox', 'Snow Leopard'],
    hint: 'Heavyweights or tree dwellers are prime suspects.',
  },
  {
    id: 'fac-4',
    category: 'factual',
    question: 'Name a country that borders at least 10 other sovereign nations.',
    exampleTruths: ['China (14 borders)', 'Russia (14 borders)', 'Brazil (10 borders)'],
    exampleLies: [
      'United States (2 borders)',
      'India (6 borders)',
      'Canada (1 border)',
      'Australia (0 borders)',
    ],
    hint: 'Sprawling continental landmasses with many neighboring countries.',
  },
  {
    id: 'fac-5',
    category: 'factual',
    question: 'Name a planet in our solar system that spins clockwise (retrograde rotation).',
    exampleTruths: ['Venus', 'Uranus'],
    exampleLies: ['Mars', 'Jupiter', 'Saturn', 'Neptune', 'Mercury'],
    hint: 'Only two oddballs spin backwards compared to most planets.',
  },

  // Trivia Prompts
  {
    id: 'triv-1',
    category: 'trivia',
    question: 'What animal holds hands with its partner while sleeping to prevent drifting away?',
    exampleTruths: ['Sea Otters', 'Otters'],
    exampleLies: ['Dolphins', 'Penguins', 'Beavers', 'Seals', 'Manatees'],
    hint: 'They float on their backs in kelp forests.',
  },
  {
    id: 'triv-2',
    category: 'trivia',
    question: 'What color is a polar bear’s skin beneath its thick white fur?',
    exampleTruths: ['Black skin', 'Pitch black'],
    exampleLies: ['Pure white', 'Soft pink', 'Light blue', 'Ash grey'],
    hint: 'The dark hue helps absorb warmth from the Arctic sun.',
  },
  {
    id: 'triv-3',
    category: 'trivia',
    question: 'What was the first commercially sold video game console released in 1972?',
    exampleTruths: ['Magnavox Odyssey', 'The Odyssey'],
    exampleLies: [
      'Atari 2600',
      'Nintendo Entertainment System',
      'Commodore 64',
      'Sega Master System',
    ],
    hint: 'It predates Atari and used printed plastic television overlays.',
  },
  {
    id: 'triv-4',
    category: 'trivia',
    question: 'How many hearts does an octopus possess?',
    exampleTruths: ['Three hearts', '3'],
    exampleLies: ['One heart', 'Two hearts', 'Five hearts', 'Eight hearts'],
    hint: 'Two pump blood to the gills, while the third pumps to the body.',
  },
  {
    id: 'triv-5',
    category: 'trivia',
    question:
      'What fruit was historically considered so valuable in 18th-century Europe that people rented them for parties?',
    exampleTruths: ['Pineapple', 'Pineapples'],
    exampleLies: ['Banana', 'Watermelon', 'Dragonfruit', 'Pomegranate'],
    hint: 'A prickly tropical fruit seen as the ultimate status symbol of wealth.',
  },

  // Personal Prompts
  {
    id: 'pers-1',
    category: 'personal',
    question: 'What is a bizarre food combination that you genuinely enjoy eating?',
    exampleTruths: [
      'French fries dipped in vanilla milkshake',
      'Cheddar cheese on top of warm apple pie',
      'Peanut butter and dill pickle sandwich',
      'Watermelon sprinkled with salt and chili powder',
    ],
    exampleLies: [
      'Oreos dipped in spicy mustard',
      'Mayonnaise on hot fudge sundae',
      'Melted butter on boiled watermelon',
      'Strawberry jam on canned tuna',
    ],
    hint: 'Is it delicious contrast or pure fabrication?',
  },
  {
    id: 'pers-2',
    category: 'personal',
    question: 'What was your absolute dream career when you were 7 years old?',
    exampleTruths: [
      'Professional dinosaur paleontologist',
      'Astronaut walking on Mars',
      'Veterinarian who only treats baby tigers',
      'Secret agent with gadget shoes',
    ],
    exampleLies: [
      'Certified public tax accountant',
      'International corporate supply chain inspector',
      'Municipal water pipe surveyor',
    ],
    hint: 'Childhood imaginations are wild—or suspiciously boring!',
  },
  {
    id: 'pers-3',
    category: 'personal',
    question: 'What is the strangest irrational phobia you have ever had?',
    exampleTruths: [
      'Fear that a shark might swim into the deep end of the public swimming pool',
      'Terrified of antique grandfather clocks ticking in the dark',
      'Scared of walking over sidewalk metal grates fearing they will collapse',
      'Fear of large balloons popping unexpectedly',
    ],
    exampleLies: [
      'Terrified that squirrels are reading my thoughts through window blinds',
      'Scared of the number 14 because it looks too sharp',
      'Fear that my shoelaces will knot into a cobra snake',
    ],
    hint: 'Real fears are relatable yet quirky. Fake ones sound forced.',
  },
  {
    id: 'pers-4',
    category: 'personal',
    question: 'What is a completely useless hidden talent you possess?',
    exampleTruths: [
      'Can name any US state capital in under 2 seconds',
      'Can recite the entire Greek alphabet backwards',
      'Can flip my eyelids inside out effortlessly',
      'Can whistle simultaneously through my nose and mouth',
    ],
    exampleLies: [
      'Can echo-locate objects in a pitch black room by clicking my teeth',
      'Can taste whether tap water was filtered through sand or charcoal',
      'Can tell someone their birthday by feeling their knuckles',
    ],
    hint: 'Party tricks vs supernatural falsehoods.',
  },

  // Creative Prompts
  {
    id: 'cre-1',
    category: 'creative',
    question:
      'If you were exiled to an uninhabited desert island and could only take ONE luxury item, what is it?',
    exampleTruths: [
      'A solar-powered acoustic turntable with my vinyl record collection',
      'An ultra-plush memory foam king-size mattress with silk canopy',
      'A giant canvas kit with infinite oil paints and brushes',
      'A top-tier espresso machine with endless roasted beans',
    ],
    exampleLies: [
      'A decorative cast-iron Victorian street lamp that needs kerosene',
      'A mahogany grandfather clock with lead weights',
      'A collection of marble busts of Roman emperors',
    ],
    hint: 'Desire for comfort vs absurd impractical baggage.',
  },
  {
    id: 'cre-2',
    category: 'creative',
    question: 'Invent a brand-new Olympic sport that should debut in the next Summer Games.',
    exampleTruths: [
      'Extreme Synchronized Trampoline Dodgeball',
      'Urban Parkour Capture the Flag',
      'Downhill Roller-skate Slalom through obstacle courses',
      'High-speed Kayak Polo in white-water rapids',
    ],
    exampleLies: [
      'Competitive Synchronized Microwave Popcorn Sniffing',
      'Blindfolded Ironing on tightropes over swimming pools',
      'High-speed Competitive Origami Folding under heat lamps',
    ],
    hint: 'Could this actually be an Olympic spectacle or is it pure comedy?',
  },
  {
    id: 'cre-3',
    category: 'creative',
    question:
      'What ridiculous house rule would you enforce if you were elected ruler of the world?',
    exampleTruths: [
      'Elevators must always play 80s synth-wave disco instead of boring elevator jazz',
      'All commercial airplanes must give passengers warm chocolate chip cookies on touchdown',
      'Monday mornings are legally classified as weekend until 1:00 PM',
      'Anyone who replies-all unnecessarily must buy donuts for the entire office',
    ],
    exampleLies: [
      'All sidewalks must be paved with yellow bouncy castle rubber',
      'Every citizen must legally wear a pirate hat on rainy Thursdays',
      'Speaking in rhymes is mandatory whenever entering a grocery store',
    ],
    hint: 'Real desires fix daily annoyances; fake laws sound like cartoon decrees.',
  },
  {
    id: 'cre-4',
    category: 'creative',
    question: 'What is a plausible-sounding scientific conspiracy that is completely made up?',
    exampleTruths: [
      'Pigeons in city squares are actually government environmental surveillance drones',
      'The moon landings were filmed on a sound stage by Stanley Kubrick',
      'The Bermuda Triangle is an ancient submerged magnetic pyramid',
    ],
    exampleLies: [
      'Clouds are actually steam generated by underground mole societies roasting potatoes',
      'Gravity was invented in 1687 by Isaac Newton to sell heavy shoes',
      'Trees only grow leaves to camouflage themselves from giant space caterpillars',
    ],
    hint: 'Good conspiracies sound weirdly believable; bad ones are hilarious nonsense.',
  },
];

export function getRandomPrompt(category?: PromptCategory | 'all'): LiePrompt {
  const pool =
    !category || category === 'all'
      ? LIE_PROMPTS
      : LIE_PROMPTS.filter((p) => p.category === category);

  const list = pool.length > 0 ? pool : LIE_PROMPTS;
  return list[Math.floor(Math.random() * list.length)]!;
}
