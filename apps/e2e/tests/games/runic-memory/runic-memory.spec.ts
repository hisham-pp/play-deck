import { expect, test } from '@playwright/test';
import { runicMemoryGame } from '@playdeck/game-data/src/content/runic-memory';

test.describe('Runic Memory', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${runicMemoryGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: runicMemoryGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${runicMemoryGame.definition.slug}`);

    // Click "Start Game" in the setup modal
    await page.getByRole('button', { name: /Start Game/i }).click();

    // The game enters the play state. Check for the reset button or similar in arena
    const resetButton = page.getByRole('button', { name: 'Reset', exact: true });
    await expect(resetButton).toBeVisible({ timeout: 10000 });
  });
});
