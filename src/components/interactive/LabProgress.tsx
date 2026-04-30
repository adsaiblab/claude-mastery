import { useEffect, useMemo, useState } from 'react';
import { getItem, setItem } from '../../lib/storage';

export interface LabStep {
  id: string;
  label: string;
  /** Instruction ou indice court pour ce step. */
  hint?: string;
}

export interface LabProgressProps {
  /** ID unique pour persister la progression (ex: "lab-01"). */
  labId: string;
  /** Titre du lab. */
  title: string;
  steps: LabStep[];
}

export default function LabProgress({ labId, title, steps }: LabProgressProps) {
  const storageKey = useMemo(() => `cm.lab.${labId}.done`, [labId]);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    const raw = getItem<string[]>(storageKey, []);
    setDone(new Set(raw));
  }, [storageKey]);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setItem<string[]>(storageKey, Array.from(next));
      return next;
    });
  };

  const reset = () => {
    setDone(new Set());
    setItem<string[]>(storageKey, []);
  };

  const count = done.size;
  const total = steps.length;
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  const complete = count === total && total > 0;

  return (
    <div className="cm-interactive" role="group" aria-label={`Progression du lab ${title}`}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <strong style={{ fontSize: '1rem' }}>{title}</strong>
        <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>
          {count}/{total} — {pct}%
        </span>
      </div>

      <div className="cm-progress-bar" aria-hidden="true">
        <div className="cm-progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <ol style={{ margin: '1rem 0 0 0', padding: 0, listStyle: 'none' }}>
        {steps.map((step) => {
          const isDone = done.has(step.id);
          return (
            <li
              key={step.id}
              style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--sl-color-gray-5)' }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggle(step.id)}
                  style={{ marginTop: '0.2rem' }}
                  aria-label={step.label}
                />
                <span
                  style={{
                    textDecoration: isDone ? 'line-through' : 'none',
                    opacity: isDone ? 0.6 : 1,
                  }}
                >
                  {step.label}
                  {step.hint && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        opacity: 0.65,
                        marginTop: '0.15rem',
                      }}
                    >
                      {step.hint}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ol>

      {complete && (
        <div
          className="cm-explanation cm-explanation-correct"
          role="status"
          style={{ marginTop: '1rem' }}
        >
          <strong>🎉 Lab complété.</strong> Lance <code>bash labs/{labId}/validate.sh</code> pour
          confirmer.
        </div>
      )}

      {count > 0 && (
        <button
          type="button"
          className="cm-button"
          onClick={reset}
          style={{ marginTop: '0.75rem' }}
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}
