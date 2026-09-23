import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve('apps/web/src');
const files = [];

function collect(dir) {
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

collect(rootDir);
files.sort();

const result = spawnSync(process.execPath, ['--import', './scripts/test-register.mjs', '--test', ...files], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
