/**
 * Single source of truth for absolute URLs used in canonicals, sitemaps,
 * Open Graph tags and JSON-LD. Everything that needs a fully-qualified URL
 * must go through here so a domain change is a one-line edit.
 */

export const SITE_NAME = 'PlayDeck';

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://playdeck.gg').replace(
  /\/+$/,
  '',
);

export const DEFAULT_OG_IMAGE = '/images/og-image.png';

/** Resolves a site-relative path to an absolute URL. Absolute input passes through. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Canonical overview page for a game. Always slug-based, never id-based. */
export function gameOverviewPath(slug: string): string {
  return `/games/${slug}`;
}

/** Session launcher for a game. */
export function gamePlayPath(slug: string): string {
  return `/play/${slug}`;
}
