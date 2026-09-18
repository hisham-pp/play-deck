import React from 'react';

interface JsonLdProps {
  /** One or more schema.org objects. Nullish entries are skipped. */
  schema: Array<Record<string, unknown> | null | undefined>;
}

/**
 * Server-rendered JSON-LD. Emitted as a single array so crawlers parse one
 * payload per page instead of several competing blocks.
 */
export function JsonLd({ schema }: JsonLdProps) {
  const graph = schema.filter(Boolean);
  if (!graph.length) return null;

  return (
    <script
      type="application/ld+json"
      // Schema objects are authored in-repo, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
