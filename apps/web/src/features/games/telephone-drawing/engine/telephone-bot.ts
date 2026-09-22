import type {
  BotDrawingStyle,
  TelephoneChainStep,
  TelephonePlayer,
} from '../types/telephone-drawing.types';

export const BOT_TEMPLATES: Array<{
  name: string;
  avatar: string;
  style: BotDrawingStyle;
}> = [
  { name: 'Doodle Dan', avatar: '✏️', style: 'doodler' },
  { name: 'Picasso Pete', avatar: '🎨', style: 'picasso' },
  { name: 'Stickman Sam', avatar: '🧍', style: 'stickman' },
  { name: 'Abstract Amy', avatar: '🌀', style: 'abstract' },
];

/** Generates a whimsical procedural SVG sketch data URL */
export function generateBotDrawing(
  style: BotDrawingStyle = 'doodler',
  promptText?: string,
): string {
  const pLower = promptText?.toLowerCase() ?? '';

  let svgElements: string;

  if (pLower.includes('giraffe') || style === 'stickman') {
    // Yellow tall stick giraffe with spots
    svgElements = `
      <rect width="400" height="400" fill="#141c2e"/>
      <circle cx="200" cy="100" r="30" fill="#f59e0b" stroke="#d97706" stroke-width="4"/>
      <line x1="200" y1="130" x2="200" y2="280" stroke="#f59e0b" stroke-width="16" stroke-linecap="round"/>
      <circle cx="200" cy="180" r="8" fill="#b45309"/>
      <circle cx="200" cy="230" r="8" fill="#b45309"/>
      <line x1="200" y1="280" x2="160" y2="360" stroke="#f59e0b" stroke-width="12" stroke-linecap="round"/>
      <line x1="200" y1="280" x2="240" y2="360" stroke="#f59e0b" stroke-width="12" stroke-linecap="round"/>
      <circle cx="190" cy="95" r="4" fill="#000"/>
      <circle cx="210" cy="95" r="4" fill="#000"/>
      <path d="M 190 115 Q 200 125 210 115" stroke="#000" stroke-width="3" fill="none"/>
    `;
  } else if (pLower.includes('cat') || pLower.includes('coffee') || style === 'doodler') {
    // Whimsical doodle cup with steam / cat ears
    svgElements = `
      <rect width="400" height="400" fill="#141c2e"/>
      <rect x="130" y="160" width="140" height="150" rx="20" fill="#38bdf8" stroke="#0284c7" stroke-width="6"/>
      <path d="M 270 190 C 310 190, 310 270, 270 270" stroke="#0284c7" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 170 140 Q 180 110 170 80" stroke="#94a3b8" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M 200 140 Q 210 110 200 80" stroke="#94a3b8" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M 230 140 Q 240 110 230 80" stroke="#94a3b8" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="175" cy="220" r="5" fill="#000"/>
      <circle cx="225" cy="220" r="5" fill="#000"/>
      <path d="M 190 235 Q 200 245 210 235" stroke="#000" stroke-width="4" fill="none"/>
    `;
  } else if (pLower.includes('astronaut') || pLower.includes('space') || style === 'abstract') {
    // Retro alien spaceship
    svgElements = `
      <rect width="400" height="400" fill="#141c2e"/>
      <circle cx="200" cy="180" r="50" fill="#a855f7" stroke="#7e22ce" stroke-width="6"/>
      <ellipse cx="200" cy="220" rx="120" ry="40" fill="#10b981" stroke="#047857" stroke-width="8"/>
      <circle cx="140" cy="220" r="10" fill="#facc15"/>
      <circle cx="200" cy="220" r="10" fill="#facc15"/>
      <circle cx="260" cy="220" r="10" fill="#facc15"/>
      <circle cx="185" cy="170" r="6" fill="#000"/>
      <circle cx="215" cy="170" r="6" fill="#000"/>
    `;
  } else {
    // Picasso colorful geometric collage
    svgElements = `
      <rect width="400" height="400" fill="#141c2e"/>
      <circle cx="160" cy="160" r="70" fill="#f43f5e" opacity="0.8"/>
      <polygon points="200,80 320,240 160,280" fill="#eab308" opacity="0.8"/>
      <rect x="180" y="180" width="120" height="120" rx="10" fill="#06b6d4" opacity="0.8"/>
      <circle cx="200" cy="200" r="20" fill="#fff" stroke="#000" stroke-width="4"/>
      <line x1="80" y1="320" x2="320" y2="80" stroke="#a855f7" stroke-width="8"/>
    `;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${svgElements}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export function generateBotDescription(
  previousStep: TelephoneChainStep | undefined,
  initialPhrase?: string,
): string {
  if (!previousStep) {
    return initialPhrase ?? 'A mysterious unidentified masterpiece';
  }

  const guesses = [
    'A happy giraffe drinking iced coffee on a sunny afternoon',
    'A neon space monster holding a cup of tea',
    'An alien spaceship hovering over an enchanted geometric forest',
    'A dancing robot having a party in the clouds',
    'A confused dinosaur posing for modern art museum',
  ];

  return guesses[Math.floor(Math.random() * guesses.length)]!;
}

export function generateBotMutationVote(
  bot: TelephonePlayer,
  steps: TelephoneChainStep[],
): number | null {
  const eligible = steps.filter((s) => s.authorId !== bot.id);
  if (eligible.length === 0) return null;

  // Pick random eligible step
  const chosen = eligible[Math.floor(Math.random() * eligible.length)]!;
  return chosen.stepIndex;
}
