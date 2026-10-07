import { expect, test } from '@playwright/test';
import { minesweeperGame } from '@playdeck/game-data/src/content/minesweeper';

test.describe('Minesweeper', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${minesweeperGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: minesweeperGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to play a match and interact with the board', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${minesweeperGame.definition.slug}`);

    // Wait for the "Field" grid to be visible
    const board = page.getByRole('grid', { name: /Minesweeper field/i });
    await expect(board).toBeVisible();

    // Click on the first cell to reveal it (we don't know what it is, but it should do something)
    const firstCell = page.getByRole('button', { name: /Hidden cell at row 1, column 1/i });
    await firstCell.click();

    // It should either reveal an empty cell, a number, or a mine (which means game over)
    // We just expect the button state to change
    await expect(firstCell).not.toBeVisible({ timeout: 5000 }); // It changes from a hidden cell to something else

    // Check if the reset button works
    await page.getByRole('button', { name: /Restart Game/i }).click();

    // The first cell should be hidden again
    await expect(
      page.getByRole('button', { name: /Hidden cell at row 1, column 1/i }),
    ).toBeVisible();
  });
});
