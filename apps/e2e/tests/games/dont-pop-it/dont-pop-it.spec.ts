import { expect, test } from '@playwright/test';
import { dontPopItGame } from '@playdeck/game-data/src/content/dont-pop-it';

test.describe('Dont Pop It', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${dontPopItGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: dontPopItGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${dontPopItGame.definition.slug}`);

    // The game enters the play state automatically. Look for 'Pop Pressure Gauge'
    const pressureGauge = page.getByText(/Pop Pressure Gauge/i).first();
    await expect(pressureGauge).toBeVisible({ timeout: 10000 });
  });
});
