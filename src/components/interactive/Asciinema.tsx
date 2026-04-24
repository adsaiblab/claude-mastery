import { useEffect, useRef, useState } from 'react';

export interface AsciinemaProps {
  /**
   * URL relative ou absolue du fichier .cast.
   * Si le fichier n'existe pas encore, un bloc "à enregistrer"
   * s'affiche avec les instructions — aucun placeholder vide silencieux.
   */
  src: string;
  /** Titre affiché au-dessus du player. */
  title?: string;
  /** Durée estimée de la démo (ex: "3m 20s"). */
  duration?: string;
  /** Autoplay au chargement. */
  autoPlay?: boolean;
  /** Facteur de vitesse initial (1 = vitesse réelle). */
  speed?: number;
  /** Hauteur CSS du player (ex: "400px"). */
  height?: string;
  /** Commande de référence pour enregistrer la cast si elle n'existe pas. */
  recordHint?: string;
}

interface PlayerApi {
  dispose?: () => void;
}

type AsciinemaModule = {
  create: (src: string, element: HTMLElement, opts: Record<string, unknown>) => PlayerApi;
};

/**
 * Wrapper du player asciinema-player (chargé dynamiquement côté client).
 *
 * Comportement :
 *   - Si `src` est accessible (HTTP 200) → instancie le player.
 *   - Sinon → affiche le bloc "À enregistrer" avec commande rec suggérée.
 *
 * La librairie npm `asciinema-player` est chargée à la demande via ESM CDN
 * pour éviter un coût bundle sur les pages sans démo.
 */
export default function Asciinema({
  src,
  title,
  duration,
  autoPlay = false,
  speed = 1,
  height = '400px',
  recordHint,
}: AsciinemaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let disposed = false;
    let player: PlayerApi | undefined;

    const probe = async () => {
      try {
        const head = await fetch(src, { method: 'HEAD' });
        if (!head.ok) {
          setStatus('missing');
          return;
        }
      } catch (err) {
        setStatus('missing');
        return;
      }

      try {
        const mod = (await import(
          // @ts-expect-error — remote ESM module, no static types
          /* @vite-ignore */ 'https://esm.sh/asciinema-player@3.8.1'
        )) as AsciinemaModule;
        if (disposed || !containerRef.current) return;
        player = mod.create(src, containerRef.current, {
          autoPlay,
          speed,
          idleTimeLimit: 2,
          theme: 'monokai',
          fit: 'width',
        });
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
    };

    probe();

    return () => {
      disposed = true;
      try {
        player?.dispose?.();
      } catch {
        /* ignore */
      }
    };
  }, [src, autoPlay, speed]);

  return (
    <figure className="cm-asciinema" style={{ margin: '1.5rem 0' }}>
      {title && (
        <figcaption
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--sl-color-gray-2)',
            borderBottom: '1px solid var(--cm-terminal-border)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{title}</span>
          {duration && <span>⏱ {duration}</span>}
        </figcaption>
      )}

      {status === 'ready' && <div ref={containerRef} style={{ minHeight: height }} />}
      {status === 'loading' && (
        <div className="cm-asciinema-placeholder">Chargement du player…</div>
      )}
      {status === 'missing' && (
        <div className="cm-asciinema-placeholder" role="note">
          <strong>⚠️ Enregistrement terminal à produire</strong>
          <br />
          <span>
            Fichier attendu : <code>{src}</code>
          </span>
          <br />
          <br />
          {recordHint ? (
            <>
              Commande suggérée :<br />
              <code>{recordHint}</code>
            </>
          ) : (
            <>
              Lance : <code>asciinema rec public/casts/NOM.cast</code>, puis rejoue la session à
              documenter.
            </>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="cm-asciinema-placeholder" role="alert" style={{ color: 'var(--cm-danger-fg)' }}>
          Erreur du player : {errorMessage}
        </div>
      )}
    </figure>
  );
}
