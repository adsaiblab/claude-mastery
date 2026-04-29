import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { isLocalMode } from '../../../lib/auth';
import { astroCookieAdapter } from '../../../lib/supabase-cookies';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (isLocalMode()) return context.redirect('/', 302);

  const url = import.meta.env.PUBLIC_SUPABASE_URL!;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(url, anon, {
    cookies: astroCookieAdapter(context),
  });

  await supabase.auth.signOut();
  return context.redirect('/', 302);
};
