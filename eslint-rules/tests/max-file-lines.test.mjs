import { RuleTester } from 'eslint';
import { describe, it, afterAll } from 'vitest';
import rule from '../rules/max-file-lines.mjs';

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

ruleTester.run('max-file-lines', rule, {
  valid: [
    {
      code: 'const a = 1;\nconst b = 2;\n',
      filename: '/home/user/project/packages/core/src/index.ts',
      options: [{ max: 5 }],
    },
    {
      // Blank lines and comments are ignored by default
      code: '// Comment line\n\nconst a = 1;\n/* multi\nline\ncomment */\nconst b = 2;\n',
      filename: '/home/user/project/packages/core/src/index.ts',
      options: [{ max: 3 }],
    },
    {
      // Non-ts files are ignored
      code: 'line1\nline2\nline3\nline4\nline5\nline6\n',
      filename: '/home/user/project/README.md',
      options: [{ max: 2 }],
    },
  ],
  invalid: [
    {
      code: 'const a = 1;\nconst b = 2;\nconst c = 3;\n',
      filename: '/home/user/project/packages/core/src/index.ts',
      options: [{ max: 2 }],
      errors: [
        {
          message:
            'File has 3 lines of code, exceeding maximum limit of 2 lines. Split this file into smaller, focused modules.',
        },
      ],
    },
  ],
});
