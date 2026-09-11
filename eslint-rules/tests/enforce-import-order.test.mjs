import { RuleTester } from 'eslint';
import { describe, it, afterAll } from 'vitest';
import rule from '../rules/enforce-import-order.mjs';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.afterAll = afterAll;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

ruleTester.run('enforce-import-order', rule, {
  valid: [
    {
      code: `
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import express from 'express';
import { DatabaseManager } from '@playdeck/database';
import { helper } from '../helper.js';
import { local } from './local.js';
      `,
    },
    {
      // Single import is always valid
      code: "import { a } from './a.js';",
    },
    {
      // Already alphabetized within group
      code: `
import { a } from './a.js';
import { b } from './b.js';
      `,
    },
  ],
  invalid: [
    {
      code: `import { local } from './local.js';
import * as fs from 'node:fs';`,
      output: `import * as fs from 'node:fs';
import { local } from './local.js';`,
      errors: [
        {
          message:
            "Import './local.js' is out of order. Expected: Node built-ins -> External -> Workspace (@playdeck/*) -> Parent (../) -> Sibling (./).",
        },
      ],
    },
    {
      code: `import { b } from './b.js';
import { a } from './a.js';`,
      output: `import { a } from './a.js';
import { b } from './b.js';`,
      errors: [
        {
          message:
            "Import './b.js' is out of order. Expected: Node built-ins -> External -> Workspace (@playdeck/*) -> Parent (../) -> Sibling (./).",
        },
      ],
    },
    {
      code: `import { DatabaseManager } from '@playdeck/database';
import express from 'express';`,
      output: `import express from 'express';
import { DatabaseManager } from '@playdeck/database';`,
      errors: [
        {
          message:
            "Import '@playdeck/database' is out of order. Expected: Node built-ins -> External -> Workspace (@playdeck/*) -> Parent (../) -> Sibling (./).",
        },
      ],
    },
  ],
});
