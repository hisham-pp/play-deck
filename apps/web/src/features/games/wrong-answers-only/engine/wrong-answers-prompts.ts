import type { WrongAnswersQuestion } from '../types/wrong-answers.types';

export const WRONG_ANSWERS_PROMPTS: WrongAnswersQuestion[] = [
  {
    id: 'wa-nasa',
    category: 'trivia',
    prompt: 'What does NASA actually stand for?',
    subtext: 'Wrong and hilarious acronyms only.',
    botAnswers: {
      absurd: 'Never Ask Snakes Anything',
      literal: 'North American Sandwich Association',
      punny: 'Need Another Spaceship, Actually',
      conspiracy: 'Not Allowed Space Access',
    },
  },
  {
    id: 'wa-red-button',
    category: 'hypothetical',
    prompt: 'What actually happens if you press the mysterious big red button?',
    subtext: 'Nothing good, probably.',
    botAnswers: {
      absurd: 'Your toast immediately un-toasts itself back into dough.',
      literal: 'A robotic arm hands you a lukewarm receipt for $4.99.',
      punny: 'It dispenses jam because it is a red spread button.',
      conspiracy: 'It reboots the simulation and restores yesterday’s coffee.',
    },
  },
  {
    id: 'wa-cats-purr',
    category: 'absurd',
    prompt: 'Why do domestic cats purr?',
    subtext: 'Biologists have been lying to us.',
    botAnswers: {
      absurd: 'They are downloading encrypted spy software from their home planet.',
      literal: 'Their miniature internal diesel generator needs an oil change.',
      punny: 'Because they are feline fine and purr-fectly tuned.',
      conspiracy:
        'It operates at the exact frequency that hypnotizes humans into buying gourmet tuna.',
    },
  },
  {
    id: 'wa-moon-capital',
    category: 'cosmological',
    prompt: 'What is the official capital city of the Moon?',
    subtext: 'Check your lunar atlas.',
    botAnswers: {
      absurd: 'New Cheddar City in the Mozzarella Crater.',
      literal: 'Armstrong Boulevard, Apartment 4B.',
      punny: 'Crater-ville, located right off Orbit Expressway.',
      conspiracy: 'Area 52, which is where Area 51 sends its surplus aliens.',
    },
  },
  {
    id: 'wa-quantum-physics',
    category: 'science',
    prompt: 'Explain quantum physics in one simple sentence.',
    subtext: 'Albert Einstein would shed a tear.',
    botAnswers: {
      absurd: 'If you look at the sandwich it is turkey, but when you look away it is a hamster.',
      literal: 'Tiny marbles bounce against each other until someone turns off the light.',
      punny: 'It is a matter of uncertainty that particles really wave goodbye.',
      conspiracy: 'Math invented by scientists so they never have to admit they lost their keys.',
    },
  },
  {
    id: 'wa-dinosaur-extinction',
    category: 'science',
    prompt: 'What REALLY caused the extinction of the dinosaurs?',
    subtext: 'Forget the asteroid theory.',
    botAnswers: {
      absurd: 'T-Rex tried to play the accordion but their tiny arms couldn’t reach both sides.',
      literal: 'They all forgot where they parked their prehistoric minivans.',
      punny: 'They couldn’t pay their fossil fuel taxes and went dino-bankrupt.',
      conspiracy: 'They built spaceships and moved to Jupiter to avoid the Ice Age.',
    },
  },
  {
    id: 'wa-bermuda-triangle',
    category: 'hypothetical',
    prompt: 'Where do all the lost ships in the Bermuda Triangle actually end up?',
    subtext: 'Naval mystery solved.',
    botAnswers: {
      absurd: 'In a giant bathtub in a parallel universe toddler’s bathroom.',
      literal: 'Behind the cushions of the cosmic sofa along with lost guitar picks.',
      punny: 'At the bottom of the ocean’s Bermuda shorts.',
      conspiracy: 'They were recruited into an elite underwater synchronized swimming league.',
    },
  },
  {
    id: 'wa-microwave-beeps',
    category: 'absurd',
    prompt: 'Why does the microwave beep three times when it finishes?',
    subtext: 'Think deeper.',
    botAnswers: {
      absurd: 'To alert the nocturnal goblins that your burrito sacrifice is steaming hot.',
      literal: 'It forgot what it was saying after the second beep.',
      punny: 'To beep-lieve in your culinary ambitions.',
      conspiracy: 'It signals nearby satellites that someone is reheating pasta at 2 AM.',
    },
  },
  {
    id: 'wa-wifi-invisible',
    category: 'science',
    prompt: 'What would Wi-Fi signals look like if we could see them?',
    subtext: 'Pure visual imagination.',
    botAnswers: {
      absurd: 'Glowing neon noodles furiously wrestling in mid-air.',
      literal: 'Invisible tiny pigeons frantically throwing letters through your walls.',
      punny: 'Webs of dad jokes spinning around router hubs.',
      conspiracy: 'Fiber-optic spider legs holding up the ceiling.',
    },
  },
  {
    id: 'wa-statue-liberty',
    category: 'trivia',
    prompt: 'What is inside the Statue of Liberty’s torch?',
    subtext: 'New York history unsealed.',
    botAnswers: {
      absurd: 'A very confused family of French raccoons roasting marshmallows.',
      literal: 'Just one standard AAA battery and an incandescent nightlight bulb.',
      punny: 'A giant matchstick waiting for a really windy day.',
      conspiracy: 'The emergency override lever to turn Manhattan upside down.',
    },
  },
  {
    id: 'wa-clouds-made-of',
    category: 'cosmological',
    prompt: 'What are clouds actually made of?',
    subtext: 'Meteorologists are hiding the truth.',
    botAnswers: {
      absurd: 'Discarded cotton candy from angels who were on a strict keto diet.',
      literal: 'Mashed potatoes that were boiled at very high altitudes.',
      punny: 'Condensed moisture with high cirrus-ness and low cumulus-tence.',
      conspiracy: 'Smoke screens deployed by air traffic control to hide UFO traffic jams.',
    },
  },
  {
    id: 'wa-traffic-lights',
    category: 'absurd',
    prompt: 'Who controls traffic lights and why do they turn red when you are in a rush?',
    subtext: 'There is a secret department.',
    botAnswers: {
      absurd: 'A grumpy hamster spinning a three-colored roulette wheel in city hall.',
      literal: 'A sensor that detects fear and smells your tardiness.',
      punny: 'A red-y or not machine that refuses to amber you any grace.',
      conspiracy: 'It is a psychological study funded by coffee cup holders.',
    },
  },
  {
    id: 'wa-pigeons-head-bob',
    category: 'absurd',
    prompt: 'Why do pigeons constantly bob their heads while walking?',
    subtext: 'Ornithology debunked.',
    botAnswers: {
      absurd: 'They are listening to aggressive underground French techno through tiny earpieces.',
      literal: 'Their neck suspension has not been serviced since 1998.',
      punny: 'They are nodding in agreement with all the breadcrumb gossip.',
      conspiracy: 'They are recalibrating their optical surveillance cameras.',
    },
  },
  {
    id: 'wa-great-wall-china',
    category: 'trivia',
    prompt: 'Why was the Great Wall of China really built?',
    subtext: 'Ancient secrets revealed.',
    botAnswers: {
      absurd: 'To stop the giant panda bowling league from knocking over small villages.',
      literal: 'Because the emperor really hated neighbors borrowing his lawnmower.',
      punny: 'To make sure their border security had great wall-to-wall coverage.',
      conspiracy: 'It was the track for the world’s very first roller coaster.',
    },
  },
  {
    id: 'wa-black-holes',
    category: 'cosmological',
    prompt: 'What happens at the exact center of a black hole?',
    subtext: 'Astrophysics rewritten.',
    botAnswers: {
      absurd: 'You find all the missing socks that ever vanished from washing machines.',
      literal: 'A loading screen that has been stuck on 99% for 4 billion years.',
      punny: 'Gravity pulls an all-nighter and breaks the cosmic horizon.',
      conspiracy: 'A 24-hour convenience store operated by celestial cashiers.',
    },
  },
  {
    id: 'wa-iceberg-titanic',
    category: 'pop_culture',
    prompt: 'Where is the iceberg that hit the Titanic today?',
    subtext: 'Maritime detectives investigate.',
    botAnswers: {
      absurd: 'Serving as an ice cube in an excessively large cocktail at a Miami resort.',
      literal: 'Serving 25 to life in a high-security refrigerated warehouse in Iceland.',
      punny: 'It melted under intense cross-examination in maritime court.',
      conspiracy: 'It retired under an alias and lives in Antarctica doing standup comedy.',
    },
  },
];

export function getRandomQuestion(excludeIds: string[] = []): WrongAnswersQuestion {
  const pool = WRONG_ANSWERS_PROMPTS.filter((q) => !excludeIds.includes(q.id));
  if (pool.length === 0) {
    return WRONG_ANSWERS_PROMPTS[Math.floor(Math.random() * WRONG_ANSWERS_PROMPTS.length)]!;
  }
  return pool[Math.floor(Math.random() * pool.length)]!;
}
