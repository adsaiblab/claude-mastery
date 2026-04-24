import { defineMiddleware, sequence } from 'astro:middleware';
import { resolveAuth } from '../lib/auth';

/**
 * Chaîne de middlewares Astro.
 *
 * 1. `authMiddleware` — résout la session Supabase (ou l'utilisateur local
 *     stub en dev) et expose `Astro.locals.user` + `Astro.locals.isExpert`.
 * 2. `expertGateMiddleware` — protège les URLs Expert. Si le visiteur n'est
 *     pas Expert, on redirige vers /login?returnTo=<path>.
 *
 * Les sections protégées sont : `/05-expert/*` et `/architecture-patterns/*`.
 */

const EXPERT_PATH_PREFIXES = ['/05-expert', '/architecture-patterns'];

const authMiddleware = defineMiddleware(async (context, next) => {
  const auth = await resolveAuth(context);
  context.locals.user = auth.user;
  context.locals.isExpert = auth.isExpert;
  return next();
});

const expertGateMiddleware = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const needsExpert = EXPERT_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!needsExpert) return next();
  if (context.locals.isExpert) return next();

  const returnTo = encodeURIComponent(pathname);
  return context.redirect(`/login?returnTo=${returnTo}`, 302);
});

export const onRequest = sequence(authMiddleware, expertGateMiddleware);
