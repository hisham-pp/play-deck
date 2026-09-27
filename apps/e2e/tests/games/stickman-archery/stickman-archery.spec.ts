import { expect, test } from '@playwright/test';
import { stickmanArcheryGame } from '@playdeck/game-data/src/content/stickman-archery';

test.describe('Stickman Archery', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanArcheryGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanArcheryGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanArcheryGame.definition.slug}`);

    // The game starts automatically. Wait for the round indicator.
    const roundText = page.getByText(/Round 1\//i).first();
    await expect(roundText).toBeVisible({ timeout: 10000 });
  });
});
