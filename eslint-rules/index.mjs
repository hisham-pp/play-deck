import cognitiveComplexity from './rules/cognitive-complexity.mjs';
import enforceFileNaming from './rules/enforce-file-naming.mjs';
import enforceImportOrder from './rules/enforce-import-order.mjs';
import maxFileLines from './rules/max-file-lines.mjs';
import noConsoleInLibraries from './rules/no-console-in-libraries.mjs';
import noCrossPackageRelativeImports from './rules/no-cross-package-relative-imports.mjs';
import noDuplicateConstants from './rules/no-duplicate-constants.mjs';
import noInternalPackageImports from './rules/no-internal-package-imports.mjs';

const plugin = {
  meta: {
    name: 'eslint-plugin-repo-rules',
    version: '1.0.0',
  },
  rules: {
    'no-cross-package-relative-imports': noCrossPackageRelativeImports,
    'no-internal-package-imports': noInternalPackageImports,
    'no-console-in-libraries': noConsoleInLibraries,
    'enforce-file-naming': enforceFileNaming,
    'max-file-lines': maxFileLines,
    'cognitive-complexity': cognitiveComplexity,
    'no-duplicate-constants': noDuplicateConstants,
    'enforce-import-order': enforceImportOrder,
  },
};

export default plugin;
