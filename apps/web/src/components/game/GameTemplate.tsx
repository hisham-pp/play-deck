import React from 'react';
import type { GameContent, GameDefinition } from '@playdeck/game-types';
import { GameOverviewSections } from './GameOverviewSections';
import { GameTemplateHeader } from './GameTemplateHeader';

export interface GameTemplateProps {
  game: GameDefinition;
  /** Editorial content for this game. Omit to render the header only. */
  content?: GameContent;
  /** Destination of the primary call to action. */
  playHref: string;
  children?: React.ReactNode;
  backHref?: string;
  /** Rendered after the content sections — related games, further links. */
  footer?: React.ReactNode;
}

/**
 * Server-rendered shell shared by every game's dedicated page. Content arrives
 * as data from `data/games/content`, so a new game needs no new page code.
 */
export function GameTemplate({
  game,
  content,
  playHref,
  children,
  backHref,
  footer,
}: GameTemplateProps) {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <GameTemplateHeader
        game={game}
        playHref={playHref}
        backHref={backHref}
        tagline={content?.tagline}
      />

      {children && (
        <section className="relative rounded-2xl border border-surface-border bg-surface-raised overflow-hidden shadow-sm">
          <div className="min-h-[380px] flex flex-col items-center justify-center p-4 md:p-8 bg-surface-base/40 arcade-texture">
            {children}
          </div>
        </section>
      )}

      {content ? (
        <GameOverviewSections game={game} content={content} />
      ) : (
        /* Games still in development have no content module yet. Show what the
           catalog knows so the page is never an empty shell. */
        <section
          id="about"
          className="rounded-2xl border border-surface-border bg-surface-raised p-6 md:p-8"
        >
          <h2 className="text-lg md:text-xl font-black font-display text-deck-950 dark:text-white mb-4">
            About {game.name}
          </h2>
          <p className="text-sm leading-relaxed text-deck-600 dark:text-deck-300">
            {game.description}
          </p>
          <p className="mt-4 text-xs text-deck-500">
            {game.name} is still in development. Full rules, controls and strategy notes land here
            when it ships.
          </p>
        </section>
      )}

      {footer}
    </div>
  );
}
