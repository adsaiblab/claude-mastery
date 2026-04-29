import type { APIContext } from 'astro';
import type { CookieOptionsWithName } from '@supabase/ssr';

type SupabaseCookie = { name: string; value: string; options?: CookieOptionsWithName };

export function astroCookieAdapter(context: APIContext) {
  return {
    getAll(): SupabaseCookie[] {
      const header = context.request.headers.get('cookie') ?? '';
      if (!header) return [];
      return header
        .split(';')
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => {
          const eq = c.indexOf('=');
          if (eq === -1) return { name: c, value: '' };
          return {
            name: c.slice(0, eq),
            value: decodeURIComponent(c.slice(eq + 1)),
          };
        });
    },
    setAll(cookiesToSet: SupabaseCookie[]) {
      cookiesToSet.forEach(({ name, value, options }) => {
        context.cookies.set(name, value, options);
      });
    },
  };
}
