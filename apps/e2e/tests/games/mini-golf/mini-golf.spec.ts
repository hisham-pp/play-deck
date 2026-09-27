import { expect, test } from '@playwright/test';
import { miniGolfGame } from '@playdeck/game-data/src/content/mini-golf';

test.describe('Mini Golf', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${miniGolfGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: miniGolfGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${miniGolfGame.definition.slug}`);

    // Mini Golf immediately starts the solo game upon navigating to /play/mini-golf
    // Wait for the HUD to load, looking for 'Stroke' text or similar elements
    const strokeText = page.getByText(/Stroke/i).first();
    await expect(strokeText).toBeVisible({ timeout: 10000 });
  });
});
