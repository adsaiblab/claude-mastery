# Claude Code Mastery Path

Plateforme d'auto-formation modulaire sur l'écosystème Claude — 5 niveaux progressifs, labs interactifs, quiz, flashcards.

Stack : **Astro 5 SSR** + **Starlight** + **React 19** + **Tailwind** + **Supabase** (self-hosted en prod, JSON local en dev).

## Setup local (mode dev)

```bash
cp .env.example .env          # PUBLIC_ENV=local — tout fonctionne sans Supabase
npm install
npm run dev                    # → http://localhost:4321
```

En mode `local` :
- La DB est un fichier JSON (`src/data/progress.json`), écrit avec un mutex.
- L'auth est stubée : tu es reconnu comme `dev@local` et tu as accès à la section Expert.

## Modes

| `PUBLIC_ENV` | DB adapter | Auth |
|--------------|------------|------|
| `local` (défaut dev) | `src/data/progress.json` | stub `dev@local`, Expert auto |
| `production` | Supabase (client `@supabase/supabase-js`) | magic link + Supabase Auth |

L'abstraction est dans [`src/lib/db.ts`](src/lib/db.ts) — un seul import, swap transparent.

## Architecture

```
claude-mastery/
├── src/
│   ├── content/docs/           # MDX — 5 niveaux + référence + patterns
│   ├── components/             # Astro (Header, Footer, Planned, Situation)
│   │   └── interactive/        # React (Quiz, FlipCard, LabProgress, …)
│   ├── lib/                    # db.ts, auth.ts, storage.ts, types.ts
│   ├── middleware/             # auth + expert gate
│   ├── pages/                  # login, /api/auth/*
│   ├── data/progress.json      # DB locale (gitignore)
│   └── styles/                 # custom.css + tailwind.css
├── supabase/migrations/        # 0001_init.sql (RLS + policies)
├── labs/                       # 5 labs, chacun avec setup.sh + validate.sh
├── scripts/                    # validate-all-labs.sh + seed-local-db.mjs
├── anki-decks/                 # Decks .apkg exportés depuis les flashcards (offline)
├── obsidian-vault/             # Vault graph-of-thought (concepts/, links/)
├── Dockerfile                  # Multi-stage Node 20 (deps → build → runner)
├── docker-compose.yml
└── .coolify/                   # Config deploy Coolify
```

### `anki-decks/`

Export Anki des flashcards (`src/content/docs/flashcards/`) au format `.apkg`,
pour réviser hors-ligne avec spaced repetition. Un deck par niveau (`n0.apkg`
… `n5.apkg`). Le dossier est versionné mais le contenu est régénéré
manuellement à partir des MDX (pas de pipeline auto pour le moment) — voir
le script de génération prévu dans le backlog (`scripts/build-anki.mjs`).

Vide aujourd'hui : c'est un répertoire de sortie, pas une source. Les
flashcards canoniques restent dans `src/content/docs/flashcards/`.

### `obsidian-vault/`

Vault Obsidian structuré en graph-of-thought :

- `concepts/` — une note par primitive Claude (subagent, hook, MCP, …) avec
  liens `[[wiki-style]]` vers les concepts adjacents.
- `links/` — notes-pivot qui relient plusieurs concepts (« Comparaison
  hooks vs MCP », « Quand préférer fan-out à pipeline », etc.).

C'est l'index personnel de l'apprenant, complémentaire au cours linéaire :
le cours raconte une histoire, le vault permet de naviguer transversalement.
Vide aujourd'hui — alimenté au fur et à mesure pendant le parcours, pas un
livrable du repo.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev (port 4321) |
| `npm run build` | `astro check && astro build` |
| `npm run build:nocheck` | Build sans `astro check` (CI rapide) |
| `npm run start` | Lance le serveur SSR build (`dist/server/entry.mjs`) |
| `npm run preview` | Preview du build SSR |
| `npm run typecheck` | `astro check` uniquement |
| `npm run lint` | ESLint sur `src/**/*.{ts,tsx}` |
| `npm run lint:md` | Remark lint MDX/Markdown du contenu |
| `npm run format` | Prettier --write sur `src/**/*` |
| `npm run format:check` | Prettier --check (CI) |
| `npm run labs:validate` | Valide tous les labs sur leur solution canonique |
| `npm run db:seed` | Seed `src/data/progress.json` avec données de test (`-- --force` pour écraser) |
| `npm run test:e2e` | Tests Playwright sur les composants interactifs (headless) |
| `npm run test:e2e:ui` | Tests E2E en mode UI Playwright (debug interactif) |

## Labs

Chaque lab est auto-contenu :

```bash
cd labs/lab-02-hooks
./setup.sh         # clone starter/ dans work/
# … travaille dans work/ …
./validate.sh      # sortie colorée binaire (✓ / ✗)
```

Structure détaillée : [`labs/README.md`](labs/README.md).

## Déploiement

Voir [`.coolify/README.md`](.coolify/README.md). Résumé :

1. Stack Supabase self-hosted déjà up sur le Coolify.
2. Nouvelle Application → Dockerfile build → port 4321.
3. Env vars depuis `.env.example` (valeurs prod).
4. `psql -f supabase/migrations/0001_init.sql`.

## Contenu — état d'avancement

La plateforme est livrée en **10 sessions**. Tout le contenu est désormais en place ; la phase courante est **déploiement & polish**.

- **Session 1** ✓ — Infra + composants React + auth + DB adapter.
- **Session 2** ✓ — Orientation (00) + splash + quiz scoré.
- **Session 3** ✓ — Fondations (01) — CLAUDE.md, mémoire, modes.
- **Session 4** ✓ — CLI Mastery (02) + Lab 01 (CLAUDE.md mémoire).
- **Session 5** ✓ — Multi-agents (03) + Lab 02 (hooks).
- **Session 6** ✓ — Référence + patterns + Lab 03 (subagents fan-out).
- **Session 7** ✓ — Production (04) — sécurité, headless, observabilité.
- **Session 8** ✓ — Routines (cron + webhook + idempotence) + Lab 04.
- **Session 9** ✓ — Expert (05) + Lab 05 (capstone freeform).
- **Session 10** ✓ — Flashcards N0–N5 (6 decks × 8 cartes).

Phase courante : déploiement Coolify + polish (audit deps, ESLint, smoke tests).

## Licence

Usage personnel. Tout contenu issu des docs publiques Anthropic est référencé — toute section `⚠️ À vérifier` signale un point potentiellement post-cutoff à valider en live.
