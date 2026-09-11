/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow duplicated string literals; enforce defining constants instead (SonarQube S1192)',
      category: 'Repository Quality',
      recommended: true,
    },
    messages: {
      noDuplicateLiteral:
        "Define a constant instead of duplicating this literal '{{value}}' {{count}} times.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 2,
            default: 3,
          },
          minLength: {
            type: 'integer',
            minimum: 1,
            default: 3,
          },
          ignoreStrings: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = (context.filename ?? context.getFilename?.() ?? '').replace(/\\/g, '/');

    // Skip test files, eslint-rules, and config files
    if (
      filename.includes('/eslint-rules/') ||
      filename.includes('.config.') ||
      filename.includes('.test.') ||
      filename.includes('.spec.') ||
      filename.includes('/test/') ||
      filename.includes('/tests/')
    ) {
      return {};
    }

    const options = context.options[0] || {};
    const threshold = options.threshold ?? 3;
    const minLength = options.minLength ?? 3;
    const ignoreStrings = new Set(options.ignoreStrings || []);

    const stringOccurrences = new Map();

    function isIgnoredNode(node) {
      const parent = node.parent;
      if (!parent) return false;

      // Ignore import/export specifiers
      if (
        parent.type === 'ImportDeclaration' ||
        parent.type === 'ExportNamedDeclaration' ||
        parent.type === 'ExportAllDeclaration'
      ) {
        return true;
      }

      // Ignore dynamic imports: import('foo')
      if (parent.type === 'ImportExpression') {
        return true;
      }

      // Ignore object keys: { 'key': value }
      if (parent.type === 'Property' && parent.key === node && !parent.computed) {
        return true;
      }

      // Ignore TypeScript type annotations (e.g. type Foo = 'a' | 'b')
      if (
        parent.type === 'TSLiteralType' ||
        parent.type === 'TSTypeReference' ||
        parent.type === 'TSIndexedAccessType'
      ) {
        return true;
      }

      // Ignore require calls: require('foo')
      if (
        parent.type === 'CallExpression' &&
        parent.callee &&
        parent.callee.name === 'require' &&
        parent.arguments[0] === node
      ) {
        return true;
      }

      return false;
    }

    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        const value = node.value.trim();

        if (value.length < minLength) return;
        if (ignoreStrings.has(value)) return;
        if (isIgnoredNode(node)) return;

        let occurrences = stringOccurrences.get(value);
        if (!occurrences) {
          occurrences = [];
          stringOccurrences.set(value, occurrences);
        }
        occurrences.push(node);
      },

      'Program:exit'() {
        for (const [value, nodes] of stringOccurrences.entries()) {
          if (nodes.length >= threshold) {
            // Report on all duplicated occurrences from the 2nd one onward
            for (let i = 1; i < nodes.length; i++) {
              context.report({
                node: nodes[i],
                messageId: 'noDuplicateLiteral',
                data: {
                  value,
                  count: nodes.length,
                },
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
