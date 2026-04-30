import { useEffect, useMemo, useState } from 'react';
import { getItem, setItem, removeItem } from '../../lib/storage';

/**
 * Quiz d'orientation scoré — chaque option pondère 3 profils
 * (decouvreur, developpeur, architecte). À la fin, le profil avec
 * le plus haut score détermine le parcours recommandé.
 */

export type Profile = 'decouvreur' | 'developpeur' | 'architecte';

export interface ScoredOption {
  text: string;
  scores: Record<Profile, number>;
}

export interface OrientationQuestion {
  id: string;
  prompt: string;
  scenario?: string;
  options: ScoredOption[];
}

export interface ProfileDefinition {
  label: string;
  emoji: string;
  tagline: string;
  recommendation: string;
  path: { label: string; href: string; note: string }[];
}

export interface OrientationQuizProps {
  questions: OrientationQuestion[];
  profiles: Record<Profile, ProfileDefinition>;
  storageId?: string;
}

interface SavedState {
  answers: Record<string, number>;
  profile: Profile | null;
}

const DEFAULT_STATE: SavedState = { answers: {}, profile: null };

export default function OrientationQuiz({
  questions,
  profiles,
  storageId = 'orientation',
}: OrientationQuizProps) {
  const storageKey = useMemo(() => `cm.orientation.${storageId}`, [storageId]);
  const [state, setState] = useState<SavedState>(DEFAULT_STATE);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const saved = getItem<SavedState>(storageKey, DEFAULT_STATE);
    setState(saved);
    const answered = Object.keys(saved.answers).length;
    setCurrentIdx(Math.min(answered, questions.length));
  }, [storageKey, questions.length]);

  const answeredCount = Object.keys(state.answers).length;
  const done = answeredCount === questions.length;

  const computeProfile = (answers: Record<string, number>): Profile => {
    const totals: Record<Profile, number> = {
      decouvreur: 0,
      developpeur: 0,
      architecte: 0,
    };
    for (const q of questions) {
      const chosen = answers[q.id];
      if (chosen == null) continue;
      const opt = q.options[chosen];
      if (!opt) continue;
      for (const p of Object.keys(totals) as Profile[]) {
        totals[p] += opt.scores[p] ?? 0;
      }
    }
    const sorted = (Object.keys(totals) as Profile[]).sort((a, b) => totals[b] - totals[a]);
    return sorted[0] ?? 'decouvreur';
  };

  const answer = (qIndex: number, optIndex: number) => {
    const question = questions[qIndex];
    if (!question) return;
    const nextAnswers = { ...state.answers, [question.id]: optIndex };
    const isLast = Object.keys(nextAnswers).length === questions.length;
    const nextProfile = isLast ? computeProfile(nextAnswers) : null;
    const next: SavedState = { answers: nextAnswers, profile: nextProfile };
    setState(next);
    setItem(storageKey, next);
    setCurrentIdx((i) => Math.min(i + 1, questions.length));
  };

  const reset = () => {
    removeItem(storageKey);
    setState(DEFAULT_STATE);
    setCurrentIdx(0);
  };

  if (done && state.profile) {
    return <Result profile={state.profile} profiles={profiles} onReset={reset} />;
  }

  const question = questions[currentIdx] ?? questions[0];
  if (!question) return null;
  const chosenForCurrent = state.answers[question.id];

  return (
    <div className="cm-interactive" role="group" aria-label="Quiz d'orientation">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--sl-color-gray-2)',
        }}
      >
        <span>
          Question {currentIdx + 1} / {questions.length}
        </span>
        <div className="cm-progress-bar" style={{ width: '50%' }}>
          <div
            className="cm-progress-bar-fill"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {question.scenario && (
        <p style={{ fontStyle: 'italic', opacity: 0.9, margin: '0 0 0.5rem 0' }}>
          {question.scenario}
        </p>
      )}
      <p style={{ fontWeight: 600, margin: '0 0 1rem 0' }}>{question.prompt}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {question.options.map((opt, i) => {
          const isChosen = chosenForCurrent === i;
          return (
            <button
              key={i}
              type="button"
              className={`cm-button ${isChosen ? 'cm-button-primary' : ''}`}
              onClick={() => answer(currentIdx, i)}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button
          type="button"
          className="cm-button"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          ← Précédente
        </button>
        <button type="button" className="cm-button" onClick={reset} disabled={answeredCount === 0}>
          Recommencer
        </button>
      </div>
    </div>
  );
}

function Result({
  profile,
  profiles,
  onReset,
}: {
  profile: Profile;
  profiles: Record<Profile, ProfileDefinition>;
  onReset: () => void;
}) {
  const def = profiles[profile];
  return (
    <div className="cm-interactive" role="status" aria-live="polite">
      <div
        style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}
      >
        <span style={{ fontSize: '2rem' }}>{def.emoji}</span>
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            Ton profil
          </div>
          <h3 style={{ margin: 0 }}>{def.label}</h3>
        </div>
      </div>
      <p style={{ margin: '0 0 1rem 0', fontStyle: 'italic', opacity: 0.9 }}>{def.tagline}</p>
      <p style={{ margin: '0 0 1rem 0' }}>{def.recommendation}</p>

      <div
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.7,
          marginBottom: '0.5rem',
        }}
      >
        Ton parcours recommandé
      </div>
      <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {def.path.map((step) => (
          <li key={step.href} style={{ marginBottom: '0.5rem' }}>
            <a href={step.href} style={{ fontWeight: 600 }}>
              {step.label}
            </a>
            <span style={{ opacity: 0.75, marginLeft: '0.5rem', fontSize: '0.9rem' }}>
              — {step.note}
            </span>
          </li>
        ))}
      </ol>

      <button type="button" className="cm-button" onClick={onReset} style={{ marginTop: '1rem' }}>
        Refaire le quiz
      </button>
    </div>
  );
}
