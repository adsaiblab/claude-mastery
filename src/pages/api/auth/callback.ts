import type { APIRoute } from 'astro';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const prerender = false;

/**
 * Callback OAuth/OTP Supabase.
 *
 * Reçoit le `code` ou `token_hash` depuis le lien magique, le valide via
 * `exchangeCodeForSession`, pose les cookies, puis redirige vers `returnTo`.
 */
export const GET: APIRoute = async (context) => {
  const code = context.url.searchParams.get('code');
  const returnTo = context.url.searchParams.get('returnTo') ?? '/';

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return context.redirect(
      `/login?error=${encodeURIComponent('Supabase non configuré')}`,
      302,
    );
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      get: (k: string) => context.cookies.get(k)?.value,
      set: (k: string, v: string, o: CookieOptions) => context.cookies.set(k, v, o),
      remove: (k: string, o: CookieOptions) => context.cookies.delete(k, o),
    },
  });

  if (!code) {
    return context.redirect(`/login?error=${encodeURIComponent('Code manquant')}`, 302);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return context.redirect(`/login?error=${encodeURIComponent(error.message)}`, 302);
  }

  return context.redirect(returnTo, 302);
};
