import { test, expect } from '@playwright/test';

/**
 * FlipCard — pas de persistance, juste une UI bascule.
 * Tests :
 *   - rendu initial : recto visible, aria-pressed=false
 *   - clic → flip, aria-pressed=true
 *   - clic re-flip → retour recto
 *   - keyboard Enter / Space → flip
 *   - tabIndex=0 → focusable au clavier
 *
 * Page cible : la première page qui mounte FlipCard, /00-orientation/.
 */

// Page avec beaucoup de FlipCards : un deck de flashcards N0.
const PAGE_URL = '/flashcards/n0/';

test.describe('FlipCard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');

    // FlipCard est aussi hydratée `client:visible` dans Starlight — scroll +
    // attente d'un attribut React-sensitive (aria-pressed='false') pour
    // confirmer que les handlers sont prêts.
    const first = page.getByRole('button', { name: 'Retourner la carte' }).first();
    await first.scrollIntoViewIfNeeded();
    await expect(first).toHaveAttribute('aria-pressed', 'false');
    await page.waitForTimeout(200);
  });

  test('rendu initial : pas flippée', async ({ page }) => {
    const card = page.getByRole('button', { name: 'Retourner la carte' }).first();
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('aria-pressed', 'false');
    await expect(card).toHaveAttribute('tabindex', '0');
  });

  test('clic → flip → aria-pressed bascule', async ({ page }) => {
    const card = page.getByRole('button', { name: 'Retourner la carte' }).first();
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');

    // Le DOM ajoute une classe is-flipped
    await expect(card).toHaveClass(/is-flipped/);

    // Re-clic → retour
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'false');
    await expect(card).not.toHaveClass(/is-flipped/);
  });

  test('Enter au clavier déclenche le flip', async ({ page }) => {
    const card = page.getByRole('button', { name: 'Retourner la carte' }).first();
    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  test('Space au clavier déclenche le flip', async ({ page }) => {
    const card = page.getByRole('button', { name: 'Retourner la carte' }).first();
    await card.focus();
    await page.keyboard.press(' ');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  test('autres touches ne déclenchent pas le flip', async ({ page }) => {
    const card = page.getByRole('button', { name: 'Retourner la carte' }).first();
    await card.focus();
    await page.keyboard.press('a');
    await expect(card).toHaveAttribute('aria-pressed', 'false');
  });
});
