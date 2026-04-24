import type { APIRoute } from 'astro';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { isLocalMode } from '../../../lib/auth';

export const prerender = false;

/**
 * Envoie un magic link Supabase.
 *
 * En mode local, renvoie simplement un 302 vers returnTo car l'auth est
 * stubée dans le middleware (dev@local est toujours Expert).
 */
export const POST: APIRoute = async (context) => {
  const form = await context.request.formData();
  const email = String(form.get('email') ?? '').trim();
  const returnTo = String(form.get('returnTo') ?? '/');

  if (isLocalMode()) {
    return context.redirect(returnTo, 302);
  }

  if (!email) {
    return context.redirect(`/login?error=${encodeURIComponent('Email manquant')}`, 302);
  }

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

  const siteUrl = import.meta.env.PUBLIC_SITE_URL ?? context.url.origin;
  const emailRedirectTo = `${siteUrl}/api/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo },
  });

  if (error) {
    return context.redirect(`/login?error=${encodeURIComponent(error.message)}`, 302);
  }

  return context.redirect(`/login?sent=1`, 302);
};
