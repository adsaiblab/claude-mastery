import { z } from 'zod';

/**
 * Types partagés entre l'adaptateur JSON local et Supabase.
 * Les schémas Zod sont aussi utilisés en runtime pour valider les données
 * qui transitent par l'API (inputs utilisateur, réponses Supabase).
 */

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.string().datetime().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const ProgressSchema = z.object({
  user_id: z.string(),
  module_id: z.string(),
  percent: z.number().min(0).max(100),
  updated_at: z.string().datetime().optional(),
});
export type Progress = z.infer<typeof ProgressSchema>;

export const CompletionSchema = z.object({
  user_id: z.string(),
  item_id: z.string(),
  kind: z.enum(['quiz', 'lab_step', 'lab']),
  completed_at: z.string().datetime().optional(),
});
export type Completion = z.infer<typeof CompletionSchema>;

export const QuizAnswerSchema = z.object({
  user_id: z.string(),
  quiz_id: z.string(),
  chosen_index: z.number().int().min(0),
  correct: z.boolean(),
  answered_at: z.string().datetime().optional(),
});
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;

export interface DbAdapter {
  getProgress(userId: string): Promise<Progress[]>;
  upsertProgress(entry: Progress): Promise<Progress>;
  listCompletions(userId: string): Promise<Completion[]>;
  recordCompletion(entry: Completion): Promise<Completion>;
  recordQuizAnswer(entry: QuizAnswer): Promise<QuizAnswer>;
}
