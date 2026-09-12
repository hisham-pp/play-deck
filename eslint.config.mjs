import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import repoRulesPlugin from './eslint-rules/index.mjs';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      '**/*.log',
      '**/tmp/**',
      '**/.claude/**',
      '**/next-env.d.ts',
      'pnpm-lock.yaml',
    ],
  },

  // Base JS recommended config
  js.configs.recommended,

  // TypeScript recommended configs
  ...tseslint.configs.recommended,

  // Environment and general language options
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },

  // Custom repository rules plugin configuration
  {
    plugins: {
      'repo-rules': repoRulesPlugin,
    },
    rules: {
      // Architectural boundaries
      'repo-rules/no-cross-package-relative-imports': 'error',
      'repo-rules/no-internal-package-imports': 'error',
      'repo-rules/enforce-file-naming': 'error',

      // Import ordering with auto-fix support
      'repo-rules/enforce-import-order': 'error',

      // Complexity, file size & SonarQube quality controls
      'repo-rules/max-file-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
      'repo-rules/cognitive-complexity': ['warn', { max: 20 }],
      'repo-rules/no-duplicate-constants': ['warn', { threshold: 4, minLength: 3 }],

      // Strict type safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Restrict raw console in core library packages
  {
    files: ['packages/**/*.ts', 'packages/**/*.js'],
    rules: {
      'repo-rules/no-console-in-libraries': [
        'warn',
        {
          allowedMethods: ['warn', 'error'],
        },
      ],
    },
  },

  // Prettier config disables formatting rules that clash with Prettier
  eslintConfigPrettier,
);
