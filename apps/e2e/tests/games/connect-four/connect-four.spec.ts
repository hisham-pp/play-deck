import { expect, test } from '@playwright/test';
import { connectFourGame } from '@playdeck/game-data/src/content/connect-four';

test.describe('Connect Four', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${connectFourGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: connectFourGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to play a match', async ({ page }) => {
    // 1. Navigate to the game page
    await page.goto(`/play/${connectFourGame.definition.slug}`);

    // 2. Click "Local 2P" on the setup modal
    await page.getByRole('button', { name: /Local 2P/i }).click();

    // 3. Click "Start Match" on the setup modal
    await page.getByRole('button', { name: /Start Match/i }).click();

    // 4. Drop a piece in column 1 (click on Row 1, Column 1)
    await page.getByRole('gridcell', { name: /Row 1, Column 1/i }).click();

    // Verify player 1 dropped (row 6 because pieces fall to the bottom)
    await expect(
      page.getByRole('gridcell', { name: /Row 6, Column 1: Player 1 Red/i }),
    ).toBeVisible({ timeout: 5000 });

    // 5. Drop a piece in column 2 (click on Row 1, Column 2)
    await page.getByRole('gridcell', { name: /Row 1, Column 2/i }).click();

    // Verify player 2 dropped
    await expect(
      page.getByRole('gridcell', { name: /Row 6, Column 2: Player 2 Yellow/i }),
    ).toBeVisible({ timeout: 5000 });
  });
});
