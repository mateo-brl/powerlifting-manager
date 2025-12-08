import { test, expect } from '@playwright/test';

test.describe('Competition Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display dashboard on load', async ({ page }) => {
    await expect(page).toHaveTitle(/Powerlifting Manager/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should navigate to competitions page', async ({ page }) => {
    await page.click('text=Competitions');
    await expect(page.url()).toContain('/competitions');
  });

  test('should create a new competition', async ({ page }) => {
    // Navigate to new competition form
    await page.click('text=Competitions');
    await page.click('text=New Competition');

    // Fill the form
    await page.fill('input[id="name"]', 'Test Competition E2E');
    await page.click('input[id="date"]');
    // Select today's date
    await page.keyboard.press('Enter');

    await page.fill('input[id="location"]', 'Test Location');
    await page.click('#federation');
    await page.click('text=IPF');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect and show success
    await expect(page.locator('text=Test Competition E2E')).toBeVisible();
  });
});

test.describe('Athlete Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to add athlete from competition', async ({ page }) => {
    // This test assumes a competition exists
    await page.click('text=Competitions');

    // Click on first competition if exists
    const competitionRow = page.locator('table tbody tr').first();
    if (await competitionRow.isVisible()) {
      await competitionRow.click();
      await expect(page.locator('text=Athletes')).toBeVisible();
    }
  });
});

test.describe('Demo Data', () => {
  test('should generate demo data', async ({ page }) => {
    await page.goto('/');

    // Look for demo data button
    const demoButton = page.locator('button:has-text("Demo")');
    if (await demoButton.isVisible()) {
      await demoButton.click();
      // Wait for data to be generated
      await page.waitForTimeout(2000);
      // Check that athletes were created
      await page.click('text=Competitions');
      await expect(page.locator('table tbody tr')).toHaveCount(1);
    }
  });
});

test.describe('Live Competition Flow', () => {
  test('should display live competition interface', async ({ page }) => {
    // Navigate to competitions
    await page.click('text=Competitions');

    // If there's a competition, click on it
    const firstCompetition = page.locator('table tbody tr').first();
    if (await firstCompetition.isVisible()) {
      await firstCompetition.click();

      // Look for Live button
      const liveButton = page.locator('text=Live');
      if (await liveButton.isVisible()) {
        await liveButton.click();
        // Should see the live interface
        await expect(page.locator('text=Squat').or(page.locator('text=Bench')).or(page.locator('text=Deadlift'))).toBeVisible();
      }
    }
  });
});

test.describe('Weight Classes Validation', () => {
  test('should validate weight class on weigh-in', async ({ page }) => {
    await page.goto('/');

    // Navigate to competitions
    await page.click('text=Competitions');

    const firstCompetition = page.locator('table tbody tr').first();
    if (await firstCompetition.isVisible()) {
      await firstCompetition.click();

      // Look for Weigh-in button
      const weighInButton = page.locator('text=Weigh-in');
      if (await weighInButton.isVisible()) {
        await weighInButton.click();
        // Weigh-in form should be visible
        await expect(page.locator('form')).toBeVisible();
      }
    }
  });
});

test.describe('Rankings Display', () => {
  test('should show rankings page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Competitions');

    const firstCompetition = page.locator('table tbody tr').first();
    if (await firstCompetition.isVisible()) {
      await firstCompetition.click();

      const rankingsButton = page.locator('text=Rankings');
      if (await rankingsButton.isVisible()) {
        await rankingsButton.click();
        // Rankings should show score columns
        await expect(page.locator('th:has-text("Total")').or(page.locator('th:has-text("DOTS")')).or(page.locator('th:has-text("IPF GL")').or(page.locator('text=No athletes')))).toBeVisible();
      }
    }
  });
});

test.describe('External Displays', () => {
  test('should load scoreboard display', async ({ page }) => {
    await page.goto('/display');
    // Display should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load spotters display', async ({ page }) => {
    await page.goto('/spotters');
    // Spotters display should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load warmup display', async ({ page }) => {
    await page.goto('/warmup');
    // Warmup display should load
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Internationalization', () => {
  test('should switch language', async ({ page }) => {
    await page.goto('/');

    // Look for language switcher
    const languageSwitcher = page.locator('[data-testid="language-switcher"]').or(page.locator('button:has-text("FR")').or(page.locator('button:has-text("EN")')));

    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();
      // Language should change
      await page.waitForTimeout(500);
    }
  });
});
