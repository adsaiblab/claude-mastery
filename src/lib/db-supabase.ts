import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { CompletionSchema, ProgressSchema, QuizAnswerSchema, type DbAdapter } from './types';

/**
 * Adaptateur Supabase — utilisé en production (PUBLIC_ENV=production).
 *
 * Le schéma SQL est dans supabase/migrations/0001_init.sql.
 * Les policies RLS garantissent qu'un user ne voit que ses propres lignes.
 */

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase manque PUBLIC_SUPABASE_URL ou clé. Vérifie .env (voir .env.example).',
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const supabaseAdapter: DbAdapter = {
  async getProgress(userId) {
    const { data, error } = await getClient().from('progress').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map((row) => ProgressSchema.parse(row));
  },

  async upsertProgress(entry) {
    const parsed = ProgressSchema.parse({
      ...entry,
      updated_at: entry.updated_at ?? new Date().toISOString(),
    });
    const { data, error } = await getClient()
      .from('progress')
      .upsert(parsed, { onConflict: 'user_id,module_id' })
      .select()
      .single();
    if (error) throw error;
    return ProgressSchema.parse(data);
  },

  async listCompletions(userId) {
    const { data, error } = await getClient().from('completions').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map((row) => CompletionSchema.parse(row));
  },

  async recordCompletion(entry) {
    const parsed = CompletionSchema.parse({
      ...entry,
      completed_at: entry.completed_at ?? new Date().toISOString(),
    });
    const { data, error } = await getClient()
      .from('completions')
      .upsert(parsed, { onConflict: 'user_id,item_id,kind' })
      .select()
      .single();
    if (error) throw error;
    return CompletionSchema.parse(data);
  },

  async recordQuizAnswer(entry) {
    const parsed = QuizAnswerSchema.parse({
      ...entry,
      answered_at: entry.answered_at ?? new Date().toISOString(),
    });
    const { data, error } = await getClient().from('quiz_answers').insert(parsed).select().single();
    if (error) throw error;
    return QuizAnswerSchema.parse(data);
  },
};

export function _resetClientForTests(): void {
  client = null;
}
