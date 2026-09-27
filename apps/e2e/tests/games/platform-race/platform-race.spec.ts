import { expect, test } from '@playwright/test';
import { platformRaceGame } from '@playdeck/game-data/src/content/platform-race';

test.describe('Platform Race', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${platformRaceGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: platformRaceGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${platformRaceGame.definition.slug}`);

    // The game loads automatically in solo mode
    const soloModeBtn = page.getByRole('button', { name: /Solo Grand Prix/i, exact: true });
    await expect(soloModeBtn).toBeVisible({ timeout: 10000 });
  });
});
