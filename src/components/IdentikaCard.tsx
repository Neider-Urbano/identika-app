'use client';

import { useState, type MouseEvent, type Ref } from 'react';
import { PLATFORM_LABEL, type CardData, type StatIcon } from '@/lib/connectors/types';
import styles from './IdentikaCard.module.css';

interface IdentikaCardProps {
  data: CardData;
  accent: string;
  /** Se adjunta a la cara que esté visible en este momento — úsalo para exportar a PNG. */
  captureRef?: Ref<HTMLDivElement>;
}

const ICONS: Record<StatIcon, JSX.Element> = {
  repo: (
    <path d="M6 4h11a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
  ),
  star: (
    <path
      d="M12 3l2.6 5.6 6.2.6-4.7 4.1 1.4 6.1L12 16.9l-5.5 2.5 1.4-6.1L3.2 9.2l6.2-.6L12 3Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  ),
  flame: (
    <path
      d="M12 2c1 3-3 4-3 8a3 3 0 1 0 6 0c1.5 1 2.5 3 2.5 5a5.5 5.5 0 1 1-11 0C6.5 10 9 7 12 2Z"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  ),
  language: (
    <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  ),
  trophy: (
    <>
      <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M7 5H4.5A2.5 2.5 0 0 0 7 8.5" stroke="currentColor" strokeWidth={1.5} />
      <path d="M17 5h2.5A2.5 2.5 0 0 1 17 8.5" stroke="currentColor" strokeWidth={1.5} />
      <path d="M12 13v3M9.5 19.5h5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </>
  ),
  play: <path d="M8 5.5l11 6.5-11 6.5v-13Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />,
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

/** Patrón decorativo tipo QR — no es un código real, solo referencia visual al perfil. */
const QR_PATTERN = [1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1];

export function IdentikaCard({ data, accent, captureRef }: IdentikaCardProps) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hover: false });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (0.5 - py) * 12, ry: (px - 0.5) * 16, gx: px * 100, gy: py * 100, hover: true });
  }

  function handleLeave() {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, hover: false });
  }

  const transform = `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.hover ? 1.015 : 1})`;
  const glare = `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,${tilt.hover ? 0.18 : 0}), transparent 55%)`;
  const cssVars = { '--idk-accent': accent } as React.CSSProperties;

  return (
    <div className={styles.idkRoot}>
      <div
        ref={captureRef}
        className={styles.idkCard}
        style={{ ...cssVars, transform }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className={styles.idkGlow} />
        <div className={styles.idkGrain} />
        <div className={styles.idkGlare} style={{ background: glare }} />

        {side === 'front' ? (
          <>
            <div className={styles.idkBetween}>
              <div className={styles.idkMark}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
                </svg>
                <span>Identika</span>
              </div>
              <div className={styles.idkRow} style={{ gap: 10 }}>
                <span className={styles.idkChip}>{PLATFORM_LABEL[data.platform] ?? data.platform}</span>
                <span className={styles.idkVerified}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.6} />
                    <path d="M9 12.5L11 14.5L15.5 9.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verificado
                </span>
              </div>
            </div>

            <div className={styles.idkBetween} style={{ alignItems: 'flex-start' }}>
              <div className={styles.idkRow} style={{ alignItems: 'flex-start' }}>
                <div className={styles.idkAvatarWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- avatar externo, ya optimizado por GitHub */}
                  <img src={data.avatarUrl} alt={data.displayName} className={styles.idkAvatarImg} />
                </div>
                <div>
                  <div className={styles.idkName}>{data.displayName}</div>
                  <div className={styles.idkHandle}>
                    @{data.handle}
                    {data.location ? ` · ${data.location}` : ''}
                  </div>
                  <div className={styles.idkRank}>{data.rank}</div>
                </div>
              </div>
              <div className={styles.idkQrCol}>
                <div className={styles.idkQr}>
                  {QR_PATTERN.map((on, i) => (
                    <div key={i} className={on ? styles.on : undefined} />
                  ))}
                </div>
                <div className={styles.idkQrLabel}>Ver perfil</div>
              </div>
            </div>

            <div className={styles.idkStats}>
              {data.stats.map((stat) => (
                <div key={stat.key} className={styles.idkStat}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ color: 'var(--idk-accent)', flexShrink: 0 }}>
                    {ICONS[stat.icon]}
                  </svg>
                  <div>
                    <div className={styles.idkStatVal}>{stat.value}</div>
                    <div className={styles.idkStatLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles.idkBetween}>
              <div className={styles.idkMark}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
                </svg>
                <span>Identika</span>
              </div>
              <span className={styles.idkChip}>Reverso</span>
            </div>

            <div>
              <div className={styles.idkSectionTitle}>{data.breakdownTitle ?? 'Desglose'}</div>
              <div className={styles.idkLangs}>
                {(data.breakdown ?? []).map((entry) => (
                  <div key={entry.name} className={styles.idkLang}>
                    <span className={styles.idkDot} style={{ background: entry.color }} />
                    {entry.name} · {entry.percent}%
                  </div>
                ))}
                {(!data.breakdown || data.breakdown.length === 0) && (
                  <div className={styles.idkMuted}>Sin datos suficientes para este desglose todavía.</div>
                )}
              </div>
            </div>

            <div className={styles.idkLinkRow}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <path d="M10 14a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7L11 7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
                <path d="M14 10a4 4 0 0 0-5.7 0L5.7 12.6a4 4 0 0 0 5.7 5.7L13 17" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
              </svg>
              {data.profileUrl.replace('https://', '')}
            </div>

            <div className={styles.idkFooter}>
              <div className={styles.idkCode}>ID · {data.serial}</div>
              <div className={styles.idkDisclaimer}>
                Tarjeta generada a partir de datos públicos de {PLATFORM_LABEL[data.platform] ?? data.platform}.
                <br />
                No es un documento de identidad oficial.
              </div>
            </div>
          </>
        )}

        {side === 'front' && (
          <div className={styles.idkFooter}>
            <div className={styles.idkCode}>ID · {data.serial}</div>
            <div className={styles.idkDate}>Expedida {formatDate(data.issuedAt)}</div>
          </div>
        )}
      </div>

      <button type="button" className={styles.idkFlipBtn} onClick={() => setSide(side === 'front' ? 'back' : 'front')}>
        {side === 'front' ? 'Ver reverso' : 'Ver frente'}
      </button>
    </div>
  );
}
