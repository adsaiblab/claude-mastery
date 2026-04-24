import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  CompletionSchema,
  ProgressSchema,
  QuizAnswerSchema,
  type Completion,
  type DbAdapter,
  type Progress,
  type QuizAnswer,
} from './types';

/**
 * Adaptateur JSON local — stocke la progression dans src/data/progress.json.
 *
 * Utilisé en dev (PUBLIC_ENV=local). En production (PUBLIC_ENV=production),
 * le loader `db.ts` sélectionne l'adaptateur Supabase à la place.
 *
 * Les écritures sont sérialisées par un verrou mutex en mémoire pour éviter
 * les races sur le même process Astro SSR. Acceptable pour dev solo.
 */

const DB_FILE = path.resolve(process.cwd(), 'src/data/progress.json');

interface DbShape {
  schemaVersion: number;
  users: unknown[];
  progress: Progress[];
  completions: Completion[];
  quiz_answers: QuizAnswer[];
}

let writeChain: Promise<unknown> = Promise.resolve();

async function readDb(): Promise<DbShape> {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as DbShape;
    return {
      schemaVersion: parsed.schemaVersion ?? 1,
      users: parsed.users ?? [],
      progress: parsed.progress ?? [],
      completions: parsed.completions ?? [],
      quiz_answers: parsed.quiz_answers ?? [],
    };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { schemaVersion: 1, users: [], progress: [], completions: [], quiz_answers: [] };
    }
    throw err;
  }
}

async function writeDb(db: DbShape): Promise<void> {
  const serialized = JSON.stringify(db, null, 2);
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, serialized, 'utf8');
}

function serialize<T>(op: () => Promise<T>): Promise<T> {
  const next = writeChain.then(op, op);
  writeChain = next.catch(() => undefined);
  return next;
}

export const localAdapter: DbAdapter = {
  async getProgress(userId) {
    const db = await readDb();
    return db.progress.filter((p) => p.user_id === userId);
  },

  async upsertProgress(entry) {
    const parsed = ProgressSchema.parse({
      ...entry,
      updated_at: entry.updated_at ?? new Date().toISOString(),
    });
    return serialize(async () => {
      const db = await readDb();
      const idx = db.progress.findIndex(
        (p) => p.user_id === parsed.user_id && p.module_id === parsed.module_id,
      );
      if (idx === -1) db.progress.push(parsed);
      else db.progress[idx] = parsed;
      await writeDb(db);
      return parsed;
    });
  },

  async listCompletions(userId) {
    const db = await readDb();
    return db.completions.filter((c) => c.user_id === userId);
  },

  async recordCompletion(entry) {
    const parsed = CompletionSchema.parse({
      ...entry,
      completed_at: entry.completed_at ?? new Date().toISOString(),
    });
    return serialize(async () => {
      const db = await readDb();
      const exists = db.completions.some(
        (c) => c.user_id === parsed.user_id && c.item_id === parsed.item_id && c.kind === parsed.kind,
      );
      if (!exists) db.completions.push(parsed);
      await writeDb(db);
      return parsed;
    });
  },

  async recordQuizAnswer(entry) {
    const parsed = QuizAnswerSchema.parse({
      ...entry,
      answered_at: entry.answered_at ?? new Date().toISOString(),
    });
    return serialize(async () => {
      const db = await readDb();
      db.quiz_answers.push(parsed);
      await writeDb(db);
      return parsed;
    });
  },
};
