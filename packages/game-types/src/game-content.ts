/**
 * Long-form, per-game editorial content that powers each game's dedicated
 * overview page. Kept separate from `GameDefinition` so catalog payloads stay
 * small: the catalog only ever needs the definition, while a single game page
 * pulls in its own content module.
 */

export interface GameSeoMeta {
  /** Overrides the `<title>`. Keep under ~60 chars. */
  title: string;
  /** Overrides the meta description. Aim for 140-160 chars. */
  description: string;
  /** Additional long-tail keywords merged with the definition's tags. */
  keywords: string[];
}

export interface GameHowToStep {
  title: string;
  description: string;
}

export interface GameRuleItem {
  title: string;
  description: string;
}

export interface GameControlItem {
  key: string;
  action: string;
}

export interface GameFaqItem {
  question: string;
  answer: string;
}

export interface GameContent {
  /** Matches `GameDefinition.id`. */
  id: string;
  seo: GameSeoMeta;
  /** One-line hook rendered under the H1. */
  tagline: string;
  /** Crawlable prose paragraphs. First paragraph doubles as the lede. */
  overview: string[];
  howToPlay: GameHowToStep[];
  rules: GameRuleItem[];
  controls: GameControlItem[];
  /** Strategy notes — strong long-tail search surface. */
  tips: string[];
  faq: GameFaqItem[];
}
