import path from 'node:path';

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce lowercase kebab-case naming for source files to ensure cross-platform repository consistency',
      category: 'Repository Quality',
      recommended: true,
    },
    messages: {
      invalidFilename:
        "Filename '{{filename}}' must be lowercase kebab-case (e.g., '{{suggested}}') to prevent cross-platform file case issues.",
    },
    schema: [],
  },

  create(context) {
    const fullPath = (context.filename ?? context.getFilename?.() ?? '').replace(/\\/g, '/');
    if (!fullPath || fullPath === '<input>' || fullPath === '<text>') {
      return {};
    }

    // Only enforce for files under packages/*/src/
    if (!fullPath.includes('/src/')) {
      return {};
    }

    const basename = path.basename(fullPath);
    // Ignore special files, dotfiles, or index
    if (basename.startsWith('.') || basename === 'index.ts' || basename === 'index.js') {
      return {};
    }

    // Get the base name without extensions (e.g., "classifier" from "classifier.ts" or "phase3.test" from "phase3.test.ts")
    const parts = basename.split('.');
    const nameWithoutExt = parts[0];

    // Check if name is valid kebab-case (lowercase letters, numbers, and dashes)
    const isKebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(nameWithoutExt);

    if (!isKebabCase) {
      // Suggest kebab-case: convert camelCase or PascalCase to kebab-case
      const suggested = nameWithoutExt
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();

      return {
        Program(node) {
          context.report({
            node,
            messageId: 'invalidFilename',
            data: {
              filename: basename,
              suggested: `${suggested}.${parts.slice(1).join('.')}`,
            },
          });
        },
      };
    }

    return {};
  },
};

export default rule;
