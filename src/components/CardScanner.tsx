'use client';

import { useEffect, useState, type Ref } from 'react';
import { IdentikaCard } from './IdentikaCard';
import type { CardData } from '@/lib/connectors/types';
import styles from './CardScanner.module.css';

interface CardScannerProps {
  data: CardData;
  accent: string;
  /** Cambia este valor (p.ej. el serial) para relanzar el barrido de escaneo. */
  scanId: string;
  /** true = tarjeta de muestra a medio revelar con la línea en reposo. */
  idle?: boolean;
  captureRef?: Ref<HTMLDivElement>;
}

type Phase = 'scanning' | 'settled';

export function CardScanner({ data, accent, scanId, idle = false, captureRef }: CardScannerProps) {
  const [phase, setPhase] = useState<Phase>(idle ? 'settled' : 'scanning');

  useEffect(() => {
    if (idle) {
      setPhase('settled');
      return;
    }
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase(reduce ? 'settled' : 'scanning');
    // Red de seguridad: si onAnimationEnd no dispara (pestaña en segundo plano,
    // animación throttled), la tarjeta nunca debe quedarse oculta.
    const t = setTimeout(() => setPhase('settled'), 1500);
    return () => clearTimeout(t);
  }, [scanId, idle]);

  const scanning = phase === 'scanning' && !idle;

  return (
    <div className={styles.chamber} style={{ '--scan-accent': accent } as React.CSSProperties}>
      <div className={styles.bracket} data-corner="tl" aria-hidden />
      <div className={styles.bracket} data-corner="tr" aria-hidden />
      <div className={styles.bracket} data-corner="bl" aria-hidden />
      <div className={styles.bracket} data-corner="br" aria-hidden />

      <div
        key={scanId}
        className={
          idle
            ? `${styles.reveal} ${styles.idle}`
            : scanning
              ? `${styles.reveal} ${styles.revealing}`
              : styles.reveal
        }
        onAnimationEnd={() => setPhase('settled')}
      >
        <IdentikaCard data={data} accent={accent} captureRef={captureRef} />
      </div>

      {idle && <div className={styles.restLine} aria-hidden />}
      {scanning && <div key={`line-${scanId}`} className={styles.scanline} aria-hidden />}
    </div>
  );
}
