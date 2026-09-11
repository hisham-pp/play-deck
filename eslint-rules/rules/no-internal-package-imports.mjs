/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow deep imports into internal files of workspace packages',
      category: 'Repository Boundaries',
      recommended: true,
    },
    messages: {
      noInternalPackageImport:
        "Deep import '{{importPath}}' is forbidden. Import from the package root ('{{pkgName}}') or documented public subpath export instead.",
    },
    schema: [],
  },

  create(context) {
    const internalPattern = /^(@playdeck\/[^/]+)\/(src|dist|build)(\/.*)?$/;

    function checkImportPath(node, importSource) {
      if (!importSource || typeof importSource !== 'string') return;

      const match = importSource.match(internalPattern);
      if (match) {
        context.report({
          node,
          messageId: 'noInternalPackageImport',
          data: {
            importPath: importSource,
            pkgName: match[1],
          },
        });
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
