import { RuleTester } from 'eslint';
import { describe, it, afterAll } from 'vitest';
import rule from '../rules/enforce-file-naming.mjs';

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

ruleTester.run('enforce-file-naming', rule, {
  valid: [
    {
      code: 'export const a = 1;',
      filename: '/home/user/project/packages/core/src/scanner/classifier.ts',
    },
    {
      code: 'export const b = 2;',
      filename: '/home/user/project/packages/core/src/index.ts',
    },
    {
      code: 'export const c = 3;',
      filename: '/home/user/project/packages/search/src/bm25-search.ts',
    },
    {
      code: 'export const d = 4;',
      filename: '/home/user/project/packages/core/test/PhaseTest.ts', // test outside src/ is ignored
    },
  ],
  invalid: [
    {
      code: 'export const a = 1;',
      filename: '/home/user/project/packages/core/src/scanner/MyClassifier.ts',
      errors: [
        {
          message:
            "Filename 'MyClassifier.ts' must be lowercase kebab-case (e.g., 'my-classifier.ts') to prevent cross-platform file case issues.",
        },
      ],
    },
    {
      code: 'export const b = 2;',
      filename: '/home/user/project/packages/search/src/semanticSearch.ts',
      errors: [
        {
          message:
            "Filename 'semanticSearch.ts' must be lowercase kebab-case (e.g., 'semantic-search.ts') to prevent cross-platform file case issues.",
        },
      ],
    },
  ],
});
