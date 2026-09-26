const DEFAULT_BASE_PATH = '/games';
const DEFAULT_EXT = 'svg';

export interface GameAssetOptions {
  /** Explicit icon URL to override the convention */
  thumbnailUrl?: string;
  /** Explicit banner/cover URL to override the convention */
  bannerUrl?: string;
  /** Custom file extension for the icon (default: 'svg') */
  iconExt?: 'svg' | 'png' | 'webp' | string;
  /** Custom file extension for the banner (default: 'svg') */
  bannerExt?: 'svg' | 'png' | 'webp' | 'jpg' | string;
  /** Base asset path prefix (default: '/games') */
  basePath?: string;
}

export interface ResolvedGameAssets {
  thumbnailUrl: string;
  bannerUrl: string;
}

/**
 * Resolves the canonical thumbnail / icon URL for a game given its ID or slug.
 * Default pattern: `/games/${gameId}/icon.svg`
 */
export function resolveGameIcon(
  gameId: string,
  ext: string = DEFAULT_EXT,
  basePath: string = DEFAULT_BASE_PATH,
): string {
  const cleanId = gameId.trim().toLowerCase();
  const cleanExt = ext.replace(/^\./, '');
  return `${basePath}/${cleanId}/icon.${cleanExt}`;
}

/**
 * Resolves the canonical banner / cover URL for a game given its ID or slug.
 * Default pattern: `/games/${gameId}/cover.svg`
 */
export function resolveGameBanner(
  gameId: string,
  ext: string = DEFAULT_EXT,
  basePath: string = DEFAULT_BASE_PATH,
): string {
  const cleanId = gameId.trim().toLowerCase();
  const cleanExt = ext.replace(/^\./, '');
  return `${basePath}/${cleanId}/cover.${cleanExt}`;
}

/**
 * Resolves both thumbnail and banner URLs for a game with support for explicit overrides.
 */
export function resolveGameAssets(gameId: string, options?: GameAssetOptions): ResolvedGameAssets {
  const basePath = options?.basePath ?? DEFAULT_BASE_PATH;
  const iconExt = options?.iconExt ?? DEFAULT_EXT;
  const bannerExt = options?.bannerExt ?? DEFAULT_EXT;

  return {
    thumbnailUrl: options?.thumbnailUrl ?? resolveGameIcon(gameId, iconExt, basePath),
    bannerUrl: options?.bannerUrl ?? resolveGameBanner(gameId, bannerExt, basePath),
  };
}
