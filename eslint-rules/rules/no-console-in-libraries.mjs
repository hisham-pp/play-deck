/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow raw console logging methods in core library packages',
      category: 'Repository Quality',
      recommended: true,
    },
    messages: {
      unexpectedConsole:
        "Unexpected 'console.{{method}}' in library package. Library code should use structured logging or return data instead of stdout/stderr pollution.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedMethods: {
            type: 'array',
            items: { type: 'string' },
            default: ['warn', 'error'],
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = (context.filename ?? context.getFilename?.() ?? '').replace(/\\/g, '/');

    // Allow console in CLI package and test files
    if (
      filename.includes('/packages/cli/') ||
      filename.includes('/tests/') ||
      filename.includes('.test.') ||
      filename.includes('.spec.')
    ) {
      return {};
    }

    const options = context.options[0] || {};
    const allowedMethods = new Set(options.allowedMethods || ['warn', 'error']);

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'console' &&
          callee.property.type === 'Identifier'
        ) {
          const methodName = callee.property.name;
          if (!allowedMethods.has(methodName)) {
            context.report({
              node,
              messageId: 'unexpectedConsole',
              data: {
                method: methodName,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
