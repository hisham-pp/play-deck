/**
 * Automatically formats a human-readable game title from a kebab-case ID.
 * Example: 'ball-bounce' -> 'Ball Bounce', 'anagram-sprint' -> 'Anagram Sprint', '2048' -> '2048'
 */
export function formatGameName(id: string): string {
  if (!id) return '';
  return id
    .trim()
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
