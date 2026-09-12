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
    try {
      return await nextResolve(target + '.ts', context);
    } catch {
      try {
        return await nextResolve(target + '/index.ts', context);
      } catch {
        // Throw original error
      }
    }
    throw err;
  }
}
