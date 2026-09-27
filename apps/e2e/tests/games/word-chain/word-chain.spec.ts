import { expect, test } from '@playwright/test';
import { wordChainGame } from '@playdeck/game-data/src/content/word-chain';

test.describe('Word Chain', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${wordChainGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: wordChainGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match and view prompt', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${wordChainGame.definition.slug}`);

    // Click "Start the chain" on the setup modal
    await page.getByRole('button', { name: /Start the chain/i }).click();

    // The game enters countdown then 'playing' status.
    // Wait for the "Your word" text box to become enabled and visible.
    const input = page.getByRole('textbox', { name: /Your word/i });
    await expect(input).toBeVisible({ timeout: 10000 });
  });
});
