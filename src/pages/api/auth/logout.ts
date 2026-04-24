import type { APIRoute } from 'astro';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { isLocalMode } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (isLocalMode()) return context.redirect('/', 302);

  const url = import.meta.env.PUBLIC_SUPABASE_URL!;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(url, anon, {
    cookies: {
      get: (k: string) => context.cookies.get(k)?.value,
      set: (k: string, v: string, o: CookieOptions) => context.cookies.set(k, v, o),
      remove: (k: string, o: CookieOptions) => context.cookies.delete(k, o),
    },
  });

  await supabase.auth.signOut();
  return context.redirect('/', 302);
};
