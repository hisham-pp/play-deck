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

      {content && <GameOverviewSections game={game} content={content} />}

      {footer}
    </div>
  );
}
