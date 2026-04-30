import { test, expect } from '@playwright/test';

/**
 * LabProgress — checkboxes persistées par lab.
 * Tests :
 *   - rendu : N steps, 0/N initialement
 *   - clic checkbox → done +1, barre de progression bouge
 *   - persistance : reload → état conservé
 *   - tous cochés → message de complétion + bouton Réinitialiser
 *   - Réinitialiser → retour à 0/N
 */

const PAGE_URL = '/01-fondations/lab-01/';

test.describe('LabProgress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Hydration `client:visible` : scroll + attente
    const tracker = page.getByRole('group', { name: /Progression du lab/ }).first();
    await tracker.scrollIntoViewIfNeeded();
    await tracker.locator('input[type="checkbox"]').first().waitFor({ state: 'visible' });
    await page.waitForTimeout(200);
  });

  test('rend les steps avec compteur 0/N', async ({ page }) => {
    const tracker = page.getByRole('group', { name: /Progression du lab/ }).first();
    await expect(tracker).toBeVisible();

    const checkboxes = tracker.locator('input[type="checkbox"]');
    const total = await checkboxes.count();
    expect(total).toBeGreaterThan(0);

    // Compteur affiché
    const counter = tracker.getByText(new RegExp(`0/${total}`));
    await expect(counter).toBeVisible();

    // Aucune checkbox cochée
    for (let i = 0; i < total; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
  });

  test('cocher une étape met à jour le compteur', async ({ page }) => {
    const tracker = page.getByRole('group', { name: /Progression du lab/ }).first();
    const checkboxes = tracker.locator('input[type="checkbox"]');
    const total = await checkboxes.count();

    await checkboxes.first().check();
    await expect(checkboxes.first()).toBeChecked();
    await expect(tracker.getByText(new RegExp(`1/${total}`))).toBeVisible();
  });

  test('persistance : reload conserve les checkboxes', async ({ page }) => {
    const tracker = page.getByRole('group', { name: /Progression du lab/ }).first();
    const checkboxes = tracker.locator('input[type="checkbox"]');
    await checkboxes.first().check();
    await checkboxes.nth(1).check();

    await page.reload();
    await page.waitForLoadState('networkidle');

    const trackerAfter = page.getByRole('group', { name: /Progression du lab/ }).first();
    const checkboxesAfter = trackerAfter.locator('input[type="checkbox"]');
    await expect(checkboxesAfter.first()).toBeChecked();
    await expect(checkboxesAfter.nth(1)).toBeChecked();
  });

  test('tout cocher → message de complétion + Réinitialiser', async ({ page }) => {
    const tracker = page.getByRole('group', { name: /Progression du lab/ }).first();
    const checkboxes = tracker.locator('input[type="checkbox"]');
    const total = await checkboxes.count();

    for (let i = 0; i < total; i++) {
      await checkboxes.nth(i).check();
    }

    // Message "Lab complété"
    const status = tracker.locator('[role="status"]');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/Lab complété/);

    // Bouton Réinitialiser visible
    const resetBtn = tracker.getByRole('button', { name: 'Réinitialiser' });
    await expect(resetBtn).toBeVisible();
  });

  test('Réinitialiser remet 0/N et efface localStorage', async ({ page }) => {
    const tracker = page.getByRole('group', { name: /Progression du lab/ }).first();
    const checkboxes = tracker.locator('input[type="checkbox"]');
    const total = await checkboxes.count();

    await checkboxes.first().check();
    const resetBtn = tracker.getByRole('button', { name: 'Réinitialiser' });
    await resetBtn.click();

    await expect(tracker.getByText(new RegExp(`0/${total}`))).toBeVisible();
    await expect(checkboxes.first()).not.toBeChecked();

    // localStorage : la clé existe mais contient un array vide
    const stored = await page.evaluate(() => {
      const out: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('cm.lab.')) out[k] = window.localStorage.getItem(k) ?? '';
      }
      return out;
    });
    const keys = Object.keys(stored);
    expect(keys.length).toBeGreaterThan(0);
    const arr = JSON.parse(stored[keys[0]]) as string[];
    expect(arr).toEqual([]);
  });
});
