import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { astroCookieAdapter } from '../../../lib/supabase-cookies';

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
    return context.redirect(`/login?error=${encodeURIComponent('Supabase non configuré')}`, 302);
  }

  const supabase = createServerClient(url, anon, {
    cookies: astroCookieAdapter(context),
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
