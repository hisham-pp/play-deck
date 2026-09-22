export const TELEPHONE_PROMPTS: string[] = [
  'A giraffe ordering a double espresso at Starbucks',
  'An astronaut wrestling a giant taco in zero gravity',
  'A penguin learning to skateboard on an iceberg',
  'A secret agent disguised as a potted houseplant',
  'A dinosaur trying to iron a tuxedo with tiny arms',
  'A cat running for mayor of a small town',
  'A robot chef accidentally baking a birthday cake out of screws',
  'A chameleon having an identity crisis in a disco room',
  'A wizard using a vacuum cleaner instead of a flying broom',
  'A pirate sailing a bathtub down a city river',
  'A squirrel preparing for a high-stakes bank heist',
  'An octopus juggling eight flaming marshmallows',
  'A bear trying to assemble IKEA furniture in the woods',
  'A snowman surfing a tropical wave wearing sunglasses',
  'A superhero whose only power is making toast appear',
  'A vampire attending a garlic festival by mistake',
  'A dog wearing glasses pretending to do tax returns',
  'A monkey pilot attempting a loop-de-loop in a biplane',
  'A frog meditating on a floating pizza slice',
  'A knight fighting a giant rubber duck in a moat',
];

export function getRandomTelephonePrompt(excludeList: string[] = []): string {
  const pool = TELEPHONE_PROMPTS.filter((p) => !excludeList.includes(p));
  if (pool.length === 0) {
    return TELEPHONE_PROMPTS[Math.floor(Math.random() * TELEPHONE_PROMPTS.length)]!;
  }
  return pool[Math.floor(Math.random() * pool.length)]!;
}
