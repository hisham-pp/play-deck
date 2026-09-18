import { BookOpen, Gamepad2, HelpCircle, Keyboard, Lightbulb, ListOrdered } from 'lucide-react';
import React from 'react';
import type { GameContent, GameDefinition } from '@playdeck/game-types';

const ICON_CLASS = 'w-5 h-5';

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Every content block on a game page is a real <section> with a heading and an
 * anchor id, rendered on the server. Nothing here is hidden behind a tab, so
 * crawlers and screen readers receive the full page in one pass.
 */
function Section({ id, title, icon, children }: SectionProps) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-surface-border bg-surface-raised p-6 md:p-8 scroll-mt-24"
    >
      <h2 className="flex items-center gap-2.5 text-lg md:text-xl font-black font-display text-deck-950 dark:text-white mb-5">
        <span className="text-amber-500">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function AboutSection({ game, content }: { game: GameDefinition; content: GameContent }) {
  return (
    <Section id="about" title={`About ${game.name}`} icon={<BookOpen className={ICON_CLASS} />}>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-deck-600 dark:text-deck-300">
        {content.overview.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}

function HowToPlaySection({ game, content }: { game: GameDefinition; content: GameContent }) {
  if (!content.howToPlay.length) return null;

  return (
    <Section
      id="how-to-play"
      title={`How to play ${game.name}`}
      icon={<ListOrdered className={ICON_CLASS} />}
    >
      <ol className="flex flex-col gap-3">
        {content.howToPlay.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 p-4 rounded-xl bg-surface-overlay border border-surface-border"
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 font-black text-xs flex items-center justify-center font-display">
              {index + 1}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-deck-900 dark:text-white">{step.title}</h3>
              <p className="text-xs leading-relaxed text-deck-500">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function RulesSection({ content }: { content: GameContent }) {
  if (!content.rules.length) return null;

  return (
    <Section id="rules" title="Rules & objectives" icon={<Gamepad2 className={ICON_CLASS} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {content.rules.map((rule) => (
          <div
            key={rule.title}
            className="p-4 rounded-xl bg-surface-overlay border border-surface-border"
          >
            <h3 className="text-sm font-bold text-deck-900 dark:text-white mb-1">{rule.title}</h3>
            <p className="text-xs leading-relaxed text-deck-500">{rule.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ControlsSection({ game, content }: { game: GameDefinition; content: GameContent }) {
  if (!content.controls.length) return null;

  return (
    <Section
      id="controls"
      title={`${game.name} controls`}
      icon={<Keyboard className={ICON_CLASS} />}
    >
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {content.controls.map((control) => (
          <div
            key={control.key}
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-surface-overlay border border-surface-border"
          >
            <dt className="font-mono text-[11px] font-bold px-2 py-1 rounded bg-surface-base border border-surface-border text-deck-900 dark:text-white whitespace-nowrap">
              {control.key}
            </dt>
            <dd className="text-xs text-deck-500 text-right">{control.action}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function TipsSection({ game, content }: { game: GameDefinition; content: GameContent }) {
  if (!content.tips.length) return null;

  return (
    <Section
      id="tips"
      title={`${game.name} tips & strategy`}
      icon={<Lightbulb className={ICON_CLASS} />}
    >
      <ul className="flex flex-col gap-2.5">
        {content.tips.map((tip) => (
          <li
            key={tip.slice(0, 40)}
            className="flex gap-3 text-xs leading-relaxed text-deck-600 dark:text-deck-300"
          >
            <span aria-hidden className="text-amber-500 font-black leading-5">
              ✦
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function FaqSection({ game, content }: { game: GameDefinition; content: GameContent }) {
  if (!content.faq.length) return null;

  return (
    <Section id="faq" title={`${game.name} FAQ`} icon={<HelpCircle className={ICON_CLASS} />}>
      {/* <details> keeps the answers in the HTML while still collapsing them visually. */}
      <div className="flex flex-col gap-2">
        {content.faq.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl bg-surface-overlay border border-surface-border overflow-hidden"
          >
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-deck-900 dark:text-white">{item.question}</h3>
              <span
                aria-hidden
                className="text-amber-500 text-lg leading-none transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-4 pb-4 text-xs leading-relaxed text-deck-500">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

interface GameOverviewSectionsProps {
  game: GameDefinition;
  content: GameContent;
}

export function GameOverviewSections({ game, content }: GameOverviewSectionsProps) {
  return (
    <div className="flex flex-col gap-6">
      <AboutSection game={game} content={content} />
      <HowToPlaySection game={game} content={content} />
      <RulesSection content={content} />
      <ControlsSection game={game} content={content} />
      <TipsSection game={game} content={content} />
      <FaqSection game={game} content={content} />
    </div>
  );
}
