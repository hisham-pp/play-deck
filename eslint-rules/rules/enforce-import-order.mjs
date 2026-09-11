import { isBuiltin } from 'node:module';

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description:
        'Enforce a strict import ordering: Node built-ins -> External packages -> Monorepo packages (@playdeck/*) -> Parent imports -> Sibling imports',
      category: 'Repository Quality',
      recommended: true,
    },
    messages: {
      incorrectImportOrder:
        "Import '{{source}}' is out of order. Expected: Node built-ins -> External -> Workspace (@playdeck/*) -> Parent (../) -> Sibling (./).",
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode?.();

    function getGroup(source) {
      if (source.startsWith('node:') || isBuiltin(source)) {
        return 0; // Node built-in
      }
      if (source.startsWith('@playdeck/')) {
        return 2; // Internal workspace package
      }
      if (source.startsWith('@/')) {
        return 2.5; // Project root alias
      }
      if (source.startsWith('../')) {
        return 3; // Parent relative
      }
      if (source.startsWith('./')) {
        return 4; // Sibling relative
      }
      return 1; // External npm dependency
    }

    function compareImports(a, b) {
      const groupA = getGroup(a.source.value);
      const groupB = getGroup(b.source.value);

      if (groupA !== groupB) {
        return groupA - groupB;
      }

      // Within same group, sort alphabetically by import source
      return a.source.value.localeCompare(b.source.value);
    }

    return {
      Program(node) {
        const importNodes = node.body.filter((stmt) => stmt.type === 'ImportDeclaration');
        if (importNodes.length < 2) return;

        // Group imports into contiguous blocks
        const contiguousBlocks = [];
        let currentBlock = [importNodes[0]];

        for (let i = 1; i < importNodes.length; i++) {
          const prev = importNodes[i - 1];
          const curr = importNodes[i];

          // Check if there are statements between prev and curr
          const prevIndex = node.body.indexOf(prev);
          const currIndex = node.body.indexOf(curr);

          if (currIndex === prevIndex + 1) {
            currentBlock.push(curr);
          } else {
            contiguousBlocks.push(currentBlock);
            currentBlock = [curr];
          }
        }
        contiguousBlocks.push(currentBlock);

        for (const block of contiguousBlocks) {
          if (block.length < 2) continue;

          // Check if block is sorted
          const sorted = [...block].sort(compareImports);

          let firstMisplacedIndex = -1;
          for (let i = 0; i < block.length; i++) {
            if (block[i] !== sorted[i]) {
              firstMisplacedIndex = i;
              break;
            }
          }

          if (firstMisplacedIndex !== -1) {
            const misplacedNode = block[firstMisplacedIndex];
            context.report({
              node: misplacedNode,
              messageId: 'incorrectImportOrder',
              data: {
                source: misplacedNode.source.value,
              },
              fix(fixer) {
                const startRange = block[0].range[0];
                const endRange = block[block.length - 1].range[1];

                // Extract text for each sorted import
                const sortedTexts = sorted.map((item) => sourceCode.getText(item));
                return fixer.replaceTextRange([startRange, endRange], sortedTexts.join('\n'));
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
