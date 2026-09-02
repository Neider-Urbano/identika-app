'use client';

import { useRef, useState, type FormEvent } from 'react';
import { IdentikaCard } from '@/components/IdentikaCard';
import { SiteHeader } from '@/components/SiteHeader';
import { PLATFORM_LABEL, type CardData, type Platform } from '@/lib/connectors/types';
import styles from './page.module.css';

/** Plataformas con conector listo (ver src/lib/connectors/index.ts). */
const PLATFORMS: {
  id: Platform;
  placeholder: string;
  lede: string;
}[] = [
  {
    id: 'github',
    placeholder: 'ej. torvalds',
    lede:
      'Escribe un usuario de GitHub. Los datos se traen del servidor (nunca desde tu navegador) y se calculan ' +
      'en el momento: repos, estrellas, lenguaje principal y, si hay token configurado, tu racha de contribuciones.',
  },
  {
    id: 'chess',
    placeholder: 'ej. MagnusCarlsen',
    lede:
      'Escribe un usuario de Chess.com. El servidor consulta su API pública (sin login ni key) y calcula ' +
      'rating por ritmo, porcentaje de victorias, partidas jugadas y tu rango.',
  },
];

type ShareState = {
  status: 'idle' | 'sharing' | 'ready' | 'error';
  url?: string;
  message?: string;
  saved?: boolean;
};

export default function HomePage() {
  const [platform, setPlatform] = useState<Platform>('github');
  const [username, setUsername] = useState('');
  const [card, setCard] = useState<CardData | null>(null);
  const [accent, setAccent] = useState('#8b7bff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<ShareState>({ status: 'idle' });
  const captureRef = useRef<HTMLDivElement>(null);

  const active = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0]!;

  function selectPlatform(next: Platform) {
    if (next === platform) return;
    setPlatform(next);
    setCard(null);
    setError(null);
    setUsername('');
    setShare({ status: 'idle' });
  }

  function updateAccent(next: string) {
    setAccent(next);
    // El link compartido es un snapshot con el color elegido; si cambia, hay que rehacerlo.
    setShare({ status: 'idle' });
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
        /* si el navegador bloquea el portapapeles, igual mostramos el link */
      }
      setShare({ status: 'ready', url, saved: Boolean(json.saved) });
    } catch {
      setShare({ status: 'error', message: 'No se pudo conectar con el servidor.' });
    }
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

  return (
    <>
      <SiteHeader />
      <main className={styles.wrap}>
      <p className={styles.eyebrow}>Identika · Fase 1</p>
      <h1 className={styles.title}>Genera tu tarjeta</h1>
      <p className={styles.lede}>{active.lede}</p>

      <div className={styles.platformTabs} role="tablist" aria-label="Plataforma">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === platform}
            className={p.id === platform ? `${styles.platformTab} ${styles.platformTabActive}` : styles.platformTab}
            onClick={() => selectPlatform(p.id)}
          >
            {PLATFORM_LABEL[p.id]}
          </button>
        ))}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          placeholder={active.placeholder}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <button className={styles.button} type="submit" disabled={loading || !username.trim()}>
          {loading ? 'Generando…' : 'Generar tarjeta'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {card && (
        <div className={styles.result}>
          <div className={styles.controls}>
            <label className={styles.controlGroup}>
              Color de acento
              <input
                className={styles.colorInput}
                type="color"
                value={accent}
                onChange={(e) => updateAccent(e.target.value)}
              />
            </label>
            <button className={styles.downloadBtn} type="button" onClick={handleDownload}>
              Descargar PNG
            </button>
            <button
              className={styles.downloadBtn}
              type="button"
              onClick={handleShare}
              disabled={share.status === 'sharing'}
            >
              {share.status === 'sharing'
                ? 'Creando link…'
                : share.status === 'ready'
                  ? '✓ Link copiado'
                  : 'Compartir'}
            </button>
          </div>

          {share.status === 'ready' && share.url && (
            <div className={styles.shareBox}>
              <a className={styles.shareLink} href={share.url} target="_blank" rel="noreferrer">
                {share.url.replace(/^https?:\/\//, '')}
              </a>
              {share.saved && <span className={styles.footerNote}>Guardada en «Mis tarjetas».</span>}
            </div>
          )}
          {share.status === 'error' && <div className={styles.error}>{share.message}</div>}

          <IdentikaCard data={card} accent={accent} captureRef={captureRef} />

          {platform === 'github' && (
            <p className={styles.footerNote}>
              Sin GITHUB_TOKEN configurado, la stat de racha no aparece porque requiere autenticación —
              ver .env.local.example.
            </p>
          )}
        </div>
      )}
      </main>
    </>
  );
}
