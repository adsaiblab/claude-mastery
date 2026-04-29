#!/usr/bin/env node
// scripts/seed-local-db.mjs
//
// Seed l'adaptateur JSON local (src/data/progress.json) avec un jeu de
// données réaliste : un user dev (qui matche `dev@local` du middleware) et
// un user "débutant" pour exercer l'UI à différents niveaux d'avancement.
//
// Idempotent : peut être relancé à volonté, écrase progress.json en place.
//
// Usage :
//   node scripts/seed-local-db.mjs            # mode normal (skip si fichier non vide)
//   node scripts/seed-local-db.mjs --force    # écrase systématiquement
//   node scripts/seed-local-db.mjs --reset    # alias --force
//   node scripts/seed-local-db.mjs --dry      # affiche ce qui serait écrit, n'écrit rien
//
// Lecture de la base : `cat src/data/progress.json`. Le format suit le
// DbShape de src/lib/db-local.ts (schemaVersion + 4 collections).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DB_FILE = path.join(REPO_ROOT, 'src/data/progress.json');

const argv = new Set(process.argv.slice(2));
const FORCE = argv.has('--force') || argv.has('--reset');
const DRY = argv.has('--dry') || argv.has('--dry-run');

// ─────────────── Données seed ───────────────

// Le UUID dev@local correspond à LOCAL_DEV_USER dans src/lib/auth.ts.
// On le replique ici pour que la progression seedée s'affiche directement.
const DEV_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@local',
  created_at: '2026-04-01T08:00:00.000Z',
};

const NEWBIE_USER = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'alice@example.com',
  created_at: '2026-04-15T14:30:00.000Z',
};

// Modules canoniques (slugs des dossiers sous src/content/docs/).
// On garde une trace même pour les modules à 100 % — c'est la table de
// progression, pas un journal. percent=100 signale "module terminé".
const DEV_PROGRESS = [
  { module_id: '00-orientation', percent: 100 },
  { module_id: '01-fondations', percent: 100 },
  { module_id: '02-cli-mastery', percent: 100 },
  { module_id: '03-multi-agents', percent: 100 },
  { module_id: '04-production', percent: 80 },
  { module_id: '05-expert', percent: 40 },
];

const NEWBIE_PROGRESS = [
  { module_id: '00-orientation', percent: 100 },
  { module_id: '01-fondations', percent: 65 },
];

// Quiz/labs/lab_steps complétés. `kind` parmi 'quiz' | 'lab_step' | 'lab'.
const DEV_COMPLETIONS = [
  { item_id: 'quiz-orientation', kind: 'quiz' },
  { item_id: 'quiz-fondations-claude-md', kind: 'quiz' },
  { item_id: 'quiz-cli-flags', kind: 'quiz' },
  { item_id: 'quiz-hooks', kind: 'quiz' },
  { item_id: 'quiz-subagents', kind: 'quiz' },
  { item_id: 'lab-01-setup', kind: 'lab' },
  { item_id: 'lab-02-hooks', kind: 'lab' },
  { item_id: 'lab-03-agents', kind: 'lab' },
  { item_id: 'lab-04-routines:step-cron', kind: 'lab_step' },
  { item_id: 'lab-04-routines:step-webhook', kind: 'lab_step' },
];

const NEWBIE_COMPLETIONS = [
  { item_id: 'quiz-orientation', kind: 'quiz' },
  { item_id: 'lab-01-setup', kind: 'lab' },
];

// Réponses de quiz — mix correct/incorrect pour exercer le composant Quiz.
const DEV_QUIZ_ANSWERS = [
  { quiz_id: 'quiz-orientation', chosen_index: 1, correct: true },
  { quiz_id: 'quiz-fondations-claude-md', chosen_index: 0, correct: true },
  { quiz_id: 'quiz-fondations-context-window', chosen_index: 2, correct: false },
  { quiz_id: 'quiz-fondations-context-window', chosen_index: 0, correct: true },
  { quiz_id: 'quiz-cli-flags', chosen_index: 3, correct: true },
  { quiz_id: 'quiz-hooks', chosen_index: 1, correct: false },
  { quiz_id: 'quiz-hooks', chosen_index: 2, correct: true },
  { quiz_id: 'quiz-subagents', chosen_index: 0, correct: true },
];

const NEWBIE_QUIZ_ANSWERS = [
  { quiz_id: 'quiz-orientation', chosen_index: 0, correct: false },
  { quiz_id: 'quiz-orientation', chosen_index: 1, correct: true },
];

// ─────────────── Construction du shape ───────────────

function timestamps(daysAgo) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

