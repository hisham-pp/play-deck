import { expect, test } from '@playwright/test';
import { sudokuGame } from '@playdeck/game-data/src/content/sudoku';

test.describe('Sudoku', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${sudokuGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: sudokuGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a puzzle and interact with the board', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${sudokuGame.definition.slug}`);

    // Click "Easy" on the difficulty setup modal
    await page.getByRole('button', { name: /Easy/i, exact: false }).click();

    // Verify the grid is rendered (Row 1, column 1 cell should be visible)
    const firstCell = page.getByRole('gridcell', { name: /Row 1, column 1/i });
    await expect(firstCell).toBeVisible({ timeout: 10000 });

    // The Reset button in the Actions card should be enabled (since game started)
    const resetButton = page.getByRole('button', { name: /Reset grid/i });
    await expect(resetButton).toBeEnabled();
  });
});
