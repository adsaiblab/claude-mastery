# Tests E2E — composants interactifs

Tests Playwright qui drivent un Chromium headless sur le build SSR du site.
Couvrent les 5 composants React montés en MDX du contenu :

| Spec                       | Composant       | Page testée                            | Tests |
| -------------------------- | --------------- | -------------------------------------- | ----- |
| `quiz.spec.ts`             | Quiz            | `/00-orientation/ecosystem-map/`       | 5     |
| `flipcard.spec.ts`         | FlipCard        | `/00-orientation/`                     | 5     |
| `lab-progress.spec.ts`     | LabProgress     | `/01-fondations/lab-01/`               | 5     |
| `orientation-quiz.spec.ts` | OrientationQuiz | `/00-orientation/quiz-orientation/`    | 5     |
| `progress-tracker.spec.ts` | ProgressTracker | `/`                                    | 5     |

## Lancer

```bash
# Headless (CI-like)
npm run test:e2e

# Mode UI Playwright (interactif, debug, replay)
npm run test:e2e:ui

# Mode debug (Playwright Inspector, headed)
npm run test:e2e:debug
```

Le `webServer` de [`playwright.config.ts`](../../playwright.config.ts) build
le site (`npm run build:nocheck`) puis lance le serveur SSR sur le port 4322
avant la première spec. Le port est volontairement différent du dev server
(4321) pour éviter les collisions.

## Conventions

- Chaque test commence par `await page.evaluate(() => window.localStorage.clear())`
  puis `page.reload()` pour partir d'un état déterministe.
- Les selectors privilégient `getByRole(..., { name: ... })` plutôt que
  des CSS — moins fragiles aux refactors de styling.
- Les tests qui dépendent de la **persistance** vérifient à la fois
  l'effet visible (DOM) et la clé localStorage (`cm.quiz.*`, `cm.lab.*`,
  `cm.orientation.*`).
- Pas d'attente fixe : `waitForLoadState('networkidle')` après navigation,
  `waitForTimeout(150-300ms)` uniquement quand on a besoin de laisser
  React re-render après un `dispatchEvent('focus')`.

## Composants non couverts

Trois composants existent dans `src/components/interactive/` mais ne sont
pas montés dans le contenu MDX :

- `DecisionTree.tsx`
- `ArchitectureChallenge.tsx`
- `Asciinema.tsx`

Ils restent du code orphelin de l'initialisation. Les ignorer est délibéré :
un test E2E sur un composant non rendu n'a pas de valeur. Quand l'un est
mounté dans une page MDX, ajouter une spec correspondante ici.

## Auth dans les tests

Tous les tests tournent en `PUBLIC_ENV=local` (cf. `playwright.config.ts`).
L'auth Supabase est stubée par le middleware → l'utilisateur est `dev@local`
en mode Expert. Aucun login flow n'est testé ici — c'est le scope d'une
spec future quand on voudra vérifier les pages protégées.
