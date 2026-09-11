import path from 'node:path';

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow relative imports that cross package boundaries in the monorepo',
      category: 'Repository Boundaries',
      recommended: true,
    },
    messages: {
      noCrossPackageRelative:
        "Cross-package relative import '{{importPath}}' is forbidden. Import from the workspace package '@playdeck/{{targetPkg}}' instead.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.();
    if (!filename || filename === '<input>' || filename === '<text>') {
      return {};
    }

    const normalizedPath = filename.replace(/\\/g, '/');
    const packagesMatch = normalizedPath.match(/packages\/([^/]+)\//);
    if (!packagesMatch) {
      return {};
    }

    const currentPkg = packagesMatch[1];
    const fileDir = path.dirname(filename);

    function checkImportPath(node, importSource) {
      if (!importSource || typeof importSource !== 'string') return;
      if (!importSource.startsWith('.')) return;

      const resolved = path.resolve(fileDir, importSource).replace(/\\/g, '/');
      const targetMatch = resolved.match(/packages\/([^/]+)\//);

      if (targetMatch) {
        const targetPkg = targetMatch[1];
        if (targetPkg !== currentPkg) {
          context.report({
            node,
            messageId: 'noCrossPackageRelative',
            data: {
              importPath: importSource,
              targetPkg,
            },
          });
        }
      }
    }

    return {
      ImportDeclaration(node) {
        checkImportPath(node, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source) {
          checkImportPath(node, node.source.value);
        }
      },
      ExportAllDeclaration(node) {
        if (node.source) {
          checkImportPath(node, node.source.value);
        }
      },
      ImportExpression(node) {
        if (
          node.source &&
          node.source.type === 'Literal' &&
          typeof node.source.value === 'string'
        ) {
          checkImportPath(node, node.source.value);
        }
      },
    };
  },
};

export default rule;
