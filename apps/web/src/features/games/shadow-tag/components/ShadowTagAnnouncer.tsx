'use client';

/**
 * Shadow Tag hides almost everything on purpose, so the things that *are*
 * announced — the mark changing hands, the round opening and closing — have to
 * reach assistive tech as text rather than as a flicker on a canvas.
 */
export function ShadowTagAnnouncer({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
