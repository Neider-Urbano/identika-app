'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CardScanner } from '@/components/CardScanner';
import { EXAMPLE_CARDS } from '@/lib/example-cards';
import { PLATFORM_LABEL, type CardData, type Platform } from '@/lib/connectors/types';
import styles from './CardGenerator.module.css';

const PLATFORMS: { id: Platform; placeholder: string }[] = [
  { id: 'github', placeholder: 'ej. torvalds' },
  { id: 'chess', placeholder: 'ej. MagnusCarlsen' },
];

type ShareState = {
  status: 'idle' | 'sharing' | 'ready' | 'error';
  url?: string;
  message?: string;
  saved?: boolean;
};

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * `context: 'home'` es la prueba pre-registro (compartir crea un link anónimo).
 * `context: 'app'` es para usuarios con sesión (la tarjeta queda en Mis tarjetas).
 */
export function CardGenerator({ context = 'home' }: { context?: 'home' | 'app' }) {
  const [platform, setPlatform] = useState<Platform>('github');
  const [username, setUsername] = useState('');
  const [card, setCard] = useState<CardData | null>(null);
  const [accent, setAccent] = useState('#8b7bff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<ShareState>({ status: 'idle' });
  const [idleIndex, setIdleIndex] = useState(0);
  const captureRef = useRef<HTMLDivElement>(null);

  const active = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0]!;

  useEffect(() => {
    if (card) return;
    const t = setInterval(() => setIdleIndex((i) => (i + 1) % EXAMPLE_CARDS.length), 6000);
    return () => clearInterval(t);
  }, [card]);

  function selectPlatform(next: Platform) {
    if (next === platform) return;
    setPlatform(next);
    setError(null);
    setUsername('');
    setShare({ status: 'idle' });
  }

  function updateAccent(next: string) {
    setAccent(next);
    setShare({ status: 'idle' });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/card/${platform}?user=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'No se pudo generar la tarjeta.');
        setCard(null);
        return;
      }
      setCard(json as CardData);
      setAccent((json as CardData).suggestedAccent);
      setShare({ status: 'idle' });
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      setCard(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!captureRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(captureRef.current, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `identika-${card?.handle ?? 'tarjeta'}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function handleShare() {
    if (!card) return;
    setShare({ status: 'sharing' });
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card, accent }),
      });
      const json = await res.json();
      if (!res.ok) {
        setShare({ status: 'error', message: json.error ?? 'No se pudo crear el link.' });
        return;
      }
      const url = `${window.location.origin}/c/${json.slug}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* portapapeles bloqueado: igual mostramos el link */
      }
      setShare({ status: 'ready', url, saved: Boolean(json.saved) });
    } catch {
      setShare({ status: 'error', message: 'No se pudo conectar con el servidor.' });
    }
  }

  const idleExample = EXAMPLE_CARDS[idleIndex]!;
  const shareLabel = context === 'app' ? 'Guardar y compartir' : 'Compartir';

  return (
    <div className={styles.root}>
      <form className={styles.slot} onSubmit={handleSubmit}>
        <div className={styles.tabs} role="tablist" aria-label="Plataforma">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={p.id === platform}
              className={p.id === platform ? `${styles.tab} ${styles.tabOn}` : styles.tab}
              onClick={() => selectPlatform(p.id)}
            >
              {PLATFORM_LABEL[p.id]}
            </button>
          ))}
        </div>
        <div className={styles.slotRow}>
          <input
            className={styles.input}
            placeholder={active.placeholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label={`Usuario de ${PLATFORM_LABEL[platform]}`}
          />
          <button className={styles.go} type="submit" disabled={loading || !username.trim()}>
            {loading ? 'Leyendo…' : 'Generar'}
          </button>
        </div>
      </form>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.stage}>
        {card ? (
          <CardScanner data={card} accent={accent} scanId={card.serial} captureRef={captureRef} />
        ) : (
          <CardScanner
            data={idleExample.card}
            accent={idleExample.accent}
            scanId={`idle-${idleIndex}`}
            idle
          />
        )}
      </div>

      {!card && (
        <p className={styles.previewNote}>
          Ejemplo. Escribe tu usuario arriba para generar la tuya.
        </p>
      )}

      {card && (
        <div className={styles.tools}>
          <label className={styles.swatch}>
            <span>Acento</span>
            <input type="color" value={accent} onChange={(e) => updateAccent(e.target.value)} />
          </label>
          <button type="button" className={styles.toolBtn} onClick={handleDownload}>
            Descargar PNG
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleShare}
            disabled={share.status === 'sharing'}
          >
            {share.status === 'sharing'
              ? 'Guardando…'
              : share.status === 'ready'
                ? 'Link copiado'
                : shareLabel}
            {share.status === 'ready' && <CheckIcon />}
          </button>
        </div>
      )}

      {card && share.status === 'ready' && share.url && (
        <p className={styles.shareOut}>
          <a href={share.url} target="_blank" rel="noreferrer">
            {share.url.replace(/^https?:\/\//, '')}
          </a>
          {share.saved ? (
            <Link href="/mis-tarjetas" className={styles.savedNote}>
              Guardada en Mis tarjetas →
            </Link>
          ) : (
            context === 'home' && (
              <span className={styles.savedNote}>
                <Link href="/entrar?next=/mis-tarjetas">Entra</Link> para guardarla en tu cuenta.
              </span>
            )
          )}
        </p>
      )}
      {card && share.status === 'error' && (
        <p className={styles.error} role="alert">{share.message}</p>
      )}

      {card && platform === 'github' && (
        <p className={styles.hint}>
          Sin <code>GITHUB_TOKEN</code> configurado no aparece la stat de racha — requiere
          autenticación con GitHub.
        </p>
      )}
    </div>
  );
}
