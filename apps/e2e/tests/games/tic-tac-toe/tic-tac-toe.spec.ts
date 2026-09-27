import { expect, test } from '@playwright/test';

test.describe('Tic Tac Toe Game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Tic Tac Toe game
    await page.goto('/play/tic-tac-toe');
  });

  test('should load the game, open setup modal, and start a match', async ({ page }) => {
    // Wait for the setup modal to appear
    const startButton = page.getByRole('button', { name: /Enter Arena/i });
    await expect(startButton).toBeVisible();

    // Start the game in Single Player Mode (default)
    await startButton.click();

    // Verify game grid appears
    const gridCell = page.locator('button[aria-label^="Cell"]').first();
    await expect(gridCell).toBeVisible();

    // Make a move
    await gridCell.click();

    // Expect the cell to be marked (aria-label should update from empty to X)
    await expect(gridCell).toHaveAttribute('aria-label', /X/);
  });
});
