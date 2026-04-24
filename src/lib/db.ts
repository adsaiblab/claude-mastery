import type { DbAdapter } from './types';
import { localAdapter } from './db-local';
import { supabaseAdapter } from './db-supabase';

/**
 * Loader d'adaptateur DB.
 *
 * En dev (PUBLIC_ENV=local ou non défini) → JSON local dans src/data/progress.json.
 * En prod (PUBLIC_ENV=production)          → Supabase self-hosted.
 *
 * Les composants et API routes importent uniquement `db` ; ils ignorent
 * quelle implémentation est derrière. Ce switch évite de bloquer le
 * développement en Session 1 avant la mise en place du VPS.
 */

const mode = import.meta.env.PUBLIC_ENV ?? 'local';

export const db: DbAdapter = mode === 'production' ? supabaseAdapter : localAdapter;

export type { DbAdapter };
export * from './types';
