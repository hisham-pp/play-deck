'use client';

/**
 * The noise meter and the giant's mood are the whole game, and both are drawn
 * rather than written. This publishes the same information as text so it reaches
 * assistive tech instead of living only in pixels.
 */
export function GiantAnnouncer({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
