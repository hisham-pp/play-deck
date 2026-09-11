# Custom Repository Hygiene Rules (`eslint-rules/`)

This directory contains repository-specific ESLint rules packaged as a local plugin (`repo-rules`) to maintain architectural boundaries, code simplicity, cross-platform consistency, strict typing, import organization, and SonarQube-aligned quality standards across the `code-lens` monorepo.

---

## Rules Overview

| Rule                                                                        | Type         | Description                                                                            |
| :-------------------------------------------------------------------------- | :----------- | :------------------------------------------------------------------------------------- |
| [`no-cross-package-relative-imports`](#1-no-cross-package-relative-imports) | `problem`    | Disallows relative imports across monorepo package boundaries                          |
| [`no-internal-package-imports`](#2-no-internal-package-imports)             | `problem`    | Disallows deep/internal imports into packages (e.g. `/src/` or `/dist/`)               |
| [`enforce-file-naming`](#3-enforce-file-naming)                             | `suggestion` | Enforces lowercase kebab-case for source files to prevent git case issues              |
| [`enforce-import-order`](#4-enforce-import-order)                           | `layout`     | Enforces strict, deterministic import grouping and sorting with auto-fixer             |
| [`no-console-in-libraries`](#5-no-console-in-libraries)                     | `suggestion` | Disallows raw `console.log/info/debug` in library packages                             |
| [`max-file-lines`](#6-max-file-lines)                                       | `problem`    | Enforces max lines in TypeScript files (default: 100 lines of code)                    |
| [`cognitive-complexity`](#7-cognitive-complexity)                           | `suggestion` | Enforces maximum cognitive complexity for functions to guarantee readable control flow |
| [`no-duplicate-constants`](#8-no-duplicate-constants)                       | `suggestion` | Disallows duplicated string literals; enforces extracting constants (SonarQube S1192)  |

---

### 1. `no-cross-package-relative-imports`

- **Goal**: Maintain strict module boundaries between workspace packages (`packages/*`).
- **Why**: Relative imports like `../../database/src/index.ts` bypass package dependency trees, break bundling/publishing, and cause build errors.
- **Incorrect**:
  ```ts
  // In packages/core/src/indexing.ts
  import { DatabaseManager } from '../../database/src/index.js';
  ```
- **Correct**:
  ```ts
  import { DatabaseManager } from '@playdeck/database';
  ```

---

### 2. `no-internal-package-imports`

- **Goal**: Prohibit importing internal/private implementation files of workspace packages.
- **Why**: Internal structures should be encapsulated and refactorable without breaking consumers. Only public entrypoints should be imported.
- **Incorrect**:
  ```ts
  import { classifier } from '@playdeck/core/src/scanner/classifier.js';
  import { chunker } from '@playdeck/core/dist/chunker/index.js';
  ```
- **Correct**:
  ```ts
  import { classifier, chunker } from '@playdeck/core';
  ```

---

### 3. `enforce-file-naming`

- **Goal**: Ensure consistent lowercase kebab-case naming for all source files in `packages/*/src/`.
- **Why**: Git is case-insensitive by default on macOS and Windows, but case-sensitive on Linux. CamelCase/PascalCase naming frequently causes cross-platform checkout and CI failures.
- **Incorrect**:
  ```
  packages/core/src/MyScanner.ts
  packages/search/src/bm25Search.ts
  ```
- **Correct**:
  ```
  packages/core/src/my-scanner.ts
  packages/search/src/bm25-search.ts
  ```

---

### 4. `enforce-import-order`

- **Goal**: Guarantee deterministic, clean import blocks with auto-fix support.
- **Why**: Unorganized imports make reading diffs noisy and obscure module dependencies.
- **Ordering Hierarchy**:
  1. Node.js built-ins (`node:*`, `fs`, `path`, etc.)
  2. External 3rd-party packages (`express`, `vitest`, etc.)
  3. Internal workspace packages (`@playdeck/*`)
  4. Parent directory imports (`../...`)
  5. Sibling directory imports (`./...`)
- **Auto-Fix**: Automatically fixable via `pnpm lint:fix` (`eslint --fix`).
- **Incorrect**:
  ```ts
  import { localHelper } from './helper.js';
  import * as fs from 'node:fs/promises';
  import { CoreEngine } from '@playdeck/core';
  ```
- **Correct**:
  ```ts
  import * as fs from 'node:fs/promises';
  import { CoreEngine } from '@playdeck/core';
  import { localHelper } from './helper.js';
  ```

---

### 5. `no-console-in-libraries`

- **Goal**: Prevent accidental debug logging from leaking into published libraries.
- **Why**: Library packages (`packages/core`, `packages/database`, `packages/search`, etc.) should use structured logger interfaces or emit typed events/returns instead of polluting stdout/stderr. CLI (`packages/cli`) and test suites (`*.test.ts`) are excluded.
- **Incorrect**:
  ```ts
  console.log('Processed batch of symbols:', count);
  ```
- **Correct**:
  ```ts
  logger.info('Processed batch of symbols', { count });
  ```

---

### 6. `max-file-lines`

- **Goal**: Enforce that TypeScript files do not exceed a strict limit (e.g. 100 lines of code).
- **Why**: Large files quickly become monolithic, hard to test, and difficult to reason about. Enforcing compact files forces modular architecture and clean separation of concerns.
- **Configuration**:
  ```js
  'repo-rules/max-file-lines': ['warn', { max: 100, skipBlankLines: true, skipComments: true }]
  ```

---

### 7. `cognitive-complexity`

- **Goal**: Prevent deeply nested control flow, chained conditionals, and hard-to-follow algorithmic complexity.
- **Why**: Cognitive complexity penalizes nesting increments and control structure jumps, directly assessing human readability.
- **Configuration**:
  ```js
  'repo-rules/cognitive-complexity': ['warn', { max: 15 }]
  ```

---

### 8. `no-duplicate-constants`

- **Goal**: Disallow duplicating identical string literals; enforce defining constants (SonarQube S1192).
- **Why**: Duplicating string literals across a file introduces typo risks and increases maintenance overhead during refactoring.
- **Configuration**:
  ```js
  'repo-rules/no-duplicate-constants': ['warn', { threshold: 3, minLength: 3 }]
  ```

---

## Running Tests

Custom rules are tested using ESLint's `RuleTester` run via Vitest:

```bash
pnpm test:rules
```
