import { expect, test } from '@playwright/test';
import { stickmanClimberGame } from '@playdeck/game-data/src/content/stickman-climber';

test.describe('Stickman Climber', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanClimberGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanClimberGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanClimberGame.definition.slug}`);

    // The game starts automatically. Wait for the Map view button.
    const mapBtn = page.getByRole('button', { name: /Ascent Map \[M\]/i }).first();
    await expect(mapBtn).toBeVisible({ timeout: 10000 });
  });
});
