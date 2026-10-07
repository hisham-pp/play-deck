import { expect, test } from '@playwright/test';
import { gravityGolfGame } from '@playdeck/game-data/src/content/gravity-golf';

test.describe('Gravity Golf', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${gravityGolfGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: gravityGolfGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${gravityGolfGame.definition.slug}`);
    // Gravity Golf automatically starts in solo mode

    const holeText = page.getByText(/Hole 1/i).first();
    await expect(holeText).toBeVisible({ timeout: 10000 });
  });
});
