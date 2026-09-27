import { expect, test } from '@playwright/test';
import { stickmanRacingGame } from '@playdeck/game-data/src/content/stickman-racing';

test.describe('Stickman Racing', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanRacingGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanRacingGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanRacingGame.definition.slug}`);

    // Wait for the START SPRINT button
    await page.getByRole('button', { name: /START SPRINT/i }).click();

    // Look for JUMP (SPACE) button to verify playing state
    const jumpBtn = page.getByRole('button', { name: /JUMP \(SPACE\)/i }).first();
    await expect(jumpBtn).toBeVisible({ timeout: 10000 });
  });
});
