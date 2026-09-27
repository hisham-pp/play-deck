import { expect, test } from '@playwright/test';
import { stickmanRunnerGame } from '@playdeck/game-data/src/content/stickman-runner';

test.describe('Stickman Runner', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanRunnerGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanRunnerGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanRunnerGame.definition.slug}`);

    // Press space to start the game
    await page.keyboard.press('Space');

    // Verify the game started by checking the idle text disappeared
    const idleText = page.getByText(/Press \[SPACE\], tap, or hit jump to sprint and dodge the hazards/i);
    await expect(idleText).not.toBeVisible();
  });
});
