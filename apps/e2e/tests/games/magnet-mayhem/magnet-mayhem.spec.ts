import { expect, test } from '@playwright/test';
import { magnetMayhemGame } from '@playdeck/game-data/src/content/magnet-mayhem';

test.describe('Magnet Mayhem', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${magnetMayhemGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: magnetMayhemGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${magnetMayhemGame.definition.slug}`);

    // Click "Launch Arena (4 Players)"
    await page.getByRole('button', { name: /Launch Arena/i, exact: true }).click();

    // The game enters the play state. Look for 'Magnet Charge'
    const magnetChargeText = page.getByText(/Magnet Charge/i).first();
    await expect(magnetChargeText).toBeVisible({ timeout: 10000 });
  });
});
