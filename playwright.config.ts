import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E composants interactifs.
 *
 * - `webServer` : build le projet une fois puis lance le serveur SSR sur le
 *   port 4322 (pour ne pas collisionner avec un dev server à 4321).
 * - `PUBLIC_ENV=local` : auth stubée → on ne teste pas Supabase, on teste
 *   le comportement client des composants React.
 * - Un seul project (Chromium) — les composants sont des React standard, pas
 *   de comportement spécifique browser. Multi-browser ajouté à la demande.
 *
 * Lancement :
 *   npm run test:e2e          # headless
 *   npm run test:e2e:ui       # mode interactif Playwright UI
 *   npm run test:e2e:debug    # debugger headed
 */

const PORT = process.env.E2E_PORT ?? '4322';
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  // Timeout par test (un test E2E navigue + attend hydration React).
  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL: BASE_URL,
    // Chaque test démarre avec un context propre — pas de pollution
    // localStorage entre tests.
    storageState: { cookies: [], origins: [] },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npm run build:nocheck && PUBLIC_ENV=local PORT=${PORT} HOST=127.0.0.1 node ./dist/server/entry.mjs`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
