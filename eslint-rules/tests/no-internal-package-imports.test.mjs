import { RuleTester } from 'eslint';
import { describe, it, afterAll } from 'vitest';
import rule from '../rules/no-internal-package-imports.mjs';

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

ruleTester.run('no-internal-package-imports', rule, {
  valid: [
    {
      code: "import { FileInfo } from '@playdeck/core';",
      filename: '/home/user/project/packages/cli/src/index.ts',
    },
    {
      code: "import { DatabaseManager } from '@playdeck/database';",
      filename: '/home/user/project/packages/sdk/src/index.ts',
    },
    {
      code: "import express from 'express';",
      filename: '/home/user/project/packages/sdk/src/index.ts',
    },
  ],
  invalid: [
    {
      code: "import { RepositoryScanner } from '@playdeck/core/src/scanner/index.js';",
      filename: '/home/user/project/packages/cli/src/index.ts',
      errors: [
        {
          message:
            "Deep import '@playdeck/core/src/scanner/index.js' is forbidden. Import from the package root ('@playdeck/core') or documented public subpath export instead.",
        },
      ],
    },
    {
      code: "import { Chunk } from '@playdeck/core/dist/chunker/index.js';",
      filename: '/home/user/project/packages/search/src/index.ts',
      errors: [
        {
          message:
            "Deep import '@playdeck/core/dist/chunker/index.js' is forbidden. Import from the package root ('@playdeck/core') or documented public subpath export instead.",
        },
      ],
    },
  ],
});
