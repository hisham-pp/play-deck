import { RuleTester } from 'eslint';
import { describe, it, afterAll } from 'vitest';
import rule from '../rules/cognitive-complexity.mjs';

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

ruleTester.run('cognitive-complexity', rule, {
  valid: [
    {
      code: `
        function simple(a, b) {
          if (a > 0) {
            return b;
          }
          return 0;
        }
      `,
      options: [{ max: 5 }],
    },
    {
      code: `
        const add = (a, b) => a + b;
      `,
      options: [{ max: 1 }],
    },
  ],
  invalid: [
    {
      code: `
        function deeplyNested(a, b, c, d) {
          if (a) {
            if (b) {
              for (let i = 0; i < c; i++) {
                if (d) {
                  return true;
                }
              }
            }
          }
          return false;
        }
      `,
      options: [{ max: 5 }],
      errors: [
        {
          message:
            "Function 'deeplyNested' has a cognitive complexity of 10, exceeding maximum of 5. Refactor into simpler, smaller functions.",
        },
      ],
    },
  ],
});
