import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { APIContext } from 'astro';

/**
 * Création d'un client Supabase côté serveur qui lit/écrit les cookies
 * de session. Utilisé par le middleware et par les routes API.
 *
 * En mode local (PUBLIC_ENV=local), l'auth est désactivée : le middleware
 * attribue un user stub "dev@local" marqué expert. Ça permet de
 * développer les sections protégées sans lancer Supabase.
 */

const LOCAL_DEV_USER: App.Locals['user'] = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@local',
};

export function isLocalMode(): boolean {
  return (import.meta.env.PUBLIC_ENV ?? 'local') !== 'production';
}

export function localDevLocals(): App.Locals {
  return { user: LOCAL_DEV_USER, isExpert: true };
}

export interface AuthContext {
  user: App.Locals['user'];
  isExpert: boolean;
}

function expertAllowList(): Set<string> {
  const raw = import.meta.env.EXPERT_USER_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function resolveAuth(context: APIContext): Promise<AuthContext> {
  if (isLocalMode()) {
    return { user: LOCAL_DEV_USER, isExpert: true };
  }

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { user: null, isExpert: false };
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(key: string) {
        return context.cookies.get(key)?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        context.cookies.set(key, value, options);
      },
      remove(key: string, options: CookieOptions) {
        context.cookies.delete(key, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { user: null, isExpert: false };

  const allow = expertAllowList();
  const isExpert = allow.has(user.email.toLowerCase());

  return {
    user: { id: user.id, email: user.email },
    isExpert,
  };
}
