import { useEffect, useMemo, useState } from 'react';
import { getItem, setItem } from '../../lib/storage';

export interface TradeoffApproach {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface ArchitectureChallengeProps {
  /** ID unique pour persister la réponse de l'utilisateur. */
  id: string;
  context: string;
  /** Contraintes affichées en liste (budget tokens, équipe, délai). */
  constraints: string[];
  /** Invite de réflexion affichée au-dessus du textarea. */
  prompt?: string;
  /** 2 à 4 approches proposées, avec trade-offs explicites. Pas de "bonne réponse". */
  approaches: TradeoffApproach[];
}

export default function ArchitectureChallenge({
  id,
  context,
  constraints,
  prompt = 'Décris ton architecture. Quels agents ? Quels hooks ? Quel budget de contexte ?',
  approaches,
}: ArchitectureChallengeProps) {
  const storageKey = useMemo(() => `cm.arch.${id}`, [id]);
  const [draft, setDraft] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setDraft(getItem<string>(`${storageKey}.draft`, ''));
    setRevealed(getItem<boolean>(`${storageKey}.revealed`, false));
  }, [storageKey]);

  const onChange = (value: string) => {
    setDraft(value);
    setItem<string>(`${storageKey}.draft`, value);
  };

  const reveal = () => {
    setRevealed(true);
    setItem<boolean>(`${storageKey}.revealed`, true);
  };

  return (
    <div className="cm-interactive" role="group" aria-label="Défi d'architecture">
      <p style={{ marginTop: 0, marginBottom: '0.75rem', lineHeight: 1.6 }}>{context}</p>

      {constraints.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ fontSize: '0.85rem', opacity: 0.7, letterSpacing: '0.05em' }}>
            CONTRAINTES
          </strong>
          <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, fontSize: '0.9rem' }}>
            {constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.25rem' }}>
        {prompt}
      </label>
      <textarea
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ton architecture ici…"
        rows={6}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--sl-color-gray-4)',
          background: 'var(--sl-color-gray-6)',
          color: 'var(--sl-color-white)',
          fontFamily: 'var(--sl-font-mono)',
          fontSize: '0.9rem',
          resize: 'vertical',
        }}
      />

      {!revealed ? (
        <button
          type="button"
          className="cm-button cm-button-primary"
          onClick={reveal}
          disabled={draft.trim().length < 20}
          style={{ marginTop: '0.75rem' }}
        >
          Voir 3 approches proposées
        </button>
      ) : (
        <div style={{ marginTop: '1.25rem' }}>
          <strong style={{ fontSize: '0.85rem', opacity: 0.7, letterSpacing: '0.05em' }}>
            APPROCHES POSSIBLES — aucune "bonne réponse"
          </strong>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '0.5rem' }}>
            {approaches.map((a, i) => (
              <div key={i} className="concept-card">
                <h3 style={{ marginBottom: '0.5rem' }}>{a.title}</h3>
                <p style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  {a.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ color: 'var(--cm-success-fg)' }}>+ Pour</strong>
                    <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                      {a.pros.map((p, j) => (
                        <li key={j}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--cm-danger-fg)' }}>− Contre</strong>
                    <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                      {a.cons.map((c, j) => (
                        <li key={j}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
