import { expect, test } from '@playwright/test';
import { gravityShiftGame } from '@playdeck/game-data/src/content/gravity-shift';

test.describe('Gravity Shift', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${gravityShiftGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: gravityShiftGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${gravityShiftGame.definition.slug}`);
    await page.getByRole('button', { name: /Launch Solo Race/i }).click();

    // Look for something visible in the HUD, e.g., 'Speed', 'Gravity' or a button like 'Resume' or similar. 
    // We wait for the HUD to render "Checkpoints" or "Shift Charges"
    const hudText = page.getByText(/Checkpoints|Shift Charges/i).first();
    await expect(hudText).toBeVisible({ timeout: 10000 });
  });
});
