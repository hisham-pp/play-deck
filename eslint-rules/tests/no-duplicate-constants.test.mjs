import { RuleTester } from 'eslint';
import { describe, it, afterAll } from 'vitest';
import rule from '../rules/no-duplicate-constants.mjs';

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

ruleTester.run('no-duplicate-constants', rule, {
  valid: [
    {
      code: `
        const A = 'user_id';
        const B = 'project_id';
      `,
      filename: '/home/user/project/packages/core/src/index.ts',
    },
    {
      // Short strings (under minLength 3) are ignored
      code: `
        const a = ',';
        const b = ',';
        const c = ',';
      `,
      filename: '/home/user/project/packages/core/src/index.ts',
    },
    {
      // Import paths are ignored
      code: `
        import { foo } from 'my-module';
        import { bar } from 'my-module';
        import { baz } from 'my-module';
      `,
      filename: '/home/user/project/packages/core/src/index.ts',
    },
    {
      // Ignored strings option
      code: `
        check('utf-8');
        read('utf-8');
        write('utf-8');
      `,
      filename: '/home/user/project/packages/core/src/index.ts',
      options: [{ ignoreStrings: ['utf-8'] }],
    },
  ],
  invalid: [
    {
      code: `
        function test() {
          send('application/json');
          receive('application/json');
          parse('application/json');
        }
      `,
      filename: '/home/user/project/packages/core/src/api.ts',
      options: [{ threshold: 3 }],
      errors: [
        {
          message:
            "Define a constant instead of duplicating this literal 'application/json' 3 times.",
        },
        {
          message:
            "Define a constant instead of duplicating this literal 'application/json' 3 times.",
        },
      ],
    },
  ],
});
