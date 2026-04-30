import { useEffect, useMemo, useState } from 'react';
import { getItem, setItem } from '../../lib/storage';

export interface QuizOption {
  text: string;
  correct: boolean;
  explanation: string;
}

export interface QuizProps {
  /** ID unique pour persister le résultat. Obligatoire pour retenir la réponse. */
  id: string;
  /** Scénario affiché en italique au-dessus de la question. */
  scenario?: string;
  /** Question principale. */
  question: string;
  /** Options de réponse (2 à 6). */
  options: QuizOption[];
  /**
   * Autoriser l'utilisateur à réessayer après une mauvaise réponse.
   * Défaut : true — la pédagogie repose sur l'itération, pas la note.
   */
  retry?: boolean;
}

interface SavedState {
  chosen: number;
  correct: boolean;
}

export default function Quiz({ id, scenario, question, options, retry = true }: QuizProps) {
  const storageKey = useMemo(() => `cm.quiz.${id}`, [id]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const saved = getItem<SavedState | null>(storageKey, null);
    if (saved) {
      setChosen(saved.chosen);
      setLocked(!retry || saved.correct);
    }
  }, [storageKey, retry]);

  const select = (index: number) => {
    if (locked) return;
    const opt = options[index];
    if (!opt) return;
    setChosen(index);
    const correct = opt.correct;
    if (!retry || correct) setLocked(true);
    setItem<SavedState>(storageKey, { chosen: index, correct });
  };

  const reset = () => {
    setChosen(null);
    setLocked(false);
    setItem<SavedState | null>(storageKey, null);
  };

  const chosenOption = chosen != null ? options[chosen] : null;

  return (
    <div className="cm-interactive" role="group" aria-label="Question de vérification">
      {scenario && (
        <p style={{ fontStyle: 'italic', opacity: 0.9, marginTop: 0, marginBottom: '0.75rem' }}>
          {scenario}
        </p>
      )}
      <p style={{ fontWeight: 600, margin: '0 0 1rem 0' }}>{question}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {options.map((opt, i) => {
          const isChosen = chosen === i;
          const reveal = isChosen;
          const cls = [
            'cm-button',
            reveal && opt.correct ? 'cm-answer-correct' : '',
            reveal && !opt.correct ? 'cm-answer-wrong' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => select(i)}
              disabled={locked && !isChosen}
              aria-pressed={isChosen}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              <span style={{ opacity: 0.6, marginRight: '0.5rem' }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {chosenOption && (
        <div
          className={`cm-explanation ${
            chosenOption.correct ? 'cm-explanation-correct' : 'cm-explanation-wrong'
          }`}
          role="status"
        >
          <strong>{chosenOption.correct ? '✓ Correct — ' : '✗ Pas tout à fait — '}</strong>
          {chosenOption.explanation}
        </div>
      )}

      {locked && retry && chosenOption && !chosenOption.correct && (
        <button
          type="button"
          className="cm-button"
          onClick={reset}
          style={{ marginTop: '0.75rem' }}
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
