import { RuleTester } from 'eslint';
import { describe, it, afterAll } from 'vitest';
import rule from '../rules/no-console-in-libraries.mjs';

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

ruleTester.run('no-console-in-libraries', rule, {
  valid: [
    {
      code: "console.warn('warning message');",
      filename: '/home/user/project/packages/core/src/index.ts',
    },
    {
      code: "console.error('error message');",
      filename: '/home/user/project/packages/core/src/index.ts',
    },
    {
      code: "console.log('CLI output');",
      filename: '/home/user/project/packages/cli/src/index.ts',
    },
    {
      code: "console.log('Test output');",
      filename: '/home/user/project/packages/core/test/phase.test.ts',
    },
  ],
  invalid: [
    {
      code: "console.log('Debugging indexing:');",
      filename: '/home/user/project/packages/core/src/scanner/index.ts',
      errors: [
        {
          message:
            "Unexpected 'console.log' in library package. Library code should use structured logging or return data instead of stdout/stderr pollution.",
        },
      ],
    },
    {
      code: "console.debug('Cache hit');",
      filename: '/home/user/project/packages/database/src/storage.ts',
      errors: [
        {
          message:
            "Unexpected 'console.debug' in library package. Library code should use structured logging or return data instead of stdout/stderr pollution.",
        },
      ],
    },
  ],
});
