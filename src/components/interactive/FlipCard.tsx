import { useState, useCallback, type KeyboardEvent } from 'react';

export interface FlipCardProps {
  front: string;
  back: string;
  /** Optionnel : label recto (ex: "Commande", "Flag"). */
  frontLabel?: string;
  /** Optionnel : label verso (ex: "Description", "Exemple"). */
  backLabel?: string;
}

export default function FlipCard({
  front,
  back,
  frontLabel,
  backLabel,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const toggle = useCallback(() => setFlipped((f) => !f), []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className={`cm-flipcard ${flipped ? 'is-flipped' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Retourner la carte"
      aria-pressed={flipped}
      onClick={toggle}
      onKeyDown={onKey}
    >
      <div className="cm-flipcard-inner">
        <div className="cm-flipcard-face">
          {frontLabel && (
            <span style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {frontLabel}
            </span>
          )}
          <code style={{ fontSize: '1.1rem', marginTop: '0.25rem', fontWeight: 600 }}>{front}</code>
        </div>
        <div className="cm-flipcard-face cm-flipcard-back">
          {backLabel && (
            <span style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {backLabel}
            </span>
          )}
          <span style={{ fontSize: '0.95rem', marginTop: '0.25rem', lineHeight: 1.5 }}>{back}</span>
        </div>
      </div>
    </div>
  );
}
