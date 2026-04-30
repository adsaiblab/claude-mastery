import { test, expect } from '@playwright/test';

/**
 * Quiz — composant le plus utilisé. Cycle de vie testé :
 *   - rendu initial : question + N options, pas d'explication
 *   - clic sur option correcte → ✓, lock, persistance
 *   - clic sur option incorrecte → ✗, message, bouton Réessayer
 *   - rechargement → état restauré depuis localStorage
 *   - reset → retour au state initial
 *
 * Page cible : /00-orientation/ecosystem-map/ — contient plusieurs Quiz.
 * On cible le PREMIER quiz de la page (celui le plus haut dans le DOM)
 * pour rester déterministe quand le contenu évolue.
 */

const PAGE_URL = '/00-orientation/ecosystem-map/';

test.describe('Quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
    // Reset localStorage pour partir d'un état propre
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Le Quiz est hydraté en `client:visible` — il faut le faire entrer dans
    // le viewport pour que React l'hydrate, puis attendre que les handlers
    // soient attachés (probe via aria-pressed sur un bouton).
    const firstQuiz = page.getByRole('group', { name: 'Question de vérification' }).first();
    await firstQuiz.scrollIntoViewIfNeeded();
    await firstQuiz.locator('button[aria-pressed]').first().waitFor({ state: 'visible' });
    // Petite attente pour s'assurer que React a fini d'attacher les listeners.
    await page.waitForTimeout(300);
  });

  test('rend la question + options sans explication initiale', async ({ page }) => {
    const quiz = page.getByRole('group', { name: 'Question de vérification' }).first();
    await expect(quiz).toBeVisible();

    // Au moins 2 options (boutons aria-pressed)
    const options = quiz.locator('button[aria-pressed]');
    await expect(options).not.toHaveCount(0);
    expect(await options.count()).toBeGreaterThanOrEqual(2);

    // Aucune explication visible avant interaction
    await expect(quiz.locator('[role="status"]')).toHaveCount(0);
  });

  test('clic sur une option révèle une explication', async ({ page }) => {
    const quiz = page.getByRole('group', { name: 'Question de vérification' }).first();
    const firstOption = quiz.locator('button[aria-pressed]').first();
    await firstOption.click();

    // Une explication apparaît
    const explanation = quiz.locator('[role="status"]');
    await expect(explanation).toBeVisible();
    // Soit "✓ Correct" soit "✗ Pas tout à fait" selon l'option choisie
    const text = await explanation.textContent();
    expect(text).toMatch(/Correct|Pas tout à fait/);

    // L'option choisie est marquée aria-pressed=true
    await expect(firstOption).toHaveAttribute('aria-pressed', 'true');
  });

  test('option correcte → lock + persistance après reload', async ({ page }) => {
    // On cherche l'option correcte en lisant les classes CSS révélées
    const quiz = page.getByRole('group', { name: 'Question de vérification' }).first();
    const options = quiz.locator('button[aria-pressed]');
    const count = await options.count();

    // Stratégie : cliquer chaque option jusqu'à trouver "Correct"
    let correctIndex = -1;
    for (let i = 0; i < count; i++) {
      await options.nth(i).click();
      const explanation = quiz.locator('[role="status"]');
      const text = (await explanation.textContent()) ?? '';
      if (text.includes('Correct')) {
        correctIndex = i;
        break;
      }
      // Si retry présent, reset pour essayer la suivante
      const retryBtn = quiz.getByRole('button', { name: 'Réessayer' });
      if (await retryBtn.isVisible()) {
        await retryBtn.click();
      }
    }
    expect(correctIndex).toBeGreaterThanOrEqual(0);

    // Une fois la bonne réponse trouvée, toutes les autres options sont disabled
    const otherOption = options.nth(correctIndex === 0 ? 1 : 0);
    await expect(otherOption).toBeDisabled();

    // Reload → état restauré
    await page.reload();
    await page.waitForLoadState('networkidle');
    const quizAfter = page.getByRole('group', { name: 'Question de vérification' }).first();
    const explanationAfter = quizAfter.locator('[role="status"]');
    await expect(explanationAfter).toBeVisible();
    await expect(explanationAfter).toContainText('Correct');
  });

  test('option incorrecte → user peut cliquer une autre option (mode retry)', async ({ page }) => {
    // En mode retry=true (défaut), il n'y a pas de bouton "Réessayer" : si la
    // première réponse est fausse, le composant ne lock pas et l'utilisateur
    // peut directement cliquer une autre option. L'explication change selon
    // la dernière option cliquée.
    const quiz = page.getByRole('group', { name: 'Question de vérification' }).first();
    const options = quiz.locator('button[aria-pressed]');
    const count = await options.count();

    // Cliquer la première option, voir si c'est correct
    await options.first().click();
    const explanation = quiz.locator('[role="status"]');
    await expect(explanation).toBeVisible();
    const firstText = (await explanation.textContent()) ?? '';

    if (firstText.includes('Correct')) {
      // Premier clic correct → autres options désactivées (locked).
      // Vérifie le contrat lock.
      for (let i = 1; i < count; i++) {
        await expect(options.nth(i)).toBeDisabled();
      }
      return;
    }

    // Sinon : option fausse, pas de lock — on doit pouvoir cliquer une autre.
    expect(firstText).toMatch(/Pas tout à fait/);
    for (let i = 1; i < count; i++) {
      await expect(options.nth(i)).toBeEnabled();
    }
    // Cliquer une autre option : l'explication change.
    await options.nth(1).click();
    const newText = (await explanation.textContent()) ?? '';
    // Soit la nouvelle est correcte (lock), soit toujours wrong (mais explanation différente)
    expect(newText.length).toBeGreaterThan(0);
    // L'aria-pressed du nouveau bouton doit être true
    await expect(options.nth(1)).toHaveAttribute('aria-pressed', 'true');
  });

  test('persistance localStorage écrit la clé cm.quiz.*', async ({ page }) => {
    const quiz = page.getByRole('group', { name: 'Question de vérification' }).first();
    await quiz.locator('button[aria-pressed]').first().click();

    const storage = await page.evaluate(() => {
      const out: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('cm.quiz.')) out[k] = window.localStorage.getItem(k) ?? '';
      }
      return out;
    });
    const keys = Object.keys(storage);
    expect(keys.length).toBeGreaterThan(0);

    const value = JSON.parse(storage[keys[0]]) as { chosen: number; correct: boolean };
    expect(value).toHaveProperty('chosen');
    expect(value).toHaveProperty('correct');
  });
});
