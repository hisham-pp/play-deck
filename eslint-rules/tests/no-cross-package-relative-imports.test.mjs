import { RuleTester } from 'eslint';
import { describe, it, afterAll } from 'vitest';
import rule from '../rules/no-cross-package-relative-imports.mjs';

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

ruleTester.run('no-cross-package-relative-imports', rule, {
  valid: [
    {
      code: "import { FileInfo } from '../types/index.js';",
      filename: '/home/user/project/packages/core/src/scanner/index.ts',
    },
    {
      code: "import { DatabaseManager } from '@playdeck/database';",
      filename: '/home/user/project/packages/core/src/index.ts',
    },
    {
      code: "export * from './types/index.js';",
      filename: '/home/user/project/packages/core/src/index.ts',
    },
  ],
  invalid: [
    {
      code: "import { DatabaseManager } from '../../database/src/index.js';",
      filename: '/home/user/project/packages/core/src/index.ts',
      errors: [
        {
          message:
            "Cross-package relative import '../../database/src/index.js' is forbidden. Import from the workspace package '@playdeck/database' instead.",
        },
      ],
    },
    {
      code: "export { searchEngine } from '../../../../search/src/index.js';",
      filename: '/home/user/project/packages/core/src/sub/dir/test.ts',
      errors: [
        {
          message:
            "Cross-package relative import '../../../../search/src/index.js' is forbidden. Import from the workspace package '@playdeck/search' instead.",
        },
      ],
    },
  ],
});
