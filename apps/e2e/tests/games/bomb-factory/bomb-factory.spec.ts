import { expect, test } from '@playwright/test';
import { bombFactoryGame } from '@playdeck/game-data/src/content/bomb-factory';

test.describe('Bomb Factory', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${bombFactoryGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: bombFactoryGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${bombFactoryGame.definition.slug}`);

    // Click "Local drill" to open local setup
    await page.getByRole('button', { name: /Local drill/i }).click();

    // Click "Deal the sheets" to start the game
    await page.getByRole('button', { name: /Deal the sheets/i }).click();

    // The game enters the play state. Look for 'Machine 1 of'
    const machineText = page.getByText(/Machine 1 of/i).first();
    await expect(machineText).toBeVisible({ timeout: 10000 });
  });
});
