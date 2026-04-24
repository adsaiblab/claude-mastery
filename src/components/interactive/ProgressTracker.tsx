import { useEffect, useMemo, useState } from 'react';
import { getItem } from '../../lib/storage';

export interface TrackedModule {
  id: string;
  label: string;
  /** IDs des quiz ou étapes de lab que ce module doit avoir cochés. */
  requires: string[];
  href?: string;
}

export interface ProgressTrackerProps {
  /** Liste des modules du parcours à observer. */
  modules: TrackedModule[];
  /** Titre du tracker. */
  title?: string;
}

interface CompletionRow {
  id: string;
  label: string;
  done: number;
  total: number;
  href?: string;
}

/**
 * Lit la progression depuis localStorage (écrite par Quiz et LabProgress)
 * et affiche une barre globale + détail par module.
 *
 * La source de vérité en session 1 est `localStorage`. En session 5
 * (Supabase), une sync vers la table `progress` sera ajoutée ici sans
 * changer le contrat visuel du composant.
 */
export default function ProgressTracker({
  modules,
  title = 'Ta progression',
}: ProgressTrackerProps) {
  const [rows, setRows] = useState<CompletionRow[]>([]);

  const compute = useMemo(
    () => () =>
      modules.map<CompletionRow>((m) => {
        const done = m.requires.reduce((acc, key) => {
          if (key.startsWith('lab.')) {
            const labId = key.slice('lab.'.length);
            const stepsDone = getItem<string[]>(`cm.lab.${labId}.done`, []);
            return acc + (stepsDone.length > 0 ? 1 : 0);
          }
          if (key.startsWith('quiz.')) {
            const quizId = key.slice('quiz.'.length);
            const saved = getItem<{ correct: boolean } | null>(`cm.quiz.${quizId}`, null);
            return acc + (saved?.correct ? 1 : 0);
          }
          return acc;
        }, 0);
        return { id: m.id, label: m.label, done, total: m.requires.length, href: m.href };
      }),
    [modules],
  );

  useEffect(() => {
    setRows(compute());
    const onStorage = () => setRows(compute());
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
      window.addEventListener('focus', onStorage);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('focus', onStorage);
      };
    }
    return undefined;
  }, [compute]);

  const totalDone = rows.reduce((a, r) => a + r.done, 0);
  const totalAll = rows.reduce((a, r) => a + r.total, 0);
  const pct = totalAll === 0 ? 0 : Math.round((totalDone / totalAll) * 100);

  return (
    <section className="cm-interactive" aria-label={title}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <strong style={{ fontSize: '1.05rem' }}>{title}</strong>
        <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>
          {totalDone}/{totalAll} · {pct}%
        </span>
      </div>

      <div className="cm-progress-bar" aria-hidden="true">
        <div className="cm-progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <ul style={{ margin: '1rem 0 0 0', padding: 0, listStyle: 'none' }}>
        {rows.map((r) => {
          const rPct = r.total === 0 ? 0 : Math.round((r.done / r.total) * 100);
          const complete = r.total > 0 && r.done === r.total;
          return (
            <li
              key={r.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.4rem 0',
                borderBottom: '1px solid var(--sl-color-gray-5)',
                fontSize: '0.9rem',
              }}
            >
              <span style={{ opacity: complete ? 0.6 : 1 }}>
                {complete ? '✓ ' : '○ '}
                {r.href ? (
                  <a href={r.href} style={{ color: 'inherit' }}>
                    {r.label}
                  </a>
                ) : (
                  r.label
                )}
              </span>
              <span style={{ opacity: 0.75, fontVariantNumeric: 'tabular-nums' }}>
                {r.done}/{r.total} · {rPct}%
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
