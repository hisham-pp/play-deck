import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WEB_SRC = path.resolve('apps/web/src');

export async function resolve(specifier, context, nextResolve) {
  let target = specifier;
  if (specifier.startsWith('@/')) {
    const subPath = specifier.slice(2);
    target = pathToFileURL(path.join(WEB_SRC, subPath)).href;
  }

  try {
    return await nextResolve(target, context);
  } catch (err) {
    const baseUrls = [target];
    if (err && typeof err === 'object' && err.url) {
      baseUrls.push(err.url);
    }

    for (const base of baseUrls) {
      const candidates = [base + '.ts', base + '.tsx', base + '/index.ts', base + '/index.tsx'];
      for (const candidate of candidates) {
        try {
          return await nextResolve(candidate, context);
        } catch {
          // continue
        }
      }
    }
    throw err;
  }
}
