import { test, expect } from '@playwright/test';

/**
 * OrientationQuiz — quiz multi-questions avec scoring par profil.
 * Tests :
 *   - rendu : "Question 1 / N"
 *   - répondre à toutes les questions → écran Résultat avec un profil
 *   - persistance : reload après quelques réponses → on reprend où on en était
 *   - bouton Recommencer remet l'état à zéro
 */

const PAGE_URL = '/00-orientation/quiz-orientation/';

test.describe('OrientationQuiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    const quiz = page.getByRole('group', { name: "Quiz d'orientation" });
    await quiz.scrollIntoViewIfNeeded();
    await quiz.locator('button').first().waitFor({ state: 'visible' });
    await page.waitForTimeout(200);
  });

  test('démarre à la question 1 / N', async ({ page }) => {
    const quiz = page.getByRole('group', { name: "Quiz d'orientation" });
    await expect(quiz).toBeVisible();

    // Format "Question 1 / N"
    const counter = quiz.getByText(/Question\s+1\s*\/\s*\d+/);
    await expect(counter).toBeVisible();
  });

  async function answerAllQuestions(page: import('@playwright/test').Page) {
    // Lit dynamiquement le total de questions depuis le compteur
    const quiz = page.getByRole('group', { name: "Quiz d'orientation" });
    const counterText = await quiz
      .locator('text=/Question\\s+\\d+\\s*\\/\\s*\\d+/')
      .first()
      .textContent();
    const m = counterText?.match(/Question\s+\d+\s*\/\s*(\d+)/);
    const total = m ? Number(m[1]) : 0;
    expect(total).toBeGreaterThan(0);

    for (let i = 0; i < total; i++) {
      // À chaque tour on cherche la première option (hors Précédente / Recommencer)
      const options = page.locator('button[class*="cm-button"]').filter({
        hasNotText: /Précédente|Recommencer|Refaire le quiz|Réessayer/,
      });
      // La première option de la question courante (le composant remonte le scroll)
      await options.first().click();
      // Attendre l'avancement (compteur change OU écran résultat)
      await page.waitForTimeout(150);
    }
    return total;
  }

  test('répondre à toutes les questions affiche le profil', async ({ page }) => {
    await answerAllQuestions(page);

    // Écran résultat — role="status" avec un profil
    const result = page.getByRole('status');
    await expect(result).toBeVisible();
    await expect(result).toContainText(/Ton profil/);

    // Le résultat liste un parcours recommandé
    await expect(result).toContainText(/Ton parcours recommandé/);

    // Au moins un lien dans le parcours
    const links = result.locator('a');
    expect(await links.count()).toBeGreaterThan(0);
  });

  test('persistance : reload conserve la progression', async ({ page }) => {
    // Répondre à 1 question
    const options = page.locator('button[class*="cm-button"]').filter({
      hasNotText: /Précédente|Recommencer/,
    });
    await options.first().click();

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');

    // On doit être sur Question 2 (ou résultat si quiz d'1 question, ce qui n'arrive pas)
    const quiz = page.getByRole('group', { name: "Quiz d'orientation" });
    const counter = quiz.getByText(/Question\s+\d+\s*\/\s*\d+/);
    const text = await counter.textContent();
    const match = text?.match(/Question\s+(\d+)/);
    const current = match ? Number(match[1]) : 1;
    expect(current).toBeGreaterThanOrEqual(2);
  });

  test('Recommencer remet la progression à zéro', async ({ page }) => {
    // Répondre à 1 question
    const options = page.locator('button[class*="cm-button"]').filter({
      hasNotText: /Précédente|Recommencer/,
    });
    await options.first().click();

    // Cliquer Recommencer
    const restartBtn = page.getByRole('button', { name: 'Recommencer' });
    await expect(restartBtn).toBeEnabled();
    await restartBtn.click();

    // Retour à la question 1
    const counter = page.getByText(/Question\s+1\s*\/\s*\d+/);
    await expect(counter).toBeVisible();
  });

  test('persistance écrit cm.orientation.* dans localStorage', async ({ page }) => {
    const options = page.locator('button[class*="cm-button"]').filter({
      hasNotText: /Précédente|Recommencer/,
    });
    await options.first().click();

    const storage = await page.evaluate(() => {
      const out: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('cm.orientation.')) out[k] = window.localStorage.getItem(k) ?? '';
      }
      return out;
    });
    const keys = Object.keys(storage);
    expect(keys.length).toBeGreaterThan(0);

    const value = JSON.parse(storage[keys[0]]) as { answers: Record<string, number> };
    expect(value).toHaveProperty('answers');
    expect(Object.keys(value.answers).length).toBeGreaterThan(0);
  });
});
