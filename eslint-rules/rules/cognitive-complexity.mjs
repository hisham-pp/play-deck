/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce a maximum cognitive complexity for functions to ensure code readability',
      category: 'Repository Quality',
      recommended: true,
    },
    messages: {
      cognitiveComplexityExceeded:
        "Function '{{name}}' has a cognitive complexity of {{complexity}}, exceeding maximum of {{max}}. Refactor into simpler, smaller functions.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            minimum: 1,
            default: 15,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = (context.filename ?? context.getFilename?.() ?? '').replace(/\\/g, '/');

    // Skip eslint-rules internal visitor logic and test files
    if (
      filename.includes('/eslint-rules/') ||
      filename.includes('.test.') ||
      filename.includes('.spec.') ||
      filename.includes('/test/') ||
      filename.includes('/tests/')
    ) {
      return {};
    }

    const options = context.options[0] || {};
    const max = options.max ?? 15;

    function getFunctionName(node) {
      if (node.id && node.id.name) return node.id.name;
      if (node.parent) {
        if (node.parent.type === 'VariableDeclarator' && node.parent.id.name) {
          return node.parent.id.name;
        }
        if (node.parent.type === 'MethodDefinition' && node.parent.key && node.parent.key.name) {
          return node.parent.key.name;
        }
        if (node.parent.type === 'Property' && node.parent.key && node.parent.key.name) {
          return node.parent.key.name;
        }
        if (
          node.parent.type === 'AssignmentExpression' &&
          node.parent.left &&
          node.parent.left.name
        ) {
          return node.parent.left.name;
        }
      }
      return 'anonymous function';
    }

    function calculateCognitiveComplexity(funcNode) {
      let complexity = 0;

      function traverse(node, nestingLevel) {
        if (!node || typeof node !== 'object') return;

        // Skip nested function declarations or expressions from this function's calculation
        if (
          node !== funcNode &&
          (node.type === 'FunctionDeclaration' ||
            node.type === 'FunctionExpression' ||
            node.type === 'ArrowFunctionExpression')
        ) {
          traverseFunctionChildren(node, nestingLevel + 1);
          return;
        }

        switch (node.type) {
          case 'IfStatement': {
            complexity += 1 + nestingLevel;
            traverse(node.test, nestingLevel);
            traverse(node.consequent, nestingLevel + 1);
            if (node.alternate) {
              if (node.alternate.type === 'IfStatement') {
                complexity += 1;
                traverse(node.alternate.test, nestingLevel);
                traverse(node.alternate.consequent, nestingLevel + 1);
                if (node.alternate.alternate) {
                  traverse(node.alternate.alternate, nestingLevel);
                }
              } else {
                complexity += 1;
                traverse(node.alternate, nestingLevel + 1);
              }
            }
            return;
          }

          case 'ConditionalExpression': {
            complexity += 1 + nestingLevel;
            traverse(node.test, nestingLevel);
            traverse(node.consequent, nestingLevel + 1);
            traverse(node.alternate, nestingLevel + 1);
            return;
          }

          case 'SwitchStatement': {
            complexity += 1 + nestingLevel;
            traverse(node.discriminant, nestingLevel);
            for (const c of node.cases) {
              for (const stmt of c.consequent) {
                traverse(stmt, nestingLevel + 1);
              }
            }
            return;
          }

          case 'ForStatement':
          case 'ForInStatement':
          case 'ForOfStatement':
          case 'WhileStatement':
          case 'DoWhileStatement': {
            complexity += 1 + nestingLevel;
            if (node.test) traverse(node.test, nestingLevel);
            if (node.body) traverse(node.body, nestingLevel + 1);
            return;
          }

          case 'CatchClause': {
            complexity += 1 + nestingLevel;
            if (node.body) traverse(node.body, nestingLevel + 1);
            return;
          }

          case 'LogicalExpression': {
            complexity += 1;
            traverse(node.left, nestingLevel);
            traverse(node.right, nestingLevel);
            return;
          }

          default: {
            for (const key of Object.keys(node)) {
              if (key === 'parent') continue;
              const child = node[key];
              if (Array.isArray(child)) {
                for (const item of child) {
                  traverse(item, nestingLevel);
                }
              } else if (child && typeof child === 'object' && child.type) {
                traverse(child, nestingLevel);
              }
            }
          }
        }
      }

      function traverseFunctionChildren(fn, nesting) {
        if (fn.body) {
          traverse(fn.body, nesting);
        }
      }

      traverseFunctionChildren(funcNode, 0);
      return complexity;
    }

    function checkFunction(node) {
      const complexity = calculateCognitiveComplexity(node);
      if (complexity > max) {
        context.report({
          node,
          messageId: 'cognitiveComplexityExceeded',
          data: {
            name: getFunctionName(node),
            complexity,
            max,
          },
        });
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression(node) {
        if (node.parent && node.parent.type === 'MethodDefinition') return;
        checkFunction(node);
      },
      ArrowFunctionExpression(node) {
        if (node.body && node.body.type !== 'BlockStatement') return;
        checkFunction(node);
      },
      MethodDefinition(node) {
        if (node.value) {
          checkFunction(node.value);
        }
      },
    };
  },
};

export default rule;
