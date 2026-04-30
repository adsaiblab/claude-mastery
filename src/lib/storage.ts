/**
 * Wrapper minimal autour de localStorage — tolérant SSR (build Astro) et
 * incognito strict (Safari private mode lève sur setItem).
 *
 * Les composants interactifs persistent leur état ici pour éviter de
 * redemander les réponses à chaque visite.
 */

const MEMORY_FALLBACK = new Map<string, string>();

function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const k = '__cm_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const HAS_LS = canUseLocalStorage();

export function getItem<T>(key: string, fallback: T): T {
  const raw = HAS_LS ? window.localStorage.getItem(key) : (MEMORY_FALLBACK.get(key) ?? null);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  const serialized = JSON.stringify(value);
  if (HAS_LS) {
    try {
      window.localStorage.setItem(key, serialized);
      return;
    } catch {
      /* fallthrough to in-memory */
    }
  }
  MEMORY_FALLBACK.set(key, serialized);
}

export function removeItem(key: string): void {
  if (HAS_LS) {
    try {
      window.localStorage.removeItem(key);
      return;
    } catch {
      /* fallthrough */
    }
  }
  MEMORY_FALLBACK.delete(key);
}
