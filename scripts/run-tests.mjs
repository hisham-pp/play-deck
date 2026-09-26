import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const searchRoots = [
  path.resolve('apps/web/src'),
  path.resolve('packages/game-data/src'),
  path.resolve('packages/game-core/src'),
  path.resolve('packages/shared/src'),
];

const files = [];

function collect(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collect(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }
}

for (const root of searchRoots) {
  collect(root);
}
files.sort();

const result = spawnSync(
  process.execPath,
  ['--import', './scripts/test-register.mjs', '--test', ...files],
  {
    stdio: 'inherit',
    env: process.env,
  },
);

process.exit(result.status ?? 1);