function buildSeed() {
  const progress = [
    ...DEV_PROGRESS.map((p, i) => ({
      user_id: DEV_USER.id,
      module_id: p.module_id,
      percent: p.percent,
      updated_at: timestamps(DEV_PROGRESS.length - i),
    })),
    ...NEWBIE_PROGRESS.map((p, i) => ({
      user_id: NEWBIE_USER.id,
      module_id: p.module_id,
      percent: p.percent,
      updated_at: timestamps(NEWBIE_PROGRESS.length - i),
    })),
  ];

  const completions = [
    ...DEV_COMPLETIONS.map((c, i) => ({
      user_id: DEV_USER.id,
      item_id: c.item_id,
      kind: c.kind,
      completed_at: timestamps(DEV_COMPLETIONS.length - i),
    })),
    ...NEWBIE_COMPLETIONS.map((c, i) => ({
      user_id: NEWBIE_USER.id,
      item_id: c.item_id,
      kind: c.kind,
      completed_at: timestamps(NEWBIE_COMPLETIONS.length - i),
    })),
  ];

  const quiz_answers = [
    ...DEV_QUIZ_ANSWERS.map((q, i) => ({
      user_id: DEV_USER.id,
      quiz_id: q.quiz_id,
      chosen_index: q.chosen_index,
      correct: q.correct,
      answered_at: timestamps(DEV_QUIZ_ANSWERS.length - i),
    })),
    ...NEWBIE_QUIZ_ANSWERS.map((q, i) => ({
      user_id: NEWBIE_USER.id,
      quiz_id: q.quiz_id,
      chosen_index: q.chosen_index,
      correct: q.correct,
      answered_at: timestamps(NEWBIE_QUIZ_ANSWERS.length - i),
    })),
  ];

  return {
    schemaVersion: 1,
    users: [DEV_USER, NEWBIE_USER],
    progress,
    completions,
    quiz_answers,
  };
}

// ─────────────── Validation minimale ───────────────
//
// On reproduit ici en JS pur les contraintes essentielles des schémas Zod
// de src/lib/types.ts. Cela garantit que le seed reste cohérent avec
// l'adaptateur sans dépendre d'un build TypeScript.
function validate(db) {
  const errors = [];

  for (const p of db.progress) {
    if (typeof p.user_id !== 'string') errors.push(`progress.user_id manquant`);
    if (typeof p.module_id !== 'string') errors.push(`progress.module_id manquant`);
    if (typeof p.percent !== 'number' || p.percent < 0 || p.percent > 100) {
      errors.push(`progress.percent hors borne: ${p.percent}`);
    }
  }

  for (const c of db.completions) {
    if (!['quiz', 'lab_step', 'lab'].includes(c.kind)) {
      errors.push(`completions.kind invalide: ${c.kind}`);
    }
  }

  for (const q of db.quiz_answers) {
    if (typeof q.chosen_index !== 'number' || !Number.isInteger(q.chosen_index) || q.chosen_index < 0) {
      errors.push(`quiz_answers.chosen_index invalide: ${q.chosen_index}`);
    }
    if (typeof q.correct !== 'boolean') errors.push(`quiz_answers.correct doit être booléen`);
  }

  if (errors.length > 0) {
    throw new Error(`Seed invalide :\n  - ${errors.join('\n  - ')}`);
  }
}

// ─────────────── Main ───────────────
async function main() {
  const seed = buildSeed();
  validate(seed);

  const summary = [
    `users:        ${seed.users.length}`,
    `progress:     ${seed.progress.length}`,
    `completions:  ${seed.completions.length}`,
    `quiz_answers: ${seed.quiz_answers.length}`,
  ];

  if (DRY) {
    console.log('[seed-local-db] DRY RUN — rien n\'est écrit');
    console.log('[seed-local-db] Cible :', path.relative(REPO_ROOT, DB_FILE));
    console.log(summary.map((s) => '  ' + s).join('\n'));
    return;
  }

  // Si le fichier existe et contient des données significatives, on demande
  // --force avant d'écraser. On considère "non vide" : au moins une entrée
  // dans progress, completions ou quiz_answers.
  let existing = null;
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    existing = JSON.parse(raw);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  const hasData =
    existing &&
    ((existing.progress?.length ?? 0) > 0 ||
      (existing.completions?.length ?? 0) > 0 ||
      (existing.quiz_answers?.length ?? 0) > 0);

  if (hasData && !FORCE) {
    console.error('[seed-local-db] progress.json contient déjà des données.');
    console.error('[seed-local-db] Utilise --force pour écraser, --dry pour prévisualiser.');
    process.exit(2);
  }

  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(seed, null, 2) + '\n', 'utf8');

  console.log('[seed-local-db] ✓ écrit', path.relative(REPO_ROOT, DB_FILE));
  console.log(summary.map((s) => '  ' + s).join('\n'));
  console.log(`[seed-local-db] users : ${DEV_USER.email} (Expert), ${NEWBIE_USER.email}`);
}

main().catch((err) => {
  console.error('[seed-local-db] échec :', err.message);
  process.exit(1);
});
