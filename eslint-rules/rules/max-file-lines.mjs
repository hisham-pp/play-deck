/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce a maximum number of lines in TypeScript files to keep files focused and modular',
      category: 'Repository Quality',
      recommended: true,
    },
    messages: {
      maxLinesExceeded:
        'File has {{lineCount}} lines of code, exceeding maximum limit of {{max}} lines. Split this file into smaller, focused modules.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            minimum: 1,
            default: 100,
          },
          skipBlankLines: {
            type: 'boolean',
            default: true,
          },
          skipComments: {
            type: 'boolean',
            default: true,
          },
          ignoreTests: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = (context.filename ?? context.getFilename?.() ?? '').replace(/\\/g, '/');

    // Only apply to TypeScript source files
    if (filename && !/\.(ts|tsx|mts)$/.test(filename)) {
      return {};
    }

    const options = context.options[0] || {};
    const max = options.max ?? 100;
    const skipBlankLines = options.skipBlankLines !== false;
    const skipComments = options.skipComments !== false;
    const ignoreTests = options.ignoreTests !== false;

    if (
      ignoreTests &&
      (filename.includes('.test.') ||
        filename.includes('.spec.') ||
        filename.includes('/test/') ||
        filename.includes('/tests/'))
    ) {
      return {};
    }

    return {
      Program(node) {
        const sourceCode = context.sourceCode ?? context.getSourceCode?.();
        const lines = sourceCode.lines;

        if (!skipBlankLines && !skipComments) {
          if (lines.length > max) {
            context.report({
              node,
              messageId: 'maxLinesExceeded',
              data: {
                lineCount: lines.length,
                max,
              },
            });
          }
          return;
        }

        // Build array of line strings
        const lineTexts = [...lines];

        // Mask out comment ranges if skipping comments
        if (skipComments) {
          const comments = sourceCode.getAllComments ? sourceCode.getAllComments() : [];
          for (const comment of comments) {
            const startLine = comment.loc.start.line;
            const endLine = comment.loc.end.line;

            if (startLine === endLine) {
              const line = lineTexts[startLine - 1] ?? '';
              lineTexts[startLine - 1] =
                line.slice(0, comment.loc.start.column) +
                ' '.repeat(comment.loc.end.column - comment.loc.start.column) +
                line.slice(comment.loc.end.column);
            } else {
              // Multi-line comment
              const firstLine = lineTexts[startLine - 1] ?? '';
              lineTexts[startLine - 1] =
                firstLine.slice(0, comment.loc.start.column) +
                ' '.repeat(firstLine.length - comment.loc.start.column);

              for (let i = startLine + 1; i < endLine; i++) {
                lineTexts[i - 1] = '';
              }

              const lastLine = lineTexts[endLine - 1] ?? '';
              lineTexts[endLine - 1] =
                ' '.repeat(comment.loc.end.column) + lastLine.slice(comment.loc.end.column);
            }
          }
        }

        let count = 0;
        for (const line of lineTexts) {
          if (skipBlankLines && line.trim() === '') {
            continue;
          }
          count++;
        }

        if (count > max) {
          context.report({
            node,
            messageId: 'maxLinesExceeded',
            data: {
              lineCount: count,
              max,
            },
          });
        }
      },
    };
  },
};

export default rule;
